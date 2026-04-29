import { memo, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Trader } from '@/types/hypertrader.types'
import { TraderCard } from './Card'
import { throttle } from '@/utils/smart-money'
import { useLangKey } from '@/utils/address'

type Props = {
  data: Trader[]
  gap?: number
  onCardClick?: (addr: string, item: any) => void
  onEndReached?: () => void
}

export const CardGrid = memo(function CardGrid({ data, gap = 12, onCardClick, onEndReached }: Props) {
  const lang = useLangKey()
  const parentRef = useRef<HTMLDivElement | null>(null)

  const cols = 3
  const rows = useMemo(() => Math.ceil(data.length / cols), [data.length])

  const onEndReachedThrottled = useMemo(() => throttle(() => onEndReached?.(), 800), [onEndReached])

  const ROW_HEIGHT = 200 + 12
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    onChange: (v) => {
      const [last] = v.getVirtualItems().slice(-1)
      if (last && last.index >= rows - 3) onEndReachedThrottled()
    },
  })

  return (
    <div ref={parentRef} className="h-[calc(100vh-160px)] overflow-auto px-4 pb-12">
      <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
        {rowVirtualizer.getVirtualItems().map((vi) => {
          const start = vi.index * cols
          const end = Math.min(start + cols, data.length)
          const rowItems = data.slice(start, end)

          return (
            <div key={vi.key} className="absolute left-0 right-0" style={{ transform: `translateY(${vi.start}px)`}}>
              <div
                className="grid items-start"
                style={{
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gridAutoRows: 'minmax(0, max-content)',
                  gap: 12,
                }}
              >
                {rowItems.map((item) => (
                  <TraderCard
                    key={item.user_address}
                    id={item.user_address}
                    item={item}
                    commitMode="debounce"
                    onClick={onCardClick}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
