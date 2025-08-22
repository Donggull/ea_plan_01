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
  size?: string
  project_id?: string
  reference_image?: File
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
  images: CreateImageData[]
  total_cost: number
  generation_time: number
  model_used: string
}

export class ImageService {
  static async generateImages(
    request: ImageGenerationRequest
  ): Promise<ImageServiceResponse<ImageGenerationResult>> {
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

      const startTime = Date.now()

      // Determine the best model based on request
      const model = request.model || this.selectOptimalModel(request)

      // Generate images using the selected model
      const generationResult = await this.callImageGenerationAPI(request, model)

      if (!generationResult.success) {
        return {
          data: null,
          error: generationResult.error || null,
          success: false,
        }
      }

      const generationTime = Date.now() - startTime

      // Save generated images to database
      const savedImages: CreateImageData[] = []

      for (const imageUrl of generationResult.images || []) {
        const imageData: CreateImageData = {
          project_id: request.project_id,
          prompt: request.prompt,
          model_used: model,
          image_url: imageUrl,
          style: request.style || 'default',
          size: request.size || '1024x1024',
          is_favorite: false,
          tags: [],
          metadata: {
            generation_time: generationTime,
            generation_date: new Date().toISOString(),
            style: request.style,
            size: request.size,
            has_reference: !!request.reference_image,
          },
        }

        const createResult = await this.createImage(imageData)
        if (createResult.success && createResult.data) {
          savedImages.push({
            ...imageData,
            image_url: createResult.data.image_url,
          })
        }
      }

      // Log the generation activity
      await this.logImageActivity(user.id, 'images_generated', {
        prompt: request.prompt,
        model_used: model,
        count: savedImages.length,
        total_cost: generationResult.cost,
      })

      return {
        data: {
          images: savedImages,
          total_cost: generationResult.cost || 0,
          generation_time: generationTime,
          model_used: model,
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
}

export default ImageService
