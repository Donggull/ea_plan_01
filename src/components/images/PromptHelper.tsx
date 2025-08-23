'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  Sparkles,
  Plus,
  X,
  Search,
  BookOpen,
  Palette,
  Camera,
  Brush,
  Eye,
  Shuffle,
  Copy,
  Star,
  TrendingUp,
  Clock,
  ChevronRight,
  Wand2,
  Target,
  Layers,
} from 'lucide-react'

interface PromptHelperProps {
  currentPrompt: string
  onPromptChange: (prompt: string) => void
  model: string
  style: string
  className?: string
}

// 카테고리별 키워드 데이터베이스
const KEYWORD_CATEGORIES = {
  style: {
    name: '스타일',
    icon: Palette,
    keywords: [
      { text: 'photorealistic', description: '사실적인', popularity: 95 },
      { text: 'digital art', description: '디지털 아트', popularity: 88 },
      { text: 'oil painting', description: '유화', popularity: 75 },
      { text: 'watercolor', description: '수채화', popularity: 72 },
      { text: 'anime style', description: '애니메이션', popularity: 90 },
      { text: 'pencil sketch', description: '연필 스케치', popularity: 65 },
      { text: 'cyberpunk', description: '사이버펑크', popularity: 82 },
      { text: 'steampunk', description: '스팀펑크', popularity: 68 },
      { text: 'minimalist', description: '미니멀', popularity: 70 },
      { text: 'abstract art', description: '추상 미술', popularity: 60 },
    ],
  },
  quality: {
    name: '품질',
    icon: Star,
    keywords: [
      { text: '8k resolution', description: '8K 해상도', popularity: 92 },
      { text: 'highly detailed', description: '매우 상세한', popularity: 89 },
      { text: 'masterpiece', description: '걸작', popularity: 85 },
      {
        text: 'professional photography',
        description: '전문 사진',
        popularity: 80,
      },
      { text: 'studio lighting', description: '스튜디오 조명', popularity: 78 },
      { text: 'sharp focus', description: '선명한 초점', popularity: 82 },
      { text: 'vivid colors', description: '선명한 색상', popularity: 75 },
      { text: 'high contrast', description: '높은 대비', popularity: 70 },
      { text: 'ultra-realistic', description: '초현실적', popularity: 88 },
      { text: 'award winning', description: '수상작', popularity: 65 },
    ],
  },
  composition: {
    name: '구도',
    icon: Camera,
    keywords: [
      { text: 'close-up', description: '클로즈업', popularity: 85 },
      { text: 'wide angle', description: '광각', popularity: 75 },
      { text: 'portrait', description: '인물 사진', popularity: 90 },
      { text: 'full body', description: '전신', popularity: 80 },
      {
        text: 'cinematic composition',
        description: '영화적 구도',
        popularity: 82,
      },
      { text: 'rule of thirds', description: '삼등분 법칙', popularity: 70 },
      { text: 'symmetrical', description: '대칭', popularity: 65 },
      { text: 'dynamic pose', description: '역동적 포즈', popularity: 78 },
      { text: 'bird eye view', description: '조감도', popularity: 68 },
      { text: 'low angle', description: '로우 앵글', popularity: 72 },
    ],
  },
  lighting: {
    name: '조명',
    icon: Eye,
    keywords: [
      { text: 'golden hour', description: '골든 아워', popularity: 88 },
      { text: 'soft lighting', description: '부드러운 조명', popularity: 85 },
      { text: 'dramatic lighting', description: '극적인 조명', popularity: 82 },
      { text: 'backlight', description: '역광', popularity: 75 },
      { text: 'rim lighting', description: '림 라이팅', popularity: 70 },
      { text: 'neon lighting', description: '네온 조명', popularity: 78 },
      { text: 'natural lighting', description: '자연광', popularity: 80 },
      {
        text: 'moody lighting',
        description: '분위기 있는 조명',
        popularity: 73,
      },
      { text: 'volumetric lighting', description: '볼륨 조명', popularity: 68 },
      { text: 'god rays', description: '신의 광선', popularity: 65 },
    ],
  },
  atmosphere: {
    name: '분위기',
    icon: Brush,
    keywords: [
      { text: 'dreamy', description: '꿈같은', popularity: 80 },
      { text: 'mysterious', description: '신비로운', popularity: 75 },
      { text: 'ethereal', description: '환상적인', popularity: 70 },
      { text: 'melancholic', description: '우울한', popularity: 65 },
      { text: 'serene', description: '고요한', popularity: 72 },
      { text: 'intense', description: '강렬한', popularity: 78 },
      { text: 'peaceful', description: '평화로운', popularity: 68 },
      { text: 'energetic', description: '활기찬', popularity: 73 },
      { text: 'nostalgic', description: '향수를 자아내는', popularity: 67 },
      { text: 'futuristic', description: '미래적인', popularity: 82 },
    ],
  },
  technique: {
    name: '기법',
    icon: Layers,
    keywords: [
      { text: 'depth of field', description: '피사계 심도', popularity: 85 },
      { text: 'bokeh', description: '보케', popularity: 80 },
      { text: 'motion blur', description: '모션 블러', popularity: 72 },
      { text: 'HDR', description: 'HDR', popularity: 75 },
      { text: 'long exposure', description: '장노출', popularity: 68 },
      { text: 'macro photography', description: '매크로 사진', popularity: 70 },
      { text: 'double exposure', description: '이중 노출', popularity: 65 },
      { text: 'tilt shift', description: '틸트 시프트', popularity: 62 },
      { text: 'fisheye lens', description: '어안 렌즈', popularity: 58 },
      {
        text: 'cross processing',
        description: '크로스 프로세싱',
        popularity: 55,
      },
    ],
  },
}

