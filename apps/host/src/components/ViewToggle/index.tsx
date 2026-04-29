import { memo } from 'react'
import clsx from 'clsx'
import { ReactComponent as VerticalList } from '@/components/icon/smart-money/vertical_list.svg'
import { ReactComponent as ThwartwiseList } from '@/components/icon/smart-money/thwartwise_list.svg'


export type ViewMode = 'card' | 'list'

type Props = {
  mode: ViewMode
  onChange: (m: ViewMode) => void
  className?: string
}

export const ViewToggle = memo(function ViewToggle({ mode, onChange, className }: Props) {
  const baseBtn = 'p-1.5 grid place-items-center rounded transition-colors'
  const active = 'bg-black/70 text-white shadow-[0_0_0_1px_rgba(255,255,255,.08)_inset]'
  const idle = 'text-white/60 hover:text-white/85'

  return (
    <div
      className={clsx('h-8.5 md:h-8.5 rounded bg-[#908E9829] p-1 flex items-center gap-1', className)}
      role="tablist"
      aria-label="view-toggle"
    >
      <button
        role="tab"
        aria-selected={mode === 'card'}
        className={clsx(baseBtn, mode === 'card' ? active : idle)}
        onClick={() => onChange('card')}
        title="Cards"
      >
        {/* 卡片网格图标 */}
        <VerticalList className="w-4 h-4" style={{ color: 'currentColor' }} />
      </button>
      <button
        role="tab"
        aria-selected={mode === 'list'}
        className={clsx(baseBtn, mode === 'list' ? active : idle)}
        onClick={() => onChange('list')}
        title="List"
      >
        {/* 列表图标 */}
        <ThwartwiseList className="w-4 h-4" style={{ color: 'currentColor' }} />
      </button>
    </div>
  )
})
