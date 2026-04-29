import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAnnouncementPopup } from '@/hooks/useAnnouncementPopup'
import { AnnouncementPopupData } from '@/@generated/gql/graphql-admin'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'

const SWIPE_THRESHOLD = 50 // Minimum swipe distance to trigger slide change

const AnnouncementPopup = () => {
  const { open, popups, getLocalizedContents, onClose } = useAnnouncementPopup()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(new Set())
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  // Swipe handling
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Flatten all contents from all popups into slides
  const slides = useMemo(() => {
    const result: { id: string; content: AnnouncementPopupData }[] = []
    popups.forEach((popup) => {
      const contents = getLocalizedContents(popup)
      contents.forEach((content, index) => {
        if (content?.imageUrl) {
          result.push({
            id: `${popup.id}-${index}`,
            content,
          })
        }
      })
    })
    return result
  }, [popups, getLocalizedContents])

  const isLastSlide = currentIndex === slides.length - 1
  const isFirstSlide = currentIndex === 0

  // Prefetch all media when popup opens
  useEffect(() => {
    if (!open || slides.length === 0) return

    const markLoaded = (id: string) => {
      setLoadedMedia((prev) => new Set(prev).add(id))
    }

    slides.forEach((slide) => {
      const isVideo = slide.content.fileType === 'VIDEO'
      const url = slide.content.imageUrl ? encodeURI(slide.content.imageUrl) : null

      if (isVideo && url) {
        const video = document.createElement('video')
        video.preload = 'auto'
        video.src = url
        video.onloadeddata = () => markLoaded(slide.id)
        video.onerror = () => markLoaded(slide.id)
      } else if (url) {
        const img = new Image()
        img.src = url
        img.onload = () => markLoaded(slide.id)
        img.onerror = () => markLoaded(slide.id)
      }
    })

    return () => {
      setLoadedMedia(new Set())
    }
  }, [open, slides])

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onClose()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLastSlide, onClose])

  const handleBack = useCallback(() => {
    if (!isFirstSlide) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [isFirstSlide])

  const handleDotClick = useCallback(
    (index: number) => {
      if (index !== currentIndex) {
        setCurrentIndex(index)
      }
    },
    [currentIndex]
  )

  // Touch swipe handlers (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return

    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swipe left -> Next
        if (!isLastSlide) {
          setCurrentIndex((prev) => prev + 1)
        }
      } else {
        // Swipe right -> Back
        if (!isFirstSlide) {
          setCurrentIndex((prev) => prev - 1)
        }
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }, [isLastSlide, isFirstSlide])

  // Mouse drag handlers (PC)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    touchStartX.current = e.clientX
    touchEndX.current = null
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    touchEndX.current = e.clientX
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    if (touchStartX.current === null || touchEndX.current === null) return

    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Drag left -> Next
        if (!isLastSlide) {
          setCurrentIndex((prev) => prev + 1)
        }
      } else {
        // Drag right -> Back
        if (!isFirstSlide) {
          setCurrentIndex((prev) => prev - 1)
        }
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }, [isLastSlide, isFirstSlide])

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false
    touchStartX.current = null
    touchEndX.current = null
  }, [])

  // Reset index when popup closes
  useEffect(() => {
    if (!open) {
      setCurrentIndex(0)
    }
  }, [open])

  if (slides.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={() => onClose()}
        showDialogPrimitiveClose={false}
        className={cn(
          'bg-[#212127] border-none p-0 rounded-[24px] gap-4',
          'w-[90vw] max-w-[640px] overflow-hidden',
          'shadow-2xl'
        )}
      >
        {/* Carousel Container */}
        <div className="overflow-hidden">
          {/* Slides Track - all slides in a row, moves with translateX */}
          <div
            className="flex transition-transform duration-200 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => {
              const isCurrentMediaLoaded = loadedMedia.has(slide.id)
              return (
                <div key={slide.id} className="w-full flex-shrink-0">
                  {/* Media Section - with swipe/drag support */}
                  <div
                    className="p-5 pb-0 cursor-grab active:cursor-grabbing select-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    <MediaPlayer
                      content={slide.content}
                      slideId={slide.id}
                      isPreloaded={isCurrentMediaLoaded}
                      isActive={index === currentIndex}
                    />
                  </div>

                  {/* Content Section - no drag */}
                  <div className="px-5 mt-4">
                    {/* Title */}
                    <h3 className="text-white text-[20px] leading-[24px] font-bold line-clamp-2 mb-2">
                      {slide.content.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#908E98] text-[16px] leading-[22px] line-clamp-5">
                      {slide.content.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer with pagination and navigation */}
        <div className="pt-2 p-5 flex items-center justify-between">
          {/* Pagination Dots - windowed on mobile, full on desktop */}
          <div className="flex gap-1.5 items-center">
            {slides.map((_, index) => {
              // On mobile, show only 3 dots max (1 before + active + 1 after)
              if (!isDesktop) {
                const windowSize = 1
                const distanceFromCurrent = Math.abs(index - currentIndex)

                // Show current and dots within window
                const isVisible = distanceFromCurrent <= windowSize

                // Show small ellipsis dot if there are more slides before/after
                const isBeforeWindow = index === 0 && currentIndex > windowSize
                const isAfterWindow = index === slides.length - 1 && currentIndex < slides.length - 1 - windowSize
                const showAsEllipsis = isBeforeWindow || isAfterWindow

                if (!isVisible && !showAsEllipsis) return null

                return (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className="relative p-1.5 -m-1.5 group"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <span
                      className={cn(
                        'block h-1.5 rounded-full transition-all duration-200',
                        index === currentIndex
                          ? 'w-6 bg-white'
                          : showAsEllipsis
                            ? 'w-1 bg-[#4A4A4A] opacity-50'
                            : 'w-1.5 bg-[#4A4A4A] group-hover:bg-[#666666]'
                      )}
                    />
                  </button>
                )
              }

              // Desktop: show all dots
              return (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className="relative p-1.5 -m-1.5 group"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span
                    className={cn(
                      'block h-1.5 rounded-full transition-all duration-200',
                      index === currentIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-[#4A4A4A] group-hover:bg-[#666666]'
                    )}
                  />
                </button>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {!isFirstSlide && (
              <button
                type="button"
                onClick={handleBack}
                className={cn(
                  'px-6 py-2 text-[16px] h-9 leading-none',
                  'border border-[#605E68]',
                  'text-white bg-[#0a0a0a] rounded-full',
                  'hover:bg-[#2b2b34] transition-all duration-100',
                  'active:scale-95 cursor-pointer'
                )}
              >
                {t('const.button.previous')}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className={cn(
                'px-6 py-2 text-[16px] h-9 leading-none',
                'text-[#0A0A0A] bg-white rounded-full',
                'hover:text-[#908E98] transition-all duration-100',
                'active:scale-95 cursor-pointer'
              )}
            >
              {isLastSlide ? t('const.button.agree') : t('const.button.next')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Simple Loading spinner
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-[#141414]/50">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
)

// Media Player Component
interface MediaPlayerProps {
  content: AnnouncementPopupData
  slideId: string
  isPreloaded: boolean
  isActive: boolean
}

const MediaPlayer = ({ content, slideId, isPreloaded, isActive }: MediaPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  const isVideo = content.fileType === 'VIDEO'
  const mediaUrl = content.imageUrl ? encodeURI(content.imageUrl) : ''

  useEffect(() => {
    setIsReady(isPreloaded)
    setHasError(false)
  }, [slideId, isPreloaded])

  // Play/pause video based on active state
  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isActive && isReady && !hasError) {
        videoRef.current.play().catch(() => { })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isVideo, isActive, isReady, hasError])

  const handleLoadComplete = () => {
    setIsReady(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsReady(true)
  }

  const containerClasses = cn(
    'relative w-full aspect-[4/3] bg-[#0D0D12] rounded-xl overflow-hidden select-none'
  )

  // Fallback UI when media fails to load
  if (hasError) {
    return (
      <div className={containerClasses}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <img src="/images/kairox-logo.svg" alt="logo" className="w-16 h-14" />
          <img src="/images/kairox-logo-text.svg" alt="logo" className="h-6" />
        </div>
      </div>
    )
  }

  if (isVideo) {
    return (
      <div className={containerClasses}>
        {!isReady && <LoadingSpinner />}
        <video
          ref={videoRef}
          src={mediaUrl}
          className={cn(
            'w-full h-full object-contain transition-opacity duration-300 pointer-events-none',
            isReady ? 'opacity-100' : 'opacity-0'
          )}
          muted
          loop
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          onLoadedMetadata={handleLoadComplete}
          onLoadedData={handleLoadComplete}
          onCanPlay={handleLoadComplete}
          onError={handleError}
        />
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      {!isReady && <LoadingSpinner />}
      <img
        src={mediaUrl}
        alt={content.title || ''}
        draggable={false}
        className={cn(
          'w-full h-full object-contain transition-opacity duration-300 pointer-events-none',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoadComplete}
        onError={handleError}
      />
    </div>
  )
}

export default AnnouncementPopup
