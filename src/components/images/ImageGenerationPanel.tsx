'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Settings,
  Image as ImageIcon,
  Wand2,
  Palette,
  Sliders,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Plus,
  Minus,
} from 'lucide-react'

interface ImageGenerationPanelProps {
  onGenerate: (params: GenerationParams) => void
  isGenerating?: boolean
  disabled?: boolean
}

interface GenerationParams {
  prompt: string
  model: string
  style: string
  count: number
  size: string
  quality: string
  seed?: number
  guidance?: number
  steps?: number
}

const AI_MODELS = [
  {
    id: 'flux-schnell',
    name: 'Flux Schnell',
    description: '빠른 생성 (3-5초)',
    color: 'bg-blue-500',
    features: ['빠른 속도', '일반적 품질', '비용 효율적'],
  },
  {
    id: 'imagen3',
    name: 'Google Imagen 3',
    description: '고품질 생성 (10-15초)',
    color: 'bg-green-500',
    features: ['최고 품질', '텍스트 정확도', '상업적 사용'],
  },
  {
    id: 'flux-context',
    name: 'Flux Context',
    description: '참조 이미지 기반',
    color: 'bg-purple-500',
    features: ['일관성 유지', '스타일 학습', '시리즈 생성'],
  },
]

const STYLE_PRESETS = [
  { id: 'none', name: '기본', keywords: [] },
  {
    id: 'photorealistic',
    name: '사실적',
    keywords: ['photorealistic', 'highly detailed', '8k resolution'],
  },
  {
    id: 'artistic',
    name: '예술적',
    keywords: ['artistic', 'masterpiece', 'fine art'],
  },
  {
    id: 'anime',
    name: '애니메이션',
    keywords: ['anime style', 'cel shading', 'vibrant colors'],
  },
  {
    id: 'watercolor',
    name: '수채화',
    keywords: ['watercolor painting', 'soft brushstrokes', 'artistic'],
  },
  {
    id: 'oil_painting',
    name: '유화',
    keywords: ['oil painting', 'canvas texture', 'classical art'],
  },
  {
    id: 'digital_art',
    name: '디지털 아트',
    keywords: ['digital art', 'concept art', 'artstation'],
  },
  {
    id: 'sketch',
    name: '스케치',
    keywords: ['pencil sketch', 'line art', 'black and white'],
  },
  {
    id: 'cyberpunk',
    name: '사이버펑크',
    keywords: ['cyberpunk', 'neon lights', 'futuristic'],
  },
  {
    id: 'minimalist',
    name: '미니멀',
    keywords: ['minimalist', 'clean', 'simple composition'],
  },
]

const SIZE_OPTIONS = [
  {
    id: 'square',
    name: '정사각형',
    icon: Square,
    ratio: '1:1',
    dimensions: '1024×1024',
  },
  {
    id: 'portrait',
    name: '세로',
    icon: RectangleVertical,
    ratio: '3:4',
    dimensions: '768×1024',
  },
  {
    id: 'landscape',
    name: '가로',
    icon: RectangleHorizontal,
    ratio: '4:3',
    dimensions: '1024×768',
  },
]

const QUALITY_OPTIONS = [
  { id: 'fast', name: '빠르게', description: '속도 우선', cost: '저비용' },
  {
    id: 'balanced',
    name: '균형',
    description: '속도와 품질 균형',
    cost: '중간',
  },
  { id: 'high', name: '고품질', description: '품질 우선', cost: '고비용' },
]

