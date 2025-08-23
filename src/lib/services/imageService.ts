import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type GeneratedImage = Database['public']['Tables']['generated_images']['Row']
type GeneratedImageInsert =
  Database['public']['Tables']['generated_images']['Insert']
type GeneratedImageUpdate =
  Database['public']['Tables']['generated_images']['Update']

export interface CreateImageData {
  project_id?: string
  prompt: string
  model_used: string
  image_url: string
  style?: string
  size?: string
  is_favorite?: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface UpdateImageData {
  prompt?: string
  style?: string
  size?: string
  is_favorite?: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface ImageGenerationRequest {
  prompt: string
  model?: 'flux-schnell' | 'imagen3' | 'flux-context'
  style?: string
  count?: number
  size?: 'square' | 'portrait' | 'landscape' | string
  quality?: 'fast' | 'balanced' | 'high'
  project_id?: string
  reference_image?: File
  seed?: number
  steps?: number
  guidance?: number
}

export interface GenerationProgress {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  message: string
  estimatedTime?: number
}

export interface ImageProcessingOptions {
  optimize?: boolean
  watermark?: boolean
  format?: 'webp' | 'jpeg' | 'png'
  quality?: number
}

export interface ImageListFilters {
  project_id?: string
  model_used?: string
  style?: string
  is_favorite?: boolean
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

export interface ImageServiceResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export interface ImageWithStats extends GeneratedImage {
  download_count?: number
  usage_count?: number
}

export interface ImageGenerationResult {
  id: string
  images: CreateImageData[]
  total_cost: number
  generation_time: number
  model_used: string
  progress: GenerationProgress
}

export interface UsageLimits {
  daily_limit: number
  daily_used: number
  monthly_limit: number
  monthly_used: number
  cost_limit: number
  cost_used: number
}

export interface CostStatistics {
  totalCost: number
  imageCount: number
  averageCostPerImage: number
  byModel: Record<string, { count: number; cost: number }>
}

// 모델별 기본 매개변수
const MODEL_DEFAULTS = {
  'flux-schnell': {
    steps: 8,
    guidance: 7.5,
    defaultSize: { width: 1024, height: 1024 },
    cost_per_image: 0.02,
  },
  imagen3: {
    steps: 20,
    guidance: 12,
    defaultSize: { width: 1024, height: 1024 },
    cost_per_image: 0.05,
  },
  'flux-context': {
    steps: 12,
    guidance: 8,
    defaultSize: { width: 1024, height: 1024 },
    cost_per_image: 0.03,
  },
}

// 사이즈 매핑
const SIZE_MAPPINGS = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
}

// 생성 대기열
const generationQueue = new Map<string, GenerationProgress>()
let currentGenerations = 0
const maxConcurrentGenerations = 3

export class ImageService {
  // 이미지 생성 대기열에 추가
  static async queueImageGeneration(
    request: ImageGenerationRequest
  ): Promise<
    ImageServiceResponse<{ generationId: string; estimatedTime: number }>
  > {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to generate images',
          success: false,
        }
      }

      // 사용량 제한 확인
      const usageLimits = await this.checkUsageLimits(
        user.id,
        request.count || 1
      )
      if (!usageLimits.allowed) {
        return {
          data: null,
          error: `Usage limit exceeded. Daily remaining: ${usageLimits.daily_remaining}`,
          success: false,
        }
      }

      // 생성 ID 생성
      const generationId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 참조 이미지가 있으면 모델 자동 선택
      const finalRequest = { ...request }
      if (request.reference_image) {
        const analysis = await this.analyzeReferenceImage(
          request.reference_image
        )
        if (analysis.hasReference) {
          finalRequest.model = 'flux-context'
        }
      }

      // 모델 최적화
      const model = finalRequest.model || this.selectOptimalModel(finalRequest)
      finalRequest.model = model

      // 프롬프트 최적화
      finalRequest.prompt = this.optimizePrompt(
        finalRequest.prompt,
        model as 'flux-schnell' | 'imagen3' | 'flux-context',
        finalRequest.style
      )

      // 예상 시간 계산
      const estimatedTime = this.estimateGenerationTime(
        model,
        finalRequest.count || 1
      )

      // 대기열에 추가
      const progress: GenerationProgress = {
        id: generationId,
        status: 'queued',
        progress: 0,
        message: '생성 대기 중...',
        estimatedTime,
      }

      generationQueue.set(generationId, progress)

      // 비동기로 생성 프로세스 시작
      this.processGeneration(generationId, finalRequest, user.id)

      return {
        data: {
          generationId,
          estimatedTime,
        },
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  // 기존 generateImages 메서드는 직접 생성용으로 유지
  static async generateImages(
    request: ImageGenerationRequest
  ): Promise<ImageServiceResponse<ImageGenerationResult>> {
    try {
      const queueResult = await this.queueImageGeneration(request)
      if (!queueResult.success || !queueResult.data) {
        return {
          data: null,
          error: queueResult.error,
          success: false,
        }
      }

      const { generationId } = queueResult.data

      // 생성 완료까지 대기
      return await this.waitForGeneration(generationId)
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async createImage(
    imageData: CreateImageData
  ): Promise<ImageServiceResponse<GeneratedImage>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to create image',
          success: false,
        }
      }

      const insertData: GeneratedImageInsert = {
        user_id: user.id,
        project_id: imageData.project_id,
        prompt: imageData.prompt,
        model_used: imageData.model_used,
        image_url: imageData.image_url,
        style: imageData.style,
        size: imageData.size,
        is_favorite: imageData.is_favorite || false,
        tags: imageData.tags || [],
        metadata: imageData.metadata || {},
      }

      const { data: newImage, error: insertError } = await supabase
        .from('generated_images')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to create image: ${insertError.message}`,
          success: false,
        }
      }

      return {
        data: newImage,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getImageById(
    imageId: string
  ): Promise<ImageServiceResponse<ImageWithStats>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      const { data: image, error: imageError } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (imageError) {
        return {
          data: null,
          error: `Failed to fetch image: ${imageError.message}`,
          success: false,
        }
      }

      // Add stats (mock data for now)
      const imageWithStats: ImageWithStats = {
        ...image,
        download_count: image.metadata?.download_count || 0,
        usage_count: image.metadata?.usage_count || 0,
      }

      return {
        data: imageWithStats,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async updateImage(
    imageId: string,
    updates: UpdateImageData
  ): Promise<ImageServiceResponse<GeneratedImage>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update image',
          success: false,
        }
      }

      const updateData: GeneratedImageUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedImage, error: updateError } = await supabase
        .from('generated_images')
        .update(updateData)
        .eq('id', imageId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update image: ${updateError.message}`,
          success: false,
        }
      }

