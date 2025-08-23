'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3X3,
  List,
  Search,
  Filter,
  // SortAsc,
  // SortDesc,
  Calendar,
  Heart,
  Download,
  // Eye,
  Trash2,
  Tag,
  FolderPlus,
  Archive,
  Share2,
  // ChevronLeft,
  // ChevronRight,
  X,
  Check,
  // Settings,
} from 'lucide-react'
import ImageCard, { ImageItem } from './ImageCard'
import Lightbox from './Lightbox'

interface Collection {
  id: string
  name: string
  description?: string
  count: number
  thumbnail?: string
  isPublic?: boolean
  created: Date
}

interface ImageGalleryProps {
  images: ImageItem[]
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onImageAction?: (
    action: string,
    imageId: string | number,
    data?: unknown
  ) => void
  collections?: Collection[]
  onCollectionCreate?: (name: string, description?: string) => void
  onCollectionUpdate?: (id: string, data: Partial<Collection>) => void
  showCollections?: boolean
  viewMode?: 'grid' | 'list'
  compact?: boolean
  selectable?: boolean
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'downloads' | 'title'
type FilterOption = 'all' | 'liked' | 'public' | 'private' | 'recent'

export default function ImageGallery({
  images,
  loading = false,
  hasMore = false,
  onLoadMore,
  onImageAction,
  collections = [],
  _onCollectionCreate,
  _onCollectionUpdate,
  showCollections = true,
  viewMode: initialViewMode = 'grid',
  compact = false,
  selectable = false,
}: ImageGalleryProps) {
  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode)
  const [selectedImages, setSelectedImages] = useState<Set<string | number>>(
    new Set()
  )
  const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  )

  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Extract unique tags from images
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    images.forEach(image => {
      image.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [images])

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    const filtered = images.filter(image => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !image.title.toLowerCase().includes(query) &&
          !image.prompt.toLowerCase().includes(query) &&
          !image.tags?.some(tag => tag.toLowerCase().includes(query))
        ) {
          return false
        }
      }

      // Category filter
      switch (selectedFilter) {
        case 'liked':
          if (!image.isLiked) return false
          break
        case 'public':
          if (!image.isPublic) return false
          break
        case 'private':
          if (image.isPublic) return false
          break
        case 'recent':
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          const imageDate = image.createdAt || new Date(image.created)
          if (imageDate < weekAgo) return false
          break
      }

      // Tags filter
      if (selectedTags.length > 0) {
        if (!image.tags?.some(tag => selectedTags.includes(tag))) {
          return false
        }
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt || b.created).getTime() -
            new Date(a.createdAt || a.created).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt || a.created).getTime() -
            new Date(b.createdAt || b.created).getTime()
          )
        case 'popular':
          return b.likes - a.likes
        case 'downloads':
          return b.downloads - a.downloads
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [images, searchQuery, selectedFilter, selectedTags, sortBy])

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (
      hasMore &&
      !loading &&
      onLoadMore &&
      window.innerHeight + window.scrollY >=
        document.documentElement.offsetHeight - 1000
    ) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Image actions
  const handleImageAction = (
    action: string,
    imageId: string | number,
    data?: unknown
  ) => {
    onImageAction?.(action, imageId, data)
  }

  const handleImageView = (imageId: string | number) => {
    const image = filteredAndSortedImages.find(img => img.id === imageId)
    if (image) {
      const index = filteredAndSortedImages.indexOf(image)
      setLightboxImage(image)
      setLightboxIndex(index)
    }
  }

  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    const currentIndex = lightboxIndex
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0) newIndex = filteredAndSortedImages.length - 1
    if (newIndex >= filteredAndSortedImages.length) newIndex = 0

    setLightboxIndex(newIndex)
    setLightboxImage(filteredAndSortedImages[newIndex])
  }

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedImages.size === filteredAndSortedImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(filteredAndSortedImages.map(img => img.id)))
    }
  }

  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedImages)
    selectedIds.forEach(id => {
      handleImageAction(action, id)
    })
    setSelectedImages(new Set())
    setShowBulkActions(false)
  }

  const handleSelectImage = (imageId: string | number) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  useEffect(() => {
    setShowBulkActions(selectedImages.size > 0)
  }, [selectedImages.size])

  const filterOptions = [
    { id: 'all', label: '전체', icon: Grid3X3 },
    { id: 'liked', label: '좋아요', icon: Heart },
    { id: 'public', label: '공개', icon: Share2 },
    { id: 'private', label: '비공개', icon: Archive },
    { id: 'recent', label: '최근', icon: Calendar },
  ]

  const sortOptions = [
    { id: 'newest', label: '최신순' },
    { id: 'oldest', label: '오래된순' },
    { id: 'popular', label: '인기순' },
    { id: 'downloads', label: '다운로드순' },
    { id: 'title', label: '제목순' },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 검색 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="이미지 제목, 프롬프트, 태그로 검색..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 필터 버튼 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            필터
          </button>

          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 보기 모드 */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-3 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-3 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 카테고리 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  카테고리
                </label>
                <div className="space-y-2">
                  {filterOptions.map(option => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          setSelectedFilter(option.id as FilterOption)
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedFilter === option.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 태그 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  태그
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = selectedTags.includes(tag)
                          ? selectedTags.filter(t => t !== tag)
                          : [...selectedTags, tag]
                        setSelectedTags(newTags)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 컬렉션 */}
              {showCollections && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    컬렉션
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCollection(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCollection === null
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      전체 컬렉션
                    </button>
                    {collections.map(collection => (
                      <button
                        key={collection.id}
                        onClick={() => setSelectedCollection(collection.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCollection === collection.id
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{collection.name}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                          {collection.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 필터 초기화 */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedFilter('all')
                  setSelectedTags([])
                  setSelectedCollection(null)
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                모든 필터 초기화
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 선택된 태그들 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm flex items-center gap-2"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                onClick={() =>
                  setSelectedTags(selectedTags.filter(t => t !== tag))
                }
                className="hover:text-purple-800 dark:hover:text-purple-200"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {/* 결과 개수 및 일괄 선택 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedImages.length}개의 이미지
          {searchQuery && ` (총 ${images.length}개 중)`}
        </div>

        {selectable && filteredAndSortedImages.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              {selectedImages.size === filteredAndSortedImages.length
                ? '전체 해제'
                : '전체 선택'}
            </button>
            {selectedImages.size > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedImages.size}개 선택됨
              </span>
            )}
          </div>
        )}
      </div>

      {/* 일괄 작업 바 */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedImages.size}개 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('download')}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
                <button
                  onClick={() => handleBulkAction('addToCollection')}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                  <FolderPlus className="w-4 h-4" />
                  컬렉션에 추가
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
                <button
                  onClick={() => {
                    setSelectedImages(new Set())
                    setShowBulkActions(false)
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 갤러리 */}
      {filteredAndSortedImages.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? `grid gap-6 ${
                  compact
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`
              : 'space-y-4'
          }
        >
          <AnimatePresence>
            {filteredAndSortedImages.map(image => (
              <ImageCard
                key={image.id}
                image={image}
                onLike={id => handleImageAction('like', id)}
                onBookmark={id => handleImageAction('bookmark', id)}
                onDownload={id => handleImageAction('download', id)}
                onEdit={id => handleImageAction('edit', id)}
                onDelete={id => handleImageAction('delete', id)}
                onShare={id => handleImageAction('share', id)}
                onView={handleImageView}
                onRegenerate={id => handleImageAction('regenerate', id)}
                compact={compact || viewMode === 'list'}
                selected={selectedImages.has(image.id)}
                onSelect={selectable ? handleSelectImage : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            이미지를 찾을 수 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedTags.length > 0 || selectedFilter !== 'all'
              ? '검색 조건을 변경해보세요.'
              : '아직 생성된 이미지가 없습니다.'}
          </p>
          {(searchQuery ||
            selectedTags.length > 0 ||
            selectedFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedFilter('all')
                setSelectedTags([])
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              모든 필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* 더보기 버튼 */}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            더 많은 이미지 보기
          </button>
        </div>
      )}

      {/* 라이트박스 */}
      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          images={filteredAndSortedImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxImage(null)}
          onNavigate={handleLightboxNavigate}
          onAction={handleImageAction}
        />
      )}
    </div>
  )
}
