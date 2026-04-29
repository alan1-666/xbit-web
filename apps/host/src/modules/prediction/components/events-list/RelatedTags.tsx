import { useRelatedTags } from '@/modules/prediction/hooks/useRelatedTags.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { cn } from '@/lib/utils.ts'
import { useSearchParams } from 'react-router-dom'
import { RelatedTag } from './RelatedTag.tsx'
import OptionsBar from './OptionsBar.tsx'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import FilterBar from './FilterBar.tsx'

export interface RelatedTagsProps {
  tagSlug: string
  /** When true, skeleton is hidden on xl screens (e.g. elections with sidebar nav) */
  hideSkeletonOnXl?: boolean
}

const SCROLL_STEP = 120

export const RelatedTags = (props: RelatedTagsProps) => {
  const { tagSlug, hideSkeletonOnXl } = props
  const { data, isPending } = useRelatedTags(tagSlug)
  const [searchParams, setSearchParams] = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const currentTag = searchParams.get('tag') || 'all'
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const handleTagClick = (tagSlug: string) => {
    if (tagSlug === 'all') {
      searchParams.delete('tag')
    } else {
      searchParams.set('tag', tagSlug)
    }
    setSearchParams(searchParams)
  }

  const updateScrollArrows = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1) // -1 to avoid float issues
  }, [])

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return

    // Translate vertical scroll into horizontal scroll if vertical is dominant
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY
    }
  }, [])

  const handleScrollLeft = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
    // Update arrows after smooth scroll animation completes
    setTimeout(updateScrollArrows, 150)
  }, [updateScrollArrows])

  const handleScrollRight = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
    // Update arrows after smooth scroll animation completes
    setTimeout(updateScrollArrows, 150)
  }, [updateScrollArrows])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    updateScrollArrows()

    const handleScroll = () => updateScrollArrows()
    el.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [updateScrollArrows])

  useEffect(() => {
    // small timeout so children render before measuring
    const id = window.setTimeout(updateScrollArrows, 0)
    return () => window.clearTimeout(id)
  }, [data, updateScrollArrows])

  if (isPending) {
    return (
      <div className={cn('mb-4 flex items-center gap-2', hideSkeletonOnXl && 'xl:hidden')}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[30px] w-20 shrink-0 rounded-md" />
        ))}
      </div>
    )
  }

  if (data?.length === 0) return null

  return (
    <>
      <div className="relative flex w-full items-center gap-2">
        <div
          ref={containerRef}
          onWheel={onWheel}
          className="no-scrollbar flex flex-1 min-w-0 items-center gap-1 lg:gap-2 overflow-x-auto overscroll-contain"
        >
          <RelatedTag label="All" slug="all" isActive={currentTag === 'all'} onClick={handleTagClick} />
          {data?.map((tag) => (
            <RelatedTag
              key={tag.slug}
              label={tag.label || ''}
              slug={tag.slug || ''}
              isActive={currentTag === tag.slug}
              onClick={handleTagClick}
            />
          ))}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            onClick={handleScrollLeft}
            className="absolute top-1/2 left-0 z-5 flex h-7.5 w-6 -translate-y-1/2 items-center justify-center bg-[#0A0A0A]"
          >
            <img src="/images/icons/icon-more.svg" alt="scroll-left" className="size-4 rotate-180" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={handleScrollRight}
            className="absolute top-1/2 right-10 z-5 flex h-7.5 w-6 -translate-y-1/2 items-center justify-end bg-[#0A0A0A]"
          >
            <img src="/images/icons/icon-more.svg" alt="scroll-right" className="size-4" />
          </button>
        )}

        <div className="ml-2 shrink-0">
          <OptionsBar />
        </div>
      </div>
      <FilterBar />
    </>
  )
}