      // Log the activity
      await this.logImageActivity(user.id, 'image_updated', {
        image_id: imageId,
        updates,
      })

      return {
        data: updatedImage,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async deleteImage(
    imageId: string
  ): Promise<ImageServiceResponse<boolean>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to delete image',
          success: false,
        }
      }

      // Get image details for cleanup and logging
      const { data: image } = await supabase
        .from('generated_images')
        .select('prompt, image_url, metadata')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (image) {
        // Delete file from storage if it's stored locally
        const storagePath = image.metadata?.storage_path
        if (storagePath) {
          await supabase.storage
            .from('generated-images')
            .remove([storagePath])
            .catch(console.error)
        }

        // Log the deletion before actually deleting
        await this.logImageActivity(user.id, 'image_deleted', {
          image_id: imageId,
          prompt: image.prompt,
        })
      }

      const { error: deleteError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id)

      if (deleteError) {
        return {
          data: null,
          error: `Failed to delete image: ${deleteError.message}`,
          success: false,
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async listImages(
    filters: ImageListFilters = {}
  ): Promise<ImageServiceResponse<ImageWithStats[]>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      let query = supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)

      // Apply filters
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }

      if (filters.model_used) {
        query = query.eq('model_used', filters.model_used)
      }

      if (filters.style) {
        query = query.eq('style', filters.style)
      }

      if (filters.is_favorite !== undefined) {
        query = query.eq('is_favorite', filters.is_favorite)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.search) {
        query = query.ilike('prompt', `%${filters.search}%`)
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false })

      const { data: images, error: imagesError } = await query

      if (imagesError) {
        return {
          data: null,
          error: `Failed to fetch images: ${imagesError.message}`,
          success: false,
        }
      }

      // Enhance images with stats
      const imagesWithStats: ImageWithStats[] = (images || []).map(image => ({
        ...image,
        download_count: image.metadata?.download_count || 0,
        usage_count: image.metadata?.usage_count || 0,
      }))

      return {
        data: imagesWithStats,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async toggleFavorite(
    imageId: string
  ): Promise<ImageServiceResponse<GeneratedImage>> {
    try {
      const imageResult = await this.getImageById(imageId)

      if (!imageResult.success || !imageResult.data) {
        return {
          data: null,
          error: imageResult.error || 'Image not found',
          success: false,
        }
      }

      return this.updateImage(imageId, {
        is_favorite: !imageResult.data.is_favorite,
      })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async addImageTag(
    imageId: string,
    tag: string
  ): Promise<ImageServiceResponse<GeneratedImage>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Get current image
      const { data: image, error: fetchError } = await supabase
        .from('generated_images')
        .select('tags')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch image: ${fetchError.message}`,
          success: false,
        }
      }

      const currentTags = image.tags || []
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag]
        return this.updateImage(imageId, { tags: updatedTags })
      }

      // Tag already exists, return current image
      const currentImageResult = await this.getImageById(imageId)
      return currentImageResult
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async removeImageTag(
    imageId: string,
    tag: string
  ): Promise<ImageServiceResponse<GeneratedImage>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Get current image
      const { data: image, error: fetchError } = await supabase
        .from('generated_images')
        .select('tags')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch image: ${fetchError.message}`,
          success: false,
        }
      }

      const currentTags = image.tags || []
      const updatedTags = currentTags.filter((t: string) => t !== tag)

      return this.updateImage(imageId, { tags: updatedTags })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getFavoriteImages(): Promise<
    ImageServiceResponse<ImageWithStats[]>
  > {
    return this.listImages({ is_favorite: true })
  }

  static async getImagesByProject(
    projectId: string
  ): Promise<ImageServiceResponse<ImageWithStats[]>> {
    return this.listImages({ project_id: projectId })
  }

  static async getImagesByModel(
    model: string
  ): Promise<ImageServiceResponse<ImageWithStats[]>> {
    return this.listImages({ model_used: model })
  }

  static async searchImages(
    searchTerm: string
  ): Promise<ImageServiceResponse<ImageWithStats[]>> {
    return this.listImages({ search: searchTerm })
  }

  // 생성 진행 상태 조회
  static getGenerationProgress(
    generationId: string
  ): GenerationProgress | null {
    return generationQueue.get(generationId) || null
  }

  // 생성 완료까지 대기
  private static async waitForGeneration(
    generationId: string
  ): Promise<ImageServiceResponse<ImageGenerationResult>> {
    return new Promise(resolve => {
      const checkStatus = () => {
        const progress = generationQueue.get(generationId)
        if (!progress) {
          resolve({
            data: null,
            error: 'Generation not found',
            success: false,
          })
          return
        }

        if (progress.status === 'completed') {
          // 실제 구현에서는 데이터베이스에서 결과 조회
          resolve({
            data: {
              id: generationId,
              images: [],
              total_cost: 0,
              generation_time: 0,
              model_used: 'flux-schnell',
              progress,
            },
            error: null,
            success: true,
          })
        } else if (progress.status === 'failed') {
          resolve({
            data: null,
            error: progress.message,
            success: false,
          })
        } else {
          setTimeout(checkStatus, 1000)
        }
      }
      checkStatus()
    })
  }

  // 사용량 제한 확인
  private static async checkUsageLimits(
    userId: string,
    requestedCount: number
  ): Promise<{
    allowed: boolean
    daily_remaining: number
    monthly_remaining: number
    cost_remaining: number
  }> {
    try {
      // 실제 구현에서는 데이터베이스에서 사용량 조회
      // 임시로 허용된 것으로 반환
      return {
        allowed: true,
        daily_remaining: 50 - requestedCount,
        monthly_remaining: 1000 - requestedCount,
        cost_remaining: 10.0,
      }
    } catch (error) {
      return {
        allowed: false,
        daily_remaining: 0,
        monthly_remaining: 0,
        cost_remaining: 0,
      }
    }
  }

  // 참조 이미지 분석
  private static async analyzeReferenceImage(_file: File): Promise<{
    hasReference: boolean
    suggestedModel: string
    extractedStyle: string
  }> {
    // 참조 이미지가 있으면 Flux Context 모델 자동 선택
    return {
      hasReference: true,
      suggestedModel: 'flux-context',
      extractedStyle: 'consistent style based on reference',
    }
  }

  // 프롬프트 최적화
  private static optimizePrompt(
    prompt: string,
    model: string,
    style?: string
  ): string {
    let optimizedPrompt = prompt.trim()

    // 기본 품질 개선 키워드 추가
    const qualityKeywords = {
      'flux-schnell': 'high quality, detailed, sharp focus',
      imagen3: 'photorealistic, high resolution, professional',
      'flux-context': 'consistent style, high quality, detailed',
    }

    // 스타일 적용
    if (style && style !== 'none') {
      const stylePrompts = {
        photorealistic: 'photorealistic, professional photography, high detail',
        artistic: 'artistic, creative, stylized, beautiful composition',
        anime: 'anime style, manga, japanese art, vibrant colors',
        digital_art: 'digital art, concept art, detailed illustration',
        oil_painting:
          'oil painting style, classical art, textured brushstrokes',
        watercolor: 'watercolor painting, soft colors, artistic medium',
      }

      if (stylePrompts[style as keyof typeof stylePrompts]) {
        optimizedPrompt = `${optimizedPrompt}, ${stylePrompts[style as keyof typeof stylePrompts]}`
      }
    }

    // 모델별 최적화
    optimizedPrompt += `, ${qualityKeywords[model as keyof typeof qualityKeywords]}`

    return optimizedPrompt
  }

  // 생성 시간 추정
  private static estimateGenerationTime(model: string, count: number): number {
    const baseTime = {
      'flux-schnell': 5, // 5초
      imagen3: 15, // 15초
      'flux-context': 12, // 12초
    }

    return (baseTime[model as keyof typeof baseTime] || 10) * count
  }

  // 비용 계산
  private static calculateCost(
    model: string,
    count: number,
    quality: string = 'balanced'
  ): number {
    const baseCost =
      MODEL_DEFAULTS[model as keyof typeof MODEL_DEFAULTS]?.cost_per_image ||
      0.02
    const qualityMultiplier = {
      fast: 1.0,
      balanced: 1.2,
      high: 1.5,
    }

    return (
      baseCost *
      count *
      (qualityMultiplier[quality as keyof typeof qualityMultiplier] || 1.0)
    )
  }

  // 생성 프로세스 처리
  private static async processGeneration(
    generationId: string,
    request: ImageGenerationRequest,
    userId: string
  ) {
    const progress = generationQueue.get(generationId)
    if (!progress) return

    try {
      // 동시 생성 수 제한
      if (currentGenerations >= maxConcurrentGenerations) {
        progress.status = 'queued'
        progress.message = '다른 생성 작업 완료 대기 중...'
        await this.waitForSlot()
      }

      currentGenerations++
      progress.status = 'processing'
      progress.message = '이미지 생성 중...'
      progress.progress = 10

      generationQueue.set(generationId, progress)

      // 모델별 API 호출
      const result = await this.callAdvancedGenerationAPI(
        request,
        (progressValue: number) => {
          const currentProgress = generationQueue.get(generationId)
          if (currentProgress) {
            currentProgress.progress = Math.min(progressValue, 95)
            generationQueue.set(generationId, currentProgress)
          }
        }
      )

      // 이미지 후처리
      const processedResult = await this.postProcessImages(result, request)

      // 완료 상태 업데이트
      progress.status = 'completed'
      progress.progress = 100
      progress.message = '생성 완료'
      generationQueue.set(generationId, progress)

      // 결과를 데이터베이스에 저장
      await this.saveGenerationResult(
        generationId,
        processedResult,
        request,
        userId
      )
    } catch (error) {
      progress.status = 'failed'
      progress.message = `생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      generationQueue.set(generationId, progress)
    } finally {
      currentGenerations--
    }
  }

  // 슬롯 대기
  private static async waitForSlot(): Promise<void> {
    return new Promise(resolve => {
      const checkSlot = () => {
        if (currentGenerations < maxConcurrentGenerations) {
          resolve()
        } else {
          setTimeout(checkSlot, 1000)
        }
      }
      checkSlot()
    })
  }

  private static selectOptimalModel(request: ImageGenerationRequest): string {
    // If reference image is provided, use flux-context for consistency
    if (request.reference_image) {
      return 'flux-context'
    }

    // For high-quality requirements, use imagen3
    if (request.style === 'photographic' || request.style === 'realistic') {
      return 'imagen3'
    }

    // Default to flux-schnell for speed and cost efficiency
    return 'flux-schnell'
  }

  // 고도화된 이미지 생성 API 호출
  private static async callAdvancedGenerationAPI(
    request: ImageGenerationRequest,
    onProgress: (progress: number) => void
  ): Promise<CreateImageData[]> {
    onProgress(30)

    // 실제 구현에서는 각 모델의 API를 호출
    switch (request.model) {
      case 'flux-schnell':
        return await this.callFluxSchnellAPI(request, onProgress)
      case 'imagen3':
        return await this.callImagen3API(request, onProgress)
      case 'flux-context':
        return await this.callFluxContextAPI(request, onProgress)
      default:
        throw new Error(`Unsupported model: ${request.model}`)
    }
  }

  // Flux Schnell API 호출
  private static async callFluxSchnellAPI(
    request: ImageGenerationRequest,
    onProgress: (progress: number) => void
  ): Promise<CreateImageData[]> {
    onProgress(50)

    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 3000))
    onProgress(90)

    const results: CreateImageData[] = []
    const count = request.count || 1

    for (let i = 0; i < count; i++) {
      const size =
        SIZE_MAPPINGS[request.size as keyof typeof SIZE_MAPPINGS] ||
        SIZE_MAPPINGS.square
      results.push({
        project_id: request.project_id,
        prompt: request.prompt,
        model_used: 'flux-schnell',
        image_url: `/api/images/placeholder?model=flux-schnell&prompt=${encodeURIComponent(request.prompt)}&index=${i}`,
        style: request.style || 'default',
        size: `${size.width}x${size.height}`,
        is_favorite: false,
        tags: [],
        metadata: {
          size: `${size.width}x${size.height}`,
          format: 'webp',
          generated_at: new Date().toISOString(),
          cost: this.calculateCost(
            'flux-schnell',
            1,
            request.quality || 'balanced'
          ),
          processing_time: 3.2,
          model_settings: {
            steps: request.steps || MODEL_DEFAULTS['flux-schnell'].steps,
            guidance:
              request.guidance || MODEL_DEFAULTS['flux-schnell'].guidance,
            seed: request.seed,
          },
        },
      })
    }

    return results
  }

  // Imagen3 API 호출
  private static async callImagen3API(
    request: ImageGenerationRequest,
    onProgress: (progress: number) => void
  ): Promise<CreateImageData[]> {
    onProgress(50)

    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 8000))
    onProgress(90)

    const results: CreateImageData[] = []
    const count = request.count || 1

    for (let i = 0; i < count; i++) {
      const size =
        SIZE_MAPPINGS[request.size as keyof typeof SIZE_MAPPINGS] ||
        SIZE_MAPPINGS.square
      results.push({
        project_id: request.project_id,
        prompt: request.prompt,
        model_used: 'imagen3',
        image_url: `/api/images/placeholder?model=imagen3&prompt=${encodeURIComponent(request.prompt)}&index=${i}`,
        style: request.style || 'photorealistic',
        size: `${size.width}x${size.height}`,
        is_favorite: false,
        tags: [],
        metadata: {
          size: `${size.width}x${size.height}`,
          format: 'webp',
          generated_at: new Date().toISOString(),
          cost: this.calculateCost('imagen3', 1, request.quality || 'balanced'),
          processing_time: 8.5,
          model_settings: {
            steps: request.steps || MODEL_DEFAULTS['imagen3'].steps,
            guidance: request.guidance || MODEL_DEFAULTS['imagen3'].guidance,
            seed: request.seed,
          },
        },
      })
    }

    return results
  }

  // Flux Context API 호출 (참조 이미지 기반)
  private static async callFluxContextAPI(
    request: ImageGenerationRequest,
    onProgress: (progress: number) => void
  ): Promise<CreateImageData[]> {
    onProgress(50)

    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 5000))
    onProgress(90)

    const results: CreateImageData[] = []
    const count = request.count || 1

    for (let i = 0; i < count; i++) {
      const size =
        SIZE_MAPPINGS[request.size as keyof typeof SIZE_MAPPINGS] ||
        SIZE_MAPPINGS.square
      results.push({
        project_id: request.project_id,
        prompt: request.prompt,
        model_used: 'flux-context',
        image_url: `/api/images/placeholder?model=flux-context&prompt=${encodeURIComponent(request.prompt)}&index=${i}`,
        style: request.style || 'consistent',
        size: `${size.width}x${size.height}`,
        is_favorite: false,
        tags: [],
        metadata: {
          size: `${size.width}x${size.height}`,
          format: 'webp',
          generated_at: new Date().toISOString(),
          cost: this.calculateCost(
            'flux-context',
            1,
            request.quality || 'balanced'
          ),
          processing_time: 5.8,
          model_settings: {
            steps: request.steps || MODEL_DEFAULTS['flux-context'].steps,
            guidance:
              request.guidance || MODEL_DEFAULTS['flux-context'].guidance,
            seed: request.seed,
          },
          has_reference_image: !!request.reference_image,
          reference_analysis: request.reference_image
            ? 'Style consistency enabled'
            : undefined,
        },
      })
    }

    return results
  }

  // 이미지 후처리
  private static async postProcessImages(
    images: CreateImageData[],
    request: ImageGenerationRequest,
    options?: ImageProcessingOptions
  ): Promise<CreateImageData[]> {
    // WebP 변환, 메타데이터 추가, 썸네일 생성, 워터마크 등
    return images.map(image => {
      const processedMetadata = {
        ...image.metadata,
        optimized: options?.optimize ?? true,
        format: options?.format || 'webp',
        quality: options?.quality || 85,
        thumbnail_generated: true,
        watermark_applied: options?.watermark ?? false,
        post_processed_at: new Date().toISOString(),
      }

      return {
        ...image,
        image_url: image.image_url,
        metadata: processedMetadata,
      }
    })
  }

  // 생성 결과 저장
  private static async saveGenerationResult(
    generationId: string,
    images: CreateImageData[],
    request: ImageGenerationRequest,
    userId: string
  ): Promise<void> {
    try {
      // 각 이미지를 데이터베이스에 저장
      for (const imageData of images) {
        await this.createImage(imageData)
      }

      // 생성 활동 로그
      await this.logImageActivity(userId, 'images_generated', {
        generation_id: generationId,
        prompt: request.prompt,
        model_used: request.model,
        count: images.length,
        total_cost: images.reduce(
          (sum, img) => sum + ((img.metadata?.cost as number) || 0),
          0
        ),
      })
    } catch (error) {
      console.error('Failed to save generation result:', error)
    }
  }

  private static async callImageGenerationAPI(
    request: ImageGenerationRequest,
    model: string
  ): Promise<{
    success: boolean
    images?: string[]
    cost?: number
    error?: string
  }> {
    try {
      // Mock API call - replace with actual image generation service
      const mockImages = Array.from(
        { length: request.count || 1 },
        (_, i) => `https://example.com/generated-image-${Date.now()}-${i}.jpg`
      )

      const mockCost =
        (request.count || 1) * (model === 'imagen3' ? 0.05 : 0.003)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      return {
        success: true,
        images: mockImages,
        cost: mockCost,
      }
    } catch (error) {
      return {
        success: false,
        error: `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  private static async logImageActivity(
    userId: string,
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action,
        metadata,
        ip_address: 'unknown',
        user_agent: 'unknown',
      })
    } catch (error) {
      console.error('Failed to log image activity:', error)
    }
  }
  // 대기열 상태 조회
  static getQueueStatus(): {
    queued: number
    processing: number
    completed: number
    failed: number
  } {
    const status = { queued: 0, processing: 0, completed: 0, failed: 0 }

    generationQueue.forEach(progress => {
      status[progress.status]++
    })

    return status
  }

  // 대기열 정리
  static clearCompletedGenerations(olderThanHours: number = 1): void {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000

    generationQueue.forEach((progress, id) => {
      if (
        (progress.status === 'completed' || progress.status === 'failed') &&
        parseInt(id.split('_')[1]) < cutoffTime
      ) {
        generationQueue.delete(id)
      }
    })
  }

  // 사용자별 생성 히스토리 조회
  static async getUserGenerationHistory(
    userId: string,
    limit: number = 20
  ): Promise<ImageServiceResponse<ImageWithStats[]>> {
    return this.listImages({ limit })
  }

  // 비용 통계 조회
  static async getCostStatistics(
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<ImageServiceResponse<CostStatistics>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // 기간별 날짜 계산
      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      // 이미지 데이터 조회
      const { data: images, error: imagesError } = await supabase
        .from('generated_images')
        .select('model_used, metadata, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (imagesError) {
        return {
          data: null,
          error: `Failed to fetch cost statistics: ${imagesError.message}`,
          success: false,
        }
      }

      // 통계 계산
      let totalCost = 0
      const byModel: Record<string, { count: number; cost: number }> = {}

      images?.forEach(image => {
        const cost =
          ((image.metadata as Record<string, unknown>)?.cost as number) || 0
        totalCost += cost

        if (!byModel[image.model_used]) {
          byModel[image.model_used] = { count: 0, cost: 0 }
        }
        byModel[image.model_used].count++
        byModel[image.model_used].cost += cost
      })

      const statistics: CostStatistics = {
        totalCost,
        imageCount: images?.length || 0,
        averageCostPerImage: images?.length ? totalCost / images.length : 0,
        byModel,
      }

      return {
        data: statistics,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  // 사용량 제한 조회
  static async getUsageLimits(): Promise<ImageServiceResponse<UsageLimits>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // 오늘과 이번 달의 사용량 계산
      const [dailyStats, monthlyStats] = await Promise.all([
        this.getCostStatistics('day'),
        this.getCostStatistics('month'),
      ])

      const limits: UsageLimits = {
        daily_limit: 50,
        daily_used: dailyStats.data?.imageCount || 0,
        monthly_limit: 1000,
        monthly_used: monthlyStats.data?.imageCount || 0,
        cost_limit: 20.0,
        cost_used: monthlyStats.data?.totalCost || 0,
      }

      return {
        data: limits,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  // 이미지 다운로드
  static async downloadImage(
    imageId: string
  ): Promise<ImageServiceResponse<Blob>> {
    try {
      const imageResult = await this.getImageById(imageId)
      if (!imageResult.success || !imageResult.data) {
        return {
          data: null,
          error: 'Image not found',
          success: false,
        }
      }

      const response = await fetch(imageResult.data.image_url)
      if (!response.ok) {
        throw new Error('Failed to download image')
      }

      const blob = await response.blob()

      // 다운로드 카운트 증가
      await this.updateImage(imageId, {
        metadata: {
          ...imageResult.data.metadata,
          download_count:
            (((imageResult.data.metadata as Record<string, unknown>)
              ?.download_count as number) || 0) + 1,
        },
      })

      return {
        data: blob,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  // 배치 삭제
  static async deleteMultipleImages(
    imageIds: string[]
  ): Promise<ImageServiceResponse<number>> {
    try {
      let deletedCount = 0

      for (const imageId of imageIds) {
        const result = await this.deleteImage(imageId)
        if (result.success) {
          deletedCount++
        }
      }

      return {
        data: deletedCount,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Failed to delete images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  // 이미지 재생성 (기존 이미지 기반)
  static async regenerateImage(
    imageId: string,
    modifications?: {
      prompt?: string
      style?: string
      size?: string
      model?: string
    }
  ): Promise<ImageServiceResponse<ImageGenerationResult>> {
    try {
      const imageResult = await this.getImageById(imageId)
      if (!imageResult.success || !imageResult.data) {
        return {
          data: null,
          error: 'Original image not found',
          success: false,
        }
      }

      const originalImage = imageResult.data
      const request: ImageGenerationRequest = {
        prompt: modifications?.prompt || originalImage.prompt,
        model:
          (modifications?.model as
            | 'flux-schnell'
            | 'imagen3'
            | 'flux-context') ||
          (originalImage.model_used as
            | 'flux-schnell'
            | 'imagen3'
            | 'flux-context'),
        style: modifications?.style || originalImage.style || undefined,
        size: modifications?.size || originalImage.size,
        count: 1,
        project_id: originalImage.project_id || undefined,
      }

      return await this.generateImages(request)
    } catch (error) {
      return {
        data: null,
        error: `Failed to regenerate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }
}

// 유틸리티 함수들
export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(3)}`
}

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원되지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 허용)',
    }
  }

  if (file.size > maxSize) {
    return { valid: false, error: '파일 크기가 너무 큽니다. (최대 10MB)' }
  }

  return { valid: true }
}

// 프롬프트 분석 및 제안
export const analyzePrompt = (
  prompt: string
): {
  suggestions: string[]
  issues: string[]
  estimatedQuality: 'low' | 'medium' | 'high'
} => {
  const suggestions: string[] = []
  const issues: string[] = []
  let estimatedQuality: 'low' | 'medium' | 'high' = 'medium'

  // 프롬프트 길이 체크
  if (prompt.length < 10) {
    issues.push('프롬프트가 너무 짧습니다. 더 자세한 설명을 추가해보세요.')
    estimatedQuality = 'low'
  } else if (prompt.length > 500) {
    issues.push('프롬프트가 너무 깁니다. 핵심 내용으로 줄여보세요.')
  }

  // 품질 키워드 체크
  const qualityKeywords = [
    'high quality',
    'detailed',
    'sharp',
    'professional',
    '4k',
    '8k',
    'realistic',
  ]
  const hasQualityKeywords = qualityKeywords.some(keyword =>
    prompt.toLowerCase().includes(keyword.toLowerCase())
  )

  if (!hasQualityKeywords) {
    suggestions.push(
      '품질 관련 키워드를 추가해보세요: "high quality", "detailed", "professional" 등'
    )
  } else {
    estimatedQuality = 'high'
  }

  // 스타일 키워드 체크
  const styleKeywords = [
    'style',
    'art',
    'painting',
    'photography',
    'illustration',
    'digital art',
  ]
  const hasStyleKeywords = styleKeywords.some(keyword =>
    prompt.toLowerCase().includes(keyword.toLowerCase())
  )

  if (!hasStyleKeywords) {
    suggestions.push(
      '스타일을 명시해보세요: "digital art", "oil painting", "photography" 등'
    )
  }

  return {
    suggestions,
    issues,
    estimatedQuality,
  }
}

export default ImageService
