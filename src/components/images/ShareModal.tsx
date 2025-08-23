'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X,
  Copy,
  Check,
  Share2,
  Link,
  Download,
  QrCode,
  Globe,
  Lock,
  Eye,
  Code,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { ImageItem } from './ImageCard'

interface ShareModalProps {
  image: ImageItem
  isOpen: boolean
  onClose: () => void
  onUpdateVisibility?: (imageId: string | number, isPublic: boolean) => void
  baseUrl?: string
}

export default function ShareModal({
  image,
  isOpen,
  onClose,
  onUpdateVisibility,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<
    'link' | 'social' | 'embed' | 'qr'
  >('link')
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [linkType, setLinkType] = useState<'view' | 'direct'>('view')
  const [embedSize, setEmbedSize] = useState<'small' | 'medium' | 'large'>(
    'medium'
  )

  const shareUrl = `${baseUrl}/images/${image.id}`
  const directImageUrl = image.url
  const embedCode = `<iframe src="${shareUrl}/embed" width="${getEmbedSize(embedSize).width}" height="${getEmbedSize(embedSize).height}" frameborder="0" allowfullscreen></iframe>`

  function getEmbedSize(size: 'small' | 'medium' | 'large') {
    switch (size) {
      case 'small':
        return { width: 400, height: 300 }
      case 'medium':
        return { width: 600, height: 450 }
      case 'large':
        return { width: 800, height: 600 }
    }
  }

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(label)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const shareToSocial = useCallback(
    (platform: string) => {
      const encodedUrl = encodeURIComponent(shareUrl)
      const encodedTitle = encodeURIComponent(image.title)
      const encodedDescription = encodeURIComponent(
        image.prompt.slice(0, 100) + '...'
      )

      let shareLink = ''

      switch (platform) {
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
          break
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
          break
        case 'linkedin':
          shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
          break
        case 'reddit':
          shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
          break
        case 'pinterest':
          shareLink = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image.url)}&description=${encodedDescription}`
          break
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400')
      }
    },
    [shareUrl, image.title, image.prompt, image.url]
  )

  const downloadQR = useCallback(async () => {
    // QR 코드 생성 라이브러리를 사용하여 구현
    // 여기서는 모의 구현
    console.log('QR 코드 다운로드:', shareUrl)
  }, [shareUrl])

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-blue-400' },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: MessageCircle,
      color: 'bg-blue-700',
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: MessageCircle,
      color: 'bg-orange-500',
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: Instagram,
      color: 'bg-red-500',
    },
  ]

  const tabs = [
    { id: 'link', label: '링크 공유', icon: Link },
    { id: 'social', label: '소셜 미디어', icon: Share2 },
    { id: 'embed', label: '임베드 코드', icon: Code },
    { id: 'qr', label: 'QR 코드', icon: QrCode },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={image.thumbnail || image.url}
                    alt={image.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    이미지 공유
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {image.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 공개 설정 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {image.isPublic ? (
                      <>
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          공개
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          비공개
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {image.isPublic
                      ? '누구나 이 이미지를 볼 수 있습니다'
                      : '링크를 아는 사람만 볼 수 있습니다'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = !image.isPublic
                    onUpdateVisibility?.(image.id, newVisibility)
                    // 로컬 상태 업데이트 (실제로는 parent에서 처리)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    image.isPublic
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {image.isPublic ? '비공개로 변경' : '공개로 변경'}
                </button>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* 탭 콘텐츠 */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'link' && (
                <div className="space-y-6">
                  {/* 링크 타입 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      링크 타입
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setLinkType('view')}
                        className={`flex-1 p-3 text-left rounded-lg border transition-colors ${
                          linkType === 'view'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">페이지 링크</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          이미지와 정보를 함께 표시
                        </p>
                      </button>

                      <button
                        onClick={() => setLinkType('direct')}
                        className={`flex-1 p-3 text-left rounded-lg border transition-colors ${
                          linkType === 'direct'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <ExternalLink className="w-4 h-4" />
                          <span className="font-medium">직접 링크</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          이미지 파일 직접 링크
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 링크 복사 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      공유 링크
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={linkType === 'view' ? shareUrl : directImageUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(
                            linkType === 'view' ? shareUrl : directImageUrl,
                            '링크'
                          )
                        }
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        {copySuccess === '링크' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        복사
                      </button>
                    </div>
                    {copySuccess === '링크' && (
                      <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                        링크가 클립보드에 복사되었습니다!
                      </p>
                    )}
                  </div>

                  {/* 빠른 액션 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(shareUrl, '_blank')}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      새창에서 보기
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${image.title} - ${shareUrl}`,
                          '제목과 링크'
                        )
                      }
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      제목과 함께 복사
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  {/* 소셜 플랫폼 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      소셜 미디어에 공유
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {socialPlatforms.map(platform => {
                        const Icon = platform.icon
                        return (
                          <button
                            key={platform.id}
                            onClick={() => shareToSocial(platform.id)}
                            className={`p-4 rounded-lg text-white transition-colors hover:opacity-90 flex items-center gap-3 ${platform.color}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{platform.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 이메일 공유 */}
                  <div>
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(
                          `${image.title} - AI 생성 이미지`
                        )
                        const body = encodeURIComponent(
                          `
안녕하세요!

멋진 AI 생성 이미지를 공유합니다:

제목: ${image.title}
프롬프트: ${image.prompt}

이미지 보기: ${shareUrl}

감사합니다!
                        `.trim()
                        )
                        window.open(`mailto:?subject=${subject}&body=${body}`)
                      }}
                      className="w-full p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
                    >
                      <Mail className="w-5 h-5" />
                      이메일로 공유
                    </button>
                  </div>

                  {/* 공유 텍스트 미리보기 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      공유 텍스트 미리보기
                    </label>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium">{image.title}</p>
                      <p className="mt-1">{image.prompt.slice(0, 100)}...</p>
                      <p className="mt-2 text-blue-600 dark:text-blue-400">
                        {shareUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'embed' && (
                <div className="space-y-6">
                  {/* 임베드 크기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      임베드 크기
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['small', 'medium', 'large'].map(size => {
                        const dimensions = getEmbedSize(
                          size as 'small' | 'medium' | 'large'
                        )
                        return (
                          <button
                            key={size}
                            onClick={() =>
                              setEmbedSize(size as 'small' | 'medium' | 'large')
                            }
                            className={`p-3 text-center rounded-lg border transition-colors ${
                              embedSize === size
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="font-medium capitalize">{size}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {dimensions.width}×{dimensions.height}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 임베드 코드 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      임베드 코드
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={embedCode}
                        readOnly
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono resize-none"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(embedCode, '임베드 코드')
                        }
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        {copySuccess === '임베드 코드' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        임베드 코드 복사
                      </button>
                    </div>
                    {copySuccess === '임베드 코드' && (
                      <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                        임베드 코드가 클립보드에 복사되었습니다!
                      </p>
                    )}
                  </div>

                  {/* 임베드 미리보기 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      미리보기
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Image
                          src={image.thumbnail || image.url}
                          alt={image.title}
                          width={200}
                          height={150}
                          className="object-contain max-h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'qr' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          QR 코드 생성 중...
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      QR 코드를 스캔하여 이미지를 확인할 수 있습니다
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={downloadQR}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        QR 코드 다운로드
                      </button>
                      <button
                        onClick={() => copyToClipboard(shareUrl, 'QR 링크')}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        링크 복사
                      </button>
                    </div>
                  </div>

                  {/* QR 옵션 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      QR 코드 옵션
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          로고 포함
                        </span>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          고해상도
                        </span>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 액션 */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(shareUrl, '최종 링크')
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  {copySuccess === '최종 링크' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  링크 복사
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
