'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Sliders,
  Hash,
  Target,
  Zap,
  Clock,
  DollarSign,
  Info,
  RotateCcw,
  Palette,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  TrendingUp,
} from 'lucide-react'

interface AdvancedSettings {
  seed?: number
  guidanceScale: number
  inferenceSteps: number
  clipSkip?: number
  samplerType: string
  cfgScale?: number
  denoisingStrength?: number
  upscaleMethod?: string
  faceRestoration?: boolean
  highResolutionFix?: boolean
  negativePrompt?: string
  aspectRatioLock: boolean
  batchSize: number
  variationAmount?: number
  promptStrength?: number
}

interface AdvancedSettingsPanelProps {
  settings: AdvancedSettings
  onSettingsChange: (settings: AdvancedSettings) => void
  modelType: string
  disabled?: boolean
  className?: string
}

// 모델별 기본 설정
const MODEL_DEFAULTS: Record<string, Partial<AdvancedSettings>> = {
  'flux-schnell': {
    guidanceScale: 3.5,
    inferenceSteps: 4,
    samplerType: 'euler',
    cfgScale: 7.0,
    batchSize: 1,
    aspectRatioLock: true,
  },
  imagen3: {
    guidanceScale: 7.5,
    inferenceSteps: 20,
    samplerType: 'ddim',
    cfgScale: 9.0,
    batchSize: 1,
    aspectRatioLock: false,
  },
  'flux-context': {
    guidanceScale: 5.0,
    inferenceSteps: 12,
    samplerType: 'euler_a',
    cfgScale: 8.0,
    denoisingStrength: 0.75,
    batchSize: 1,
    aspectRatioLock: true,
  },
}

// 샘플러 옵션
const SAMPLER_OPTIONS = [
  { value: 'euler', label: 'Euler', description: '빠르고 안정적' },
  {
    value: 'euler_a',
    label: 'Euler Ancestral',
    description: '창의적이고 다양함',
  },
  { value: 'ddim', label: 'DDIM', description: '일관된 결과' },
  { value: 'dpm_2m', label: 'DPM++ 2M', description: '고품질 결과' },
  { value: 'dpm_sde', label: 'DPM++ SDE', description: '세밀한 디테일' },
  { value: 'heun', label: 'Heun', description: '정확한 색상' },
]

// 업스케일 방법
const UPSCALE_METHODS = [
  { value: 'none', label: '없음', description: '원본 해상도' },
  { value: 'esrgan', label: 'ESRGAN', description: '범용 업스케일' },
  { value: 'real_esrgan', label: 'Real-ESRGAN', description: '사실적 이미지' },
  { value: 'ldsr', label: 'LDSR', description: '고품질 업스케일' },
  { value: 'scunet', label: 'ScuNET', description: '아트워크 특화' },
]

// 설정 그룹 정의
const SETTING_GROUPS = [
  {
    id: 'core',
    title: '핵심 설정',
    description: '이미지 생성의 기본적인 품질과 스타일을 결정합니다',
    icon: Target,
  },
  {
    id: 'sampling',
    title: '샘플링 설정',
    description: 'AI가 이미지를 생성하는 방법을 세밀하게 조정합니다',
    icon: Sliders,
  },
  {
    id: 'enhancement',
    title: '향상 설정',
    description: '생성된 이미지의 품질을 향상시키는 후처리 옵션입니다',
    icon: TrendingUp,
  },
  {
    id: 'control',
    title: '제어 설정',
    description: '생성 과정에서 더 세밀한 제어를 위한 고급 옵션입니다',
    icon: Settings,
  },
]