// 인기 템플릿
const PROMPT_TEMPLATES = [
  {
    id: 'portrait',
    name: '인물 사진',
    template:
      'portrait of {subject}, {style}, professional photography, studio lighting, 8k resolution, highly detailed',
    example:
      'portrait of a young woman, photorealistic, professional photography, studio lighting, 8k resolution, highly detailed',
    category: 'portrait',
  },
  {
    id: 'landscape',
    name: '풍경 사진',
    template:
      '{landscape_type} landscape, {time_of_day}, {weather}, cinematic composition, {camera_settings}',
    example:
      'mountain landscape, golden hour, misty weather, cinematic composition, wide angle lens',
    category: 'landscape',
  },
  {
    id: 'character',
    name: '캐릭터 디자인',
    template:
      '{character_type} character, {art_style}, {pose}, {background}, concept art, detailed',
    example:
      'fantasy warrior character, anime style, dynamic pose, medieval background, concept art, detailed',
    category: 'character',
  },
  {
    id: 'abstract',
    name: '추상 미술',
    template:
      'abstract art, {color_scheme}, {texture}, {composition}, digital art, high resolution',
    example:
      'abstract art, vibrant colors, flowing textures, geometric composition, digital art, high resolution',
    category: 'abstract',
  },
  {
    id: 'product',
    name: '제품 사진',
    template:
      '{product} product photography, {background}, professional lighting, commercial style, high quality',
    example:
      'smartphone product photography, clean white background, professional lighting, commercial style, high quality',
    category: 'commercial',
  },
]

// 모델별 최적화 키워드
const MODEL_OPTIMIZED_KEYWORDS = {
  'flux-schnell': ['sharp details', 'clean composition', 'vibrant colors'],
  imagen3: ['photorealistic', 'natural lighting', 'accurate textures'],
  'flux-context': [
    'consistent style',
    'character consistency',
    'series artwork',
  ],
}

