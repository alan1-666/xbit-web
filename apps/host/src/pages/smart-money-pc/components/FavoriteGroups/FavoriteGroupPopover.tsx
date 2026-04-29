import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ReactComponent as TickIcon } from '@/components/icon/supervisory/tick_icon.svg'
import { useTranslation } from 'react-i18next';

export type GroupOption = { label: string; value: string }

type Props = {
  open: boolean
  anchorEl: HTMLElement | null
  groupList: GroupOption[]
  selectedValue: string | null
  onSelect: (value: string) => void

  // 新建分组（创建完成后会默认选中它）
  onCreate: (name: string) => void

  // 关闭
  onClose: () => void

  width?: number

  placement?: 'right' | 'left' | 'auto'
}

export const FavoriteGroupPopover = ({
  open,
  anchorEl,
  groupList,
  selectedValue,
  onSelect,
  onCreate,
  onClose,
  width,
  placement = 'right',
}: Props) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open || !anchorEl) return

    const update = () => {
      const rect = anchorEl.getBoundingClientRect()
      const w = width ?? rect.width

      const gap = 8
      const viewportLeft = window.scrollX + gap
      const viewportRight = window.scrollX + window.innerWidth - gap

      // 默认 top
      const top = rect.bottom + 8 + window.scrollY

      // 计算左右两种 left
      const leftForRight = rect.left + window.scrollX                 // 面板左对齐锚点左
      const leftForLeft = rect.right + window.scrollX - w             // 面板右对齐锚点右

      // auto：优先不溢出的一边
      const wouldOverflowRight = leftForRight + w > viewportRight
      const wouldOverflowLeft = leftForLeft < viewportLeft

      let left = leftForRight
      if (placement === 'left') left = leftForLeft
      else if (placement === 'auto') {
        if (wouldOverflowRight && !wouldOverflowLeft) left = leftForLeft
        else left = leftForRight
      }

      // clamp 防止出界
      left = Math.min(Math.max(left, viewportLeft), viewportRight - w)

      setStyle({
        position: 'absolute',
        top,
        left,
        width: w,
        zIndex: 9999,
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
      "
    >
      {/* 选项区 */}
      <div className="p-3">
        {groupList.map((g) => {
          const active = g.value === selectedValue
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
              onClick={() => onSelect(g.value)}
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
                {/* 勾 */}
                {active ? (
                  //   <TickIcon className='w-3.5 h-3.5' />
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
        })}
      </div>

      {/* 底部：新建分组 */}
      <div className="border-t border-white/10 p-3">
        <CreateGroupInline onCreate={onCreate} />
      </div>
    </div>,
    document.body,
  )
}

export const CreateGroupInline = ({ onCreate }: { onCreate: (name: string) => void }) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')

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
          focus:border-white/20
        "
      />
      <button
        type="button"
        onClick={() => {
          const v = name.trim()
          if (!v) return
          onCreate(v)
          setName('')
        }}
        className="
          text-sm
          h-9 px-6 rounded-lg
          bg-[#6D4CFF] text-white font-medium
          hover:opacity-90
          active:opacity-80
        "
      >
        {t('smartMoney.supervisory.create')}
      </button>
    </div>
  )
}