export default function AdvancedSettingsPanel({
  settings,
  onSettingsChange,
  modelType,
  disabled = false,
  className = '',
}: AdvancedSettingsPanelProps) {
  const [activeGroup, setActiveGroup] = useState<string>('core')
  const [presets, setPresets] = useState<Record<string, AdvancedSettings>>({})
  const [showPresets, setShowPresets] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null)

  // 모델 변경 시 기본 설정 적용
  useEffect(() => {
    const defaults = MODEL_DEFAULTS[modelType] || MODEL_DEFAULTS['flux-schnell']
    onSettingsChange({ ...settings, ...defaults })
  }, [modelType, onSettingsChange, settings])

  // 설정 변경 핸들러
  const updateSetting = (key: keyof AdvancedSettings, value: unknown) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  // 기본값으로 리셋
  const resetToDefaults = () => {
    const defaults = MODEL_DEFAULTS[modelType] || MODEL_DEFAULTS['flux-schnell']
    onSettingsChange({
      guidanceScale: 7.5,
      inferenceSteps: 20,
      samplerType: 'euler',
      aspectRatioLock: true,
      batchSize: 1,
      ...defaults,
    } as AdvancedSettings)
  }

  // 프리셋 저장
  const savePreset = (name: string) => {
    const newPresets = { ...presets, [name]: { ...settings } }
    setPresets(newPresets)
    localStorage.setItem('imageGenPresets', JSON.stringify(newPresets))
  }

  // 프리셋 로드
  const loadPreset = (name: string) => {
    const preset = presets[name]
    if (preset) {
      onSettingsChange(preset)
    }
  }

  // 예상 비용 계산
  const estimatedCost = () => {
    const baseCost =
      modelType === 'flux-schnell'
        ? 0.003
        : modelType === 'imagen3'
          ? 0.02
          : 0.015
    const stepMultiplier = settings.inferenceSteps / 20
    const batchMultiplier = settings.batchSize
    return (baseCost * stepMultiplier * batchMultiplier).toFixed(4)
  }

  // 예상 시간 계산
  const estimatedTime = () => {
    const baseTime =
      modelType === 'flux-schnell' ? 5 : modelType === 'imagen3' ? 15 : 10
    const stepMultiplier = settings.inferenceSteps / 20
    const batchMultiplier = settings.batchSize * 0.8 // 배치는 병렬처리로 약간 효율적
    return Math.ceil(baseTime * stepMultiplier * batchMultiplier)
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                고급 설정
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {modelType} 모델용 세부 설정
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              disabled={disabled}
            >
              프리셋
            </button>
            <button
              onClick={resetToDefaults}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1"
              disabled={disabled}
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          </div>
        </div>

        {/* 비용 및 시간 예상 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                예상 비용
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                ${estimatedCost()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                예상 시간
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ~{estimatedTime()}초
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Zap className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                품질 레벨
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {settings.inferenceSteps >= 30
                  ? '최고'
                  : settings.inferenceSteps >= 20
                    ? '높음'
                    : settings.inferenceSteps >= 10
                      ? '보통'
                      : '빠름'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 프리셋 패널 */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  설정 프리셋
                </h4>
                <button
                  onClick={() => {
                    const name = prompt('프리셋 이름을 입력하세요:')
                    if (name) savePreset(name)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  현재 설정 저장
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {Object.entries(presets).map(([name, preset]) => (
                  <button
                    key={name}
                    onClick={() => loadPreset(name)}
                    className="p-3 text-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                      {name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Steps: {preset.inferenceSteps}, Guidance:{' '}
                      {preset.guidanceScale}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 설정 그룹 탭 */}
      <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          {SETTING_GROUPS.map(group => {
            const IconComponent = group.icon
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeGroup === group.id
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                disabled={disabled}
              >
                <IconComponent className="w-4 h-4" />
                {group.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* 설정 내용 */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 활성 그룹 설명 */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {SETTING_GROUPS.find(g => g.id === activeGroup)?.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {SETTING_GROUPS.find(g => g.id === activeGroup)?.description}
                </p>
              </div>
            </div>

            {/* 핵심 설정 */}
            {activeGroup === 'core' && (
              <div className="space-y-6">
                {/* 시드값 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      시드값 (Seed)
                    </label>
                    <button
                      onMouseEnter={() => setTooltipVisible('seed')}
                      onMouseLeave={() => setTooltipVisible(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    {tooltipVisible === 'seed' && (
                      <div className="absolute z-10 p-2 bg-black text-white text-xs rounded shadow-lg">
                        동일한 결과를 재생성하고 싶을 때 사용합니다
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={settings.seed || ''}
                      onChange={e =>
                        updateSetting(
                          'seed',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="랜덤 (빈 값)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={disabled}
                    />
                    <button
                      onClick={() =>
                        updateSetting(
                          'seed',
                          Math.floor(Math.random() * 1000000)
                        )
                      }
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      disabled={disabled}
                    >
                      랜덤
                    </button>
                  </div>
                </div>

                {/* 가이던스 스케일 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        가이던스 스케일
                      </label>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {settings.guidanceScale}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={settings.guidanceScale}
                    onChange={e =>
                      updateSetting('guidanceScale', parseFloat(e.target.value))
                    }
                    className="w-full accent-blue-500"
                    disabled={disabled}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>창의적 (1)</span>
                    <span>균형 (7.5)</span>
                    <span>정확한 (30)</span>
                  </div>
                </div>

                {/* 추론 단계 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-gray-500" />
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        추론 단계 (Steps)
                      </label>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {settings.inferenceSteps}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={settings.inferenceSteps}
                    onChange={e =>
                      updateSetting('inferenceSteps', parseInt(e.target.value))
                    }
                    className="w-full accent-blue-500"
                    disabled={disabled}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>빠름 (1-10)</span>
                    <span>균형 (20-30)</span>
                    <span>고품질 (40-50)</span>
                  </div>
                </div>

                {/* 네거티브 프롬프트 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      네거티브 프롬프트
                    </label>
                  </div>
                  <textarea
                    value={settings.negativePrompt || ''}
                    onChange={e =>
                      updateSetting('negativePrompt', e.target.value)
                    }
                    placeholder="생성하고 싶지 않은 요소들을 입력하세요..."
                    className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={disabled}
                  />
                  <p className="text-xs text-gray-500">
                    예: blurry, low quality, distorted, cropped, watermark
                  </p>
                </div>
              </div>
            )}

            {/* 샘플링 설정 */}
            {activeGroup === 'sampling' && (
              <div className="space-y-6">
                {/* 샘플러 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-500" />
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      샘플링 방법
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SAMPLER_OPTIONS.map(sampler => (
                      <button
                        key={sampler.value}
                        onClick={() =>
                          updateSetting('samplerType', sampler.value)
                        }
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          settings.samplerType === sampler.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                        disabled={disabled}
                      >
                        <div className="font-medium text-sm">
                          {sampler.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {sampler.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CFG Scale */}
                {settings.cfgScale !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        CFG Scale
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {settings.cfgScale}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={settings.cfgScale}
                      onChange={e =>
                        updateSetting('cfgScale', parseFloat(e.target.value))
                      }
                      className="w-full accent-purple-500"
                      disabled={disabled}
                    />
                  </div>
                )}

                {/* CLIP Skip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      CLIP Skip
                    </label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {settings.clipSkip || 1}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={settings.clipSkip || 1}
                    onChange={e =>
                      updateSetting('clipSkip', parseInt(e.target.value))
                    }
                    className="w-full accent-green-500"
                    disabled={disabled}
                  />
                  <p className="text-xs text-gray-500">
                    높은 값일수록 더 추상적이고 예술적인 결과
                  </p>
                </div>
              </div>
            )}

            {/* 향상 설정 */}
            {activeGroup === 'enhancement' && (
              <div className="space-y-6">
                {/* 업스케일 방법 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      업스케일 방법
                    </label>
                  </div>
                  <select
                    value={settings.upscaleMethod || 'none'}
                    onChange={e =>
                      updateSetting('upscaleMethod', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={disabled}
                  >
                    {UPSCALE_METHODS.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label} - {method.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 디노이징 강도 */}
                {settings.denoisingStrength !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        디노이징 강도
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {settings.denoisingStrength}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.denoisingStrength}
                      onChange={e =>
                        updateSetting(
                          'denoisingStrength',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full accent-orange-500"
                      disabled={disabled}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>원본 유지</span>
                      <span>완전 변경</span>
                    </div>
                  </div>
                )}

                {/* 얼굴 복원 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      얼굴 복원
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.faceRestoration || false}
                      onChange={e =>
                        updateSetting('faceRestoration', e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={disabled}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    인물 사진의 얼굴 부분을 자동으로 향상시킵니다
                  </p>
                </div>

                {/* 고해상도 수정 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      고해상도 수정 (Hi-Res Fix)
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.highResolutionFix || false}
                      onChange={e =>
                        updateSetting('highResolutionFix', e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={disabled}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    고해상도에서 발생할 수 있는 아티팩트를 줄입니다
                  </p>
                </div>
              </div>
            )}

            {/* 제어 설정 */}
            {activeGroup === 'control' && (
              <div className="space-y-6">
                {/* 배치 크기 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      배치 크기
                    </label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {settings.batchSize}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={settings.batchSize}
                    onChange={e =>
                      updateSetting('batchSize', parseInt(e.target.value))
                    }
                    className="w-full accent-indigo-500"
                    disabled={disabled}
                  />
                  <p className="text-xs text-gray-500">
                    한 번에 생성할 이미지 수 (비용과 시간이 증가합니다)
                  </p>
                </div>

                {/* 종횡비 고정 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      종횡비 고정
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.aspectRatioLock}
                      onChange={e =>
                        updateSetting('aspectRatioLock', e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={disabled}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    설정한 종횡비를 엄격하게 유지합니다
                  </p>
                </div>

                {/* 변형 강도 */}
                {settings.variationAmount !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        변형 강도
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {settings.variationAmount}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.variationAmount}
                      onChange={e =>
                        updateSetting(
                          'variationAmount',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full accent-pink-500"
                      disabled={disabled}
                    />
                  </div>
                )}

                {/* 프롬프트 강도 */}
                {settings.promptStrength !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        프롬프트 강도
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {settings.promptStrength}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.promptStrength}
                      onChange={e =>
                        updateSetting(
                          'promptStrength',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full accent-teal-500"
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 설정 요약 */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                현재 설정 요약
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    가이던스:
                  </span>
                  <span className="ml-1 font-medium">
                    {settings.guidanceScale}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    단계:
                  </span>
                  <span className="ml-1 font-medium">
                    {settings.inferenceSteps}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    샘플러:
                  </span>
                  <span className="ml-1 font-medium">
                    {settings.samplerType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    배치:
                  </span>
                  <span className="ml-1 font-medium">{settings.batchSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