export default function PromptHelper({
  currentPrompt,
  onPromptChange,
  model,
  className = '',
}: PromptHelperProps) {
  const [activeCategory, setActiveCategory] = useState<string>('style')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [promptHistory, setPromptHistory] = useState<string[]>([])

  // 검색 필터링된 키워드
  const filteredKeywords = useMemo(() => {
    const category =
      KEYWORD_CATEGORIES[activeCategory as keyof typeof KEYWORD_CATEGORIES]
    if (!category) return []

    return category.keywords
      .filter(
        keyword =>
          searchQuery === '' ||
          keyword.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          keyword.description.includes(searchQuery)
      )
      .sort((a, b) => b.popularity - a.popularity)
  }, [activeCategory, searchQuery])

  // 키워드 추가/제거
  const toggleKeyword = (keyword: string) => {
    const newKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword]

    setSelectedKeywords(newKeywords)

    // 프롬프트 업데이트
    const keywordString = newKeywords.join(', ')
    const basePrompt = currentPrompt
      .replace(/,?\s*([\w\s-]+,?\s*)*$/g, '')
      .trim()
    const newPrompt =
      basePrompt +
      (keywordString ? (basePrompt ? ', ' : '') + keywordString : '')
    onPromptChange(newPrompt)
  }

  // 템플릿 적용
  const applyTemplate = (template: string) => {
    onPromptChange(template)
    setShowTemplates(false)

    // 히스토리에 추가
    const newHistory = [
      template,
      ...promptHistory.filter(p => p !== template),
    ].slice(0, 10)
    setPromptHistory(newHistory)
  }

  // 프롬프트 최적화
  const optimizePrompt = () => {
    const modelKeywords =
      MODEL_OPTIMIZED_KEYWORDS[
        model as keyof typeof MODEL_OPTIMIZED_KEYWORDS
      ] || []
    const optimizedKeywords = modelKeywords.filter(
      k => !currentPrompt.includes(k)
    )

    if (optimizedKeywords.length > 0) {
      const newPrompt =
        currentPrompt +
        (currentPrompt ? ', ' : '') +
        optimizedKeywords.join(', ')
      onPromptChange(newPrompt)
    }
  }

  // 랜덤 키워드 추천
  const suggestRandomKeywords = () => {
    const allKeywords = Object.values(KEYWORD_CATEGORIES).flatMap(
      cat => cat.keywords
    )
    const shuffled = [...allKeywords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const keywords = shuffled.map(k => k.text)

    const newPrompt =
      currentPrompt + (currentPrompt ? ', ' : '') + keywords.join(', ')
    onPromptChange(newPrompt)
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                프롬프트 헬퍼
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                더 나은 결과를 위한 프롬프트 작성 도우미
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showTemplates
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              템플릿
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showHistory
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              히스토리
            </button>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={optimizePrompt}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            <Target className="w-3 h-3" />
            {model} 최적화
          </button>
          <button
            onClick={suggestRandomKeywords}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <Shuffle className="w-3 h-3" />
            랜덤 제안
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(currentPrompt)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Copy className="w-3 h-3" />
            복사
          </button>
        </div>
      </div>

      {/* 템플릿 패널 */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                인기 템플릿
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROMPT_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => applyTemplate(template.example)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {template.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {template.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 히스토리 패널 */}
      <AnimatePresence>
        {showHistory && promptHistory.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                최근 사용한 프롬프트
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {promptHistory.map((prompt, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => onPromptChange(prompt)}
                  >
                    <p className="line-clamp-1">{prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        {/* 검색 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="키워드 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-1 mb-4">
          {Object.entries(KEYWORD_CATEGORIES).map(([key, category]) => {
            const IconComponent = category.icon
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* 키워드 그리드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {
                KEYWORD_CATEGORIES[
                  activeCategory as keyof typeof KEYWORD_CATEGORIES
                ]?.name
              }{' '}
              키워드
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              인기순 정렬
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredKeywords.map(keyword => (
              <motion.button
                key={keyword.text}
                onClick={() => toggleKeyword(keyword.text)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedKeywords.includes(keyword.text)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 bg-white dark:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {keyword.text}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-green-500"
                      style={{
                        opacity: keyword.popularity / 100,
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      {keyword.popularity}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {keyword.description}
                </p>
                {selectedKeywords.includes(keyword.text) && (
                  <div className="mt-2 flex items-center gap-1 text-blue-600">
                    <Plus className="w-3 h-3 rotate-45" />
                    <span className="text-xs">선택됨</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {filteredKeywords.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 선택된 키워드 */}
        {selectedKeywords.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800 dark:text-blue-200">
                선택된 키워드 ({selectedKeywords.length}개)
              </span>
              <button
                onClick={() => {
                  setSelectedKeywords([])
                  onPromptChange(
                    currentPrompt
                      .split(',')
                      .filter(
                        p => !selectedKeywords.some(k => p.trim().includes(k))
                      )
                      .join(',')
                  )
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                모두 제거
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedKeywords.map(keyword => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full"
                >
                  {keyword}
                  <button
                    onClick={() => toggleKeyword(keyword)}
                    className="hover:bg-blue-600 rounded-full p-0.5"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 프롬프트 미리보기 */}
        {currentPrompt && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                현재 프롬프트
              </span>
              <span className="text-xs text-gray-500">
                {currentPrompt.length}/1000자
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
              {currentPrompt}
            </div>
          </div>
        )}

        {/* 팁과 조언 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                프롬프트 작성 팁
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• 구체적이고 명확한 설명을 사용하세요</li>
                <li>• 원하는 스타일과 품질을 먼저 명시하세요</li>
                <li>• 부정적인 요소는 네거티브 프롬프트에 작성하세요</li>
                <li>• {model} 모델에 최적화된 키워드를 활용하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