export default function ImageGenerationPanel({
  onGenerate,
  isGenerating = false,
  disabled = false,
}: ImageGenerationPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('flux-schnell')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [count, setCount] = useState(1)
  const [size, setSize] = useState('square')
  const [quality, setQuality] = useState('balanced')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [seed, setSeed] = useState<string>('')
  const [guidance, setGuidance] = useState(7.5)
  const [steps, setSteps] = useState(20)

  const handleGenerate = () => {
    if (!prompt.trim()) return

    const params: GenerationParams = {
      prompt: prompt.trim(),
      model: selectedModel,
      style: selectedStyle,
      count,
      size,
      quality,
      ...(seed && { seed: parseInt(seed) }),
      ...(guidance !== 7.5 && { guidance }),
      ...(steps !== 20 && { steps }),
    }

    onGenerate(params)
  }

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel)
  const selectedStyleData = STYLE_PRESETS.find(s => s.id === selectedStyle)
  const selectedSizeData = SIZE_OPTIONS.find(s => s.id === size)
  const selectedQualityData = QUALITY_OPTIONS.find(q => q.id === quality)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              이미지 생성
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI를 활용하여 창의적인 이미지를 생성하세요
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 프롬프트 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <ImageIcon className="w-4 h-4 inline mr-2" />
            이미지 설명 (프롬프트)
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="생성하고 싶은 이미지를 자세히 설명해주세요..."
            className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            disabled={disabled || isGenerating}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{prompt.length}/1000자</span>
            <span>한국어와 영어 모두 지원</span>
          </div>
        </div>

        {/* AI 모델 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Sparkles className="w-4 h-4 inline mr-2" />
            AI 모델
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AI_MODELS.map(model => (
              <motion.button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={disabled || isGenerating}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${model.color}`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {model.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 스타일 프리셋 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Palette className="w-4 h-4 inline mr-2" />
            스타일 프리셋
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {STYLE_PRESETS.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedStyle === style.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                disabled={disabled || isGenerating}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 크기 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              크기/비율
            </label>
            <div className="space-y-2">
              {SIZE_OPTIONS.map(sizeOption => {
                const IconComponent = sizeOption.icon
                return (
                  <button
                    key={sizeOption.id}
                    onClick={() => setSize(sizeOption.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      size === sizeOption.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                    disabled={disabled || isGenerating}
                  >
                    <IconComponent className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        {sizeOption.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sizeOption.dimensions}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 생성 개수 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              생성 개수
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={disabled || isGenerating || count <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-medium text-lg">
                {count}
              </span>
              <button
                onClick={() => setCount(Math.min(4, count + 1))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={disabled || isGenerating || count >= 4}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">최대 4개</p>
          </div>

          {/* 품질 설정 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              품질 설정
            </label>
            <div className="space-y-2">
              {QUALITY_OPTIONS.map(qualityOption => (
                <button
                  key={qualityOption.id}
                  onClick={() => setQuality(qualityOption.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    quality === qualityOption.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                  disabled={disabled || isGenerating}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {qualityOption.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {qualityOption.cost}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {qualityOption.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 고급 설정 토글 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            고급 설정
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto"
            >
              ▼
            </motion.div>
          </button>

          {/* 고급 설정 패널 */}
          <motion.div
            initial={false}
            animate={{ height: showAdvanced ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 시드값 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    시드값 (선택사항)
                  </label>
                  <input
                    type="number"
                    value={seed}
                    onChange={e => setSeed(e.target.value)}
                    placeholder="랜덤"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={disabled || isGenerating}
                  />
                  <p className="text-xs text-gray-500">동일한 결과 재생성용</p>
                </div>

                {/* 가이던스 스케일 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    가이던스: {guidance}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidance}
                    onChange={e => setGuidance(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={disabled || isGenerating}
                  />
                  <p className="text-xs text-gray-500">프롬프트 준수도</p>
                </div>

                {/* 추론 단계 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    단계수: {steps}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={steps}
                    onChange={e => setSteps(parseInt(e.target.value))}
                    className="w-full"
                    disabled={disabled || isGenerating}
                  />
                  <p className="text-xs text-gray-500">품질 vs 속도</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 생성 버튼 */}
        <motion.button
          onClick={handleGenerate}
          disabled={disabled || isGenerating || !prompt.trim()}
          className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
            disabled || isGenerating || !prompt.trim()
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
          }`}
          whileHover={disabled || isGenerating ? {} : { scale: 1.02 }}
          whileTap={disabled || isGenerating ? {} : { scale: 0.98 }}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              이미지 생성 중...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Wand2 className="w-5 h-5" />
              이미지 생성하기
              {selectedModelData && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-sm">
                  {selectedModelData.name}
                </span>
              )}
            </div>
          )}
        </motion.button>

        {/* 현재 설정 요약 */}
        {prompt && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
              <Sliders className="w-4 h-4 inline mr-2" />
              현재 설정 요약
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">모델:</span>
                <span className="font-medium">{selectedModelData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  스타일:
                </span>
                <span className="font-medium">{selectedStyleData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">크기:</span>
                <span className="font-medium">
                  {selectedSizeData?.dimensions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">개수:</span>
                <span className="font-medium">{count}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">품질:</span>
                <span className="font-medium">{selectedQualityData?.name}</span>
              </div>
              {seed && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    시드:
                  </span>
                  <span className="font-medium">{seed}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
