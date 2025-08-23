'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Eye,
  Trash2,
  RotateCcw,
  ZoomIn,
} from 'lucide-react'
import Image from 'next/image'

interface ReferenceImageUploadProps {
  onImageUpload: (file: File, previewUrl: string) => void
  onImageRemove: () => void
  disabled?: boolean
  maxFileSize?: number // MB
  supportedFormats?: string[]
  currentImage?: { file: File; url: string } | null
}

interface ImageAnalysis {
  dominantColors: string[]
  style: string
  subjects: string[]
  composition: string
}

export default function ReferenceImageUpload({
  onImageUpload,
  onImageRemove,
  disabled = false,
  maxFileSize = 10,
  supportedFormats = ['jpg', 'jpeg', 'png', 'webp'],
  currentImage = null,
}: ReferenceImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // 이미지 분석 (모의 구현)
  const analyzeImage = useCallback(
    async (_file: File): Promise<ImageAnalysis> => {
      // 실제 구현에서는 AI API를 호출하여 이미지를 분석
      await new Promise(resolve => setTimeout(resolve, 1000)) // 모의 지연

      return {
        dominantColors: ['#2563EB', '#7C3AED', '#DC2626'],
        style: '디지털 아트',
        subjects: ['인물', '배경', '소품'],
        composition: '중앙 배치',
      }
    },
    []
  )

  // 파일 처리
  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      // 파일 유효성 검사
      const validateFile = (file: File): string | null => {
        if (file.size > maxFileSize * 1024 * 1024) {
          return `파일 크기가 ${maxFileSize}MB를 초과합니다.`
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !supportedFormats.includes(fileExtension)) {
          return `지원되지 않는 형식입니다. (${supportedFormats.join(', ')} 지원)`
        }

        return null
      }

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setUploading(true)

      try {
        // 이미지 미리보기 URL 생성
        const previewUrl = URL.createObjectURL(file)

        // 이미지 분석
        const analysis = await analyzeImage(file)
        setImageAnalysis(analysis)

        // 콜백 호출
        onImageUpload(file, previewUrl)
      } catch (err) {
        setError('이미지 처리 중 오류가 발생했습니다.')
        console.error('Image processing error:', err)
      } finally {
        setUploading(false)
      }
    },
    [maxFileSize, supportedFormats, analyzeImage, onImageUpload]
  )

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && !uploading) {
        setDragOver(true)
      }
    },
    [disabled, uploading]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      if (disabled || uploading) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled, uploading, handleFile]
  )

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  // 이미지 제거
  const handleRemove = () => {
    if (currentImage) {
      URL.revokeObjectURL(currentImage.url)
    }
    onImageRemove()
    setImageAnalysis(null)
    setShowAnalysis(false)
    setError(null)

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <ImageIcon className="w-4 h-4 inline mr-2" />
          참조 이미지 (선택사항)
        </label>

        {!currentImage ? (
          <motion.div
            ref={dropZoneRef}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={supportedFormats.map(f => `.${f}`).join(',')}
              onChange={handleFileSelect}
              disabled={disabled}
            />

            {uploading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">
                  이미지를 분석하는 중...
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Upload className="w-full h-full text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {supportedFormats.map(f => f.toUpperCase()).join(', ')} 파일
                    지원 • 최대 {maxFileSize}MB
                  </p>
                </div>
                {dragOver && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-lg"
                  >
                    <div className="text-blue-600 font-medium">
                      여기에 이미지를 놓아주세요
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* 업로드된 이미지 미리보기 */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
          >
            {/* 이미지 */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
              <Image
                src={currentImage.url}
                alt="참조 이미지"
                fill
                className="object-contain"
              />

              {/* 컨트롤 버튼들 */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => setPreviewMode(true)}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                  title="확대 보기"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`p-2 rounded-lg transition-colors ${
                    showAnalysis
                      ? 'bg-blue-500 text-white'
                      : 'bg-black/50 hover:bg-black/70 text-white'
                  }`}
                  title="분석 결과"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRemove}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="제거"
                  disabled={disabled}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 상태 표시 */}
              <div className="absolute bottom-2 left-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  Flux Context 활성화됨
                </div>
              </div>
            </div>

            {/* 파일 정보 */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ImageIcon className="w-4 h-4" />
                  <span className="font-medium">{currentImage.file.name}</span>
                  <span>
                    ({(currentImage.file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  disabled={disabled}
                >
                  <RotateCcw className="w-3 h-3" />
                  교체
                </button>
              </div>
            </div>

            {/* 이미지 분석 결과 */}
            <AnimatePresence>
              {showAnalysis && imageAnalysis && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                      AI 분석 결과
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          스타일:
                        </span>
                        <span className="ml-2 font-medium">
                          {imageAnalysis.style}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          구도:
                        </span>
                        <span className="ml-2 font-medium">
                          {imageAnalysis.composition}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          주요 색상:
                        </span>
                        <div className="flex gap-2 mt-1">
                          {imageAnalysis.dominantColors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          주요 요소:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {imageAnalysis.subjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full text-xs"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-800/50 rounded-lg p-3 text-sm">
                      <p className="text-blue-800 dark:text-blue-200">
                        💡 <strong>팁:</strong> 이 이미지를 참조로 사용하면 Flux
                        Context 모델이 자동 활성화되어 일관된 스타일과 캐릭터를
                        유지한 이미지를 생성할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 에러 메시지 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 사용법 안내 */}
        {!currentImage && !error && (
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              • 참조 이미지를 업로드하면 Flux Context 모델이 자동으로
              활성화됩니다
            </p>
            <p>• 일관된 캐릭터나 스타일로 여러 이미지를 생성할 때 유용합니다</p>
            <p>• 최적의 결과를 위해 고화질 이미지를 업로드하세요</p>
          </div>
        )}
      </div>

      {/* 확대 미리보기 모달 */}
      <AnimatePresence>
        {previewMode && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewMode(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewMode(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <Image
                src={currentImage.url}
                alt="참조 이미지 확대"
                width={800}
                height={600}
                className="object-contain max-h-[80vh] rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={supportedFormats.map(f => `.${f}`).join(',')}
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  )
}
