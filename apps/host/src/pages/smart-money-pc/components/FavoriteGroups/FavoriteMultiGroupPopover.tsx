import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useTranslation } from 'react-i18next';

export type GroupOption = { label: string; value: string }

type Props = {
  open: boolean
  anchorEl: HTMLElement | null
  groupList: GroupOption[]
  selectedValues: string[]
  onChange: (nextValues: string[]) => void
  onCreate: (name: string) => Promise<void> | void
  onClose: () => void
  width?: number
  placement?: 'right' | 'left' | 'auto'
}

export const FavoriteMultiGroupPopover = ({
  open,
  anchorEl,
  groupList,
  selectedValues,
  onChange,
  onCreate,
  onClose,
  width,
  placement = 'right',
}: Props) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [maxPanelHeight, setMaxPanelHeight] = useState<number>(420)

  useEffect(() => {
    if (!open || !anchorEl) return

    const update = () => {
      const rect = anchorEl.getBoundingClientRect()
      const w = width ?? rect.width

      const gap = 8
      const viewportLeft = window.scrollX + gap
      const viewportRight = window.scrollX + window.innerWidth - gap
      const viewportBottom = window.scrollY + window.innerHeight - gap

      const top = rect.bottom + 8 + window.scrollY

      const leftForRight = rect.left + window.scrollX
      const leftForLeft = rect.right + window.scrollX - w

      const wouldOverflowRight = leftForRight + w > viewportRight
      const wouldOverflowLeft = leftForLeft < viewportLeft

      let left = leftForRight
      if (placement === 'left') left = leftForLeft
      else if (placement === 'auto') {
        if (wouldOverflowRight && !wouldOverflowLeft) left = leftForLeft
        else left = leftForRight
      }
      left = Math.min(Math.max(left, viewportLeft), viewportRight - w)

      const max80vh = window.innerHeight * 0.7
      const availableBelow = viewportBottom - top
      const maxH = Math.max(220, Math.min(max80vh, availableBelow))

      setMaxPanelHeight(maxH)

      setStyle({
        position: 'absolute',
        top,
        left,
        width: w,
        zIndex: 9999,
        maxHeight: maxH,
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorEl, width, placement])

  // 点击外部关闭
  useEffect(() => {
    if (!open) return

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      const inPanel = panelRef.current?.contains(target)
      const inAnchor = anchorEl?.contains(target)
      if (!inPanel && !inAnchor) onClose()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, anchorEl])

  if (!open || !anchorEl) return null

  const selectedSet = new Set((selectedValues ?? []).map(String))

  const toggleValue = (v: string) => {
    const key = String(v)
    const next = selectedSet.has(key) ? selectedValues.filter((x) => String(x) !== key) : [...selectedValues, key]
    onChange(next)
  }

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className="
        rounded-lg
        bg-[#15161B]
        border border-white/10
        shadow-2xl
        overflow-hidden
        flex flex-col
      "
    >
      <div
        className="p-3 overflow-auto"
        style={{
          maxHeight: Math.max(120, maxPanelHeight - 100),
        }}
      >
        {groupList && groupList.length > 0 ? (
          groupList.map((g) => {
            const active = selectedSet.has(String(g.value))
            return (
              <button
                key={g.value}
                type="button"
                className={`
                  w-full
                  px-4 py-3
                  flex items-center justify-between
                  text-left
                  text-[14px]
                  rounded-lg
                  ${active ? 'bg-white/6' : 'bg-transparent'}
                  hover:bg-white/6
                `}
                onClick={() => toggleValue(g.value)}
              >
                <span className="text-white/90">{g.label}</span>

                <span
                  className={`
                    w-4 h-4
                    rounded-sm
                    flex items-center justify-center
                    ${active ? 'bg-[#6D4CFF]' : 'bg-transparent border border-white/12'}
                  `}
                >
                  {active ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="white"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </button>
            )
          })
        ) : (
          <EmptyList />
        )}
      </div>

      <div className="border-t border-white/10 p-3 shrink-0">
        <CreateGroupInline onCreate={onCreate} />
      </div>
    </div>,
    document.body,
  )
}

export const CreateGroupInline = ({ onCreate }: { onCreate: (name: string) => void }) => {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const { t } = useTranslation()
  
  const onCreateClick = async () => {
    const v = name.trim()
    if (!v || creating) return
    try {
      setCreating(true)
      await onCreate(v)
      setName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex gap-3 items-center">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="请输入分组名称"
        className="
          flex-1 h-9 px-4 rounded-lg
          bg-[#0E0E11]
          text-sm text-white/90 placeholder-[#605E6A]
          outline-none
          border border-transparent
          focus:border-white/20
        "
      />
      <button
        type="button"
        disabled={creating}
        onClick={onCreateClick}
        className="text-sm h-9 px-6 rounded-lg bg-[#6D4CFF] text-white font-medium hover:opacity-90 active:opacity-80 disabled:opacity-60"
      >
        {t('smartMoney.supervisory.create')}
      </button>
    </div>
  )
}
