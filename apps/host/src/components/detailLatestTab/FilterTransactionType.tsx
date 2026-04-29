import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TxType as TransactionType } from '@/@generated/gql/graphql-future.ts'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import { X } from 'lucide-react'
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
} from '@components/ui/drawer.tsx'

type Placement = 'bottom-end' | 'bottom-start' | 'bottom'
function useAnchoredPosition(anchorRef: React.RefObject<HTMLElement | null>, open: boolean, placement: Placement) {
  const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', visibility: 'hidden' })
  const update = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    let left = rect.left
    let top = rect.bottom + 6
    const menuWidth = 220
    if (placement === 'bottom-end') left = rect.right - menuWidth
    else if (placement === 'bottom') left = rect.left + rect.width / 2 - menuWidth / 2
    // clamp
    const vw = window.innerWidth, vh = window.innerHeight
    left = Math.max(8, Math.min(left, vw - 8 - menuWidth))
    top = Math.max(8, Math.min(top, vh - 8))
    setStyle({ position: 'fixed', top, left, zIndex: 60 })
  }, [anchorRef, placement])

  useLayoutEffect(() => {
    // Always call the hook; effect does nothing when closed.
    if (!open) return
    update()
    const onScroll = () => update()
    const onResize = () => update()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, update])

  return style
}

const TickOrCircle = ({ checked, size = 14 }: { checked: boolean; size?: number }) =>
  checked ? (
    <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="selected" style={{ width: size, height: size }} />
  ) : (
    <div className="border border-[#37363D] rounded-full" style={{ width: size, height: size }} />
  )

const Panel = ({ selected, setSelected, onConfirm, compact }:{
  selected: TransactionType; setSelected:(t:TransactionType)=>void; onConfirm:()=>void; compact?:boolean
}) => {
  const { t } = useTranslation()
  const options = useMemo(() => [
    { value: TransactionType.All, label: t('detail.tabs.all') },
    { value: TransactionType.Buy, label: t('history.buy') },
    { value: TransactionType.Sell, label: t('history.sell') },
    // { value: TransactionType.SingleSideLiquidity, label: t('history.SingleSidedPool') },
    // { value: TransactionType.AddLiquidity, label: t('history.addLiquidity') },
    // { value: TransactionType.RemoveLiquidity, label: t('history.removeLiquidity') },
  ], [t])

  return (
    <div className={compact ? 'p-1 rounded-[4px]' : 'flex flex-col gap-2'}>
      <ul className="flex flex-col gap-2">
        {options.map(opt => (
          <li
            key={opt.value}
            className={`flex items-center justify-between gap-2 cursor-pointer rounded-[8px] ${
              compact ? 'px-2 py-3 hover:bg-[#18181B] min-w-[220px]' : 'px-4 py-[18px] bg-[#2B2B33]'
            }`}
            onClick={() => setSelected(opt.value)}
          >
            <span className={compact ? 'text-[14px] leading-[1] font-light' : ''}>{opt.label}</span>
            <TickOrCircle checked={selected === opt.value} size={compact ? 14 : 25} />
          </li>
        ))}
      </ul>
      <div className={`flex justify-end gap-2.5 ${compact ? 'pt-4' : 'pt-2'}`}>
        <Button size="lg" variant="gradient" className={compact ? 'h-8 rounded-[50px]' : 'h-9 rounded-[50px]'} onClick={onConfirm}>
          {t('chart.buttons.confirm')}
        </Button>
      </div>
    </div>
  )
}

type Props = {
  open: boolean
  setOpen: (v: boolean) => void
  currentType: TransactionType
  updateTransactionType: (type: TransactionType) => void
  anchorRef: React.RefObject<HTMLElement | null>
  placement?: Placement
}

const FilterTransactionTypeAnchored = ({
  open, setOpen, currentType, updateTransactionType, anchorRef, placement = 'bottom-end',
}: Props) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [selected, setSelected] = useState<TransactionType>(currentType)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // ❗ Call hook UNCONDITIONALLY every render
  const style = useAnchoredPosition(anchorRef, open, placement)

  useEffect(() => { setSelected(currentType) }, [currentType])

  const onConfirm = useCallback(() => {
    if (selected !== currentType) updateTransactionType(selected)
    setOpen(false)
  }, [selected, currentType, updateTransactionType, setOpen])

  // outside click + Esc (hook still called every render)
  useEffect(() => {
    if (!open || !isDesktop) return
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (containerRef.current?.contains(t)) return
      if (anchorRef.current && anchorRef.current.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, isDesktop, setOpen, anchorRef])

  // Mobile/Tablet uses Drawer (safe to branch after hooks)
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
        <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto">
          <DrawerHeader>
            <DrawerTitle className="mt-1.5">
              <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('detail.tokenDetail.finalType')}
              </div>
            </DrawerTitle>
            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="size-5" />
            </DrawerClose>
          </DrawerHeader>
          <DrawerDescription />
          <DrawerFooter className="p-3">
            <Panel selected={selected} setSelected={setSelected} onConfirm={onConfirm} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: render portal only when open (hook already called)
  return open
    ? createPortal(
      <div
        ref={containerRef}
        style={style}
        className="rounded-[8px] border border-[#2e2e36] bg-[#16161a] shadow-xl p-1 min-w-[220px]"
        role="menu"
      >
        <div className="px-2 pt-2 pb-1 text-[13px] opacity-70">
          {t('detail.tokenDetail.finalType')}
        </div>
        <Panel selected={selected} setSelected={setSelected} onConfirm={onConfirm} compact />
      </div>,
      document.body
    )
    : null
}

export default memo(FilterTransactionTypeAnchored)
