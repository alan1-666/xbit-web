import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useEffect, useRef } from 'react'
// import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { MemeTokenCard } from '@components/discover/cards/MemeTokenCard.tsx'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
// import { cn } from '@/lib/utils.ts'
import { MemeTokenWithFormatted } from '@/types/token.ts'
import { Loading } from '@components/common/Loading.tsx'
// import styles from '@/styles/discover.module.scss'

export interface TabMemeTokenListProps {
  tokens: MemeTokenWithFormatted[]
  isLoading: boolean
  hasNextPage: boolean
  onLoadMore?: () => void
  timeframe: TimeframeOption
  showProgress: boolean
  useFallbackLogo: boolean
  onAiClick?: (tokenAddress: string) => void
  refreshFn?: (pages: number[]) => void
}

// const OVERSCAN_PADDING = 96 * 5
//
// const VirtualizedList = (props: TabMemeTokenListProps) => {
//   const { tokens, hasNextPage, onLoadMore, timeframe, showProgress, useFallbackLogo, onAiClick } = props
//   const parentRef = useRef<HTMLDivElement>(null)
//
//   const rowVirtualizer = useWindowVirtualizer({
//     count: tokens.length,
//     estimateSize: () => 96,
//     overscan: 50,
//     isScrollingResetDelay: 50,
//     scrollMargin: parentRef.current?.offsetTop ?? 0,
//     useAnimationFrameWithResizeObserver: true,
//     getItemKey: (index) => `${tokens[index]?.token}-${index}`,
//   })
//
//   const items = rowVirtualizer.getVirtualItems()
//
//   useEffect(() => {
//     return () => {
//       if (parentRef.current) {
//         parentRef.current.innerHTML = ''
//       }
//     }
//   }, [])
//
//   const renderItems = useMemo(() => {
//     const scrollOffset = rowVirtualizer.scrollOffset ?? 0
//     const viewportHeight = window.innerHeight
//     const viewportStart = scrollOffset - OVERSCAN_PADDING
//     const viewportEnd = scrollOffset + viewportHeight + OVERSCAN_PADDING
//
//     return items.map((item) => {
//       const itemStart = item.start
//       const itemEnd = item.start + item.size
//       if (itemEnd > viewportStart && itemStart < viewportEnd) {
//         return {
//           type: 'card',
//           key: item.key,
//           token: tokens[item.index],
//           start: item.start,
//           index: item.index,
//         }
//       } else {
//         return {
//           type: 'skeleton',
//           key: item.key,
//           start: item.start,
//           index: item.index,
//         }
//       }
//     })
//   }, [items])
//
//   const lastItem = useMemo(() => {
//     return items[items.length - 1]
//   }, [items])
//
//   useEffect(() => {
//     const visibleItems = renderItems.filter((item) => item.type === 'card')
//     const lastVisibleItem = visibleItems[visibleItems.length - 1]
//     if (!lastVisibleItem) return
//     const lastIndex = lastVisibleItem.index
//     if (lastIndex >= tokens.length - 3) {
//       onLoadMore?.()
//     }
//   }, [renderItems])
//
//   // useEffect(() => {
//   //   const iv = setInterval(() => {
//   //     const visibleItems = renderItems.filter((item) => item.type === 'card')
//   //     const minPage = Math.floor(visibleItems[0]?.index / 20) || 0
//   //     const maxPage = Math.floor(visibleItems[visibleItems.length - 1]?.index / 20) || 0
//   //     const pages = Array.from({ length: maxPage - minPage + 1 }, (_, i) => i + minPage)
//   //     props.refreshFn?.(pages)
//   //   }, 5000)
//   //   return () => clearInterval(iv)
//   // }, [renderItems])
//
//   return (
//     <div ref={parentRef} className="h-full pb-5" style={{ contentVisibility: 'auto' }}>
//       <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize() + 75}px` }}>
//         {renderItems.map((item) => (
//           <div
//             key={item.key}
//             className="absolute top-0 left-0 w-full h-[96px] pb-[5px]"
//             style={{ transform: `translateY(${item.start - rowVirtualizer.options.scrollMargin}px)` }}
//           >
//             {item.key === 'loading' && (
//               <div className="h-full w-full flex justify-center items-center">
//                 <Loading />
//               </div>
//             )}
//             {item.type === 'skeleton' && (
//               <div className={cn(styles['card'], styles['meme'], 'size-full flex items-end')}>
//                 <div className="mt-auto bg-[#ECECED0F] w-full h-[30px] rounded-b-[6px]"></div>
//               </div>
//             )}
//             {item.type === 'card' && (
//               <MemeTokenCard
//                 key={item.key}
//                 token={item.token!}
//                 timeframe={timeframe}
//                 showProgress={showProgress}
//                 onAiClick={onAiClick}
//                 useFallbackLogo={useFallbackLogo}
//               />
//             )}
//           </div>
//         ))}
//         {hasNextPage && (
//           <div
//             className={cn('absolute top-0 left-0 w-full h-[108px] flex justify-center pt-4 pb-[5px]')}
//             style={{
//               transform: lastItem ? `translateY(${lastItem.start + 84 - rowVirtualizer.options.scrollMargin}px)` : '',
//             }}
//           >
//             <Loading />
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

export const TabMemeTokenList = (props: TabMemeTokenListProps) => {
  const { tokens, isLoading } = props

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      // Check if the user has scrolled to the bottom of the list, using window scroll position
      // notice that we are using window.scrollY instead of listRef.current.scrollTop
      if (
        listRef.current &&
        window.scrollY + window.innerHeight >= listRef.current.offsetTop + listRef.current.clientHeight - 100 // 100px from the bottom
      ) {
        // if (hasNextPage && !isFetchingNextPage && !isLoading) {
        //   fetchNextPage().then(() => {})
        // }
        props.onLoadMore?.()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [props.onLoadMore])

  if (isLoading) return <ListTokenSkeleton />
  if (tokens.length === 0) return <EmptyList />
  // return <VirtualizedList {...props} />
  return (
    <div ref={listRef} className="w-full relative">
      {tokens.map((item) => (
        <div className="mb-[5px]" key={item.token}>
          <MemeTokenCard
            key={item.token}
            token={item}
            timeframe={props.timeframe}
            showProgress={props.showProgress}
            onAiClick={props.onAiClick}
            useFallbackLogo={props.useFallbackLogo}
          />
        </div>
      ))}
      {props.hasNextPage && (
        <div className="w-full h-[80px] flex justify-center pt-4 pb-[5px]">
          <Loading />
        </div>
      )}
    </div>
  )
}
