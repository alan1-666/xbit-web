import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { GroupManageDialog } from '../GroupManageDialog'
import { CreateGroupInline } from './CreateGroupInline'
import { ReactComponent as ReturnIcon } from '@/components/icon/supervisory/return.svg'

export type GroupOption = { label: string; value: string }

type Props = {
  value?: string
  onChange?: (v: string) => void
  options: GroupOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

export const GroupSelectField: React.FC<Props> = ({
  value,
  onChange,
  options,
  label = 'Address Group',
  placeholder = 'Please select',
  disabled,
}) => {
  const [open, setOpen] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const selectedLabel = useMemo(() => {
    return options.find((g) => g.value === value)?.label ?? ''
  }, [options, value])

  const syncPosition = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDropdownStyle({
      position: 'absolute',
      top: rect.bottom + 6 + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      zIndex: 9999,
    })
  }

  // 打开时定位 + 监听滚动/resize 重新定位
  useEffect(() => {
    if (!open) return
    syncPosition()
    const onScroll = () => syncPosition()
    const onResize = () => syncPosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  // 点击外部关闭：同时判断 trigger + dropdown（portal）
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (dropdownRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div>
      <label className="text-sm text-gray-300 flex justify-between items-center">
        {label}
        <GroupManageDialog />
      </label>

      <div className="mt-2 relative">
        <div
          ref={triggerRef}
          className={cn(
            'w-full h-11 px-3 rounded-lg bg-[#0E0E11] border border-[#2A2A2F]',
            'flex items-center justify-between text-sm text-white',
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          )}
          onClick={() => {
            if (disabled) return
            setOpen((o) => !o)
          }}
        >
          <span className={cn(!selectedLabel && 'text-gray-500')}>{selectedLabel || placeholder}</span>
          <span className="opacity-40">▼</span>
        </div>

        {open &&
          createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className="rounded-lg bg-[#0E0E11] border border-[#2A2A2F] text-sm text-white shadow-xl overflow-hidden"
              // 防止滚轮滚到外层（不让 label/表单那层一起滚）
              onWheelCapture={(e) => e.stopPropagation()}
            >
              <div className="max-h-[260px] overflow-auto overscroll-contain">
                {options.map((g) => (
                  <div
                    key={g.value}
                    className={cn('p-3 cursor-pointer hover:bg-[#2A2A2F]', g.value === value && 'bg-[#2A2A2F]')}
                    // 用 onMouseDown / onPointerDown 保证在外部关闭之前先选中
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange?.(g.value)
                      setOpen(false)
                    }}
                  >
                    {g.label}
                  </div>
                ))}
              </div>

              <CreateGroupInline />
            </div>,
            document.body,
          )}
      </div>
    </div>
  )
}
