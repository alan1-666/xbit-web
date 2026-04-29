import React from 'react'
import { cn } from '@/lib/utils.ts'

type OrderRecordProps = {
  price: number
  quantity: number
  isDown?: boolean
  className?: string
  style?: React.CSSProperties
}

const OrderRecord = ({ price, quantity, isDown, className, style }: OrderRecordProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-[10px] app-font-medium text-[calc(1rem*(11/16))] leading-[1] mb-[11.55px] last:mb-0',
        className,
      )}
      style={style}
    >
      <div className={cn('text-[#00CE89]', isDown && 'text-[#AB57FF]')}>{price}</div>
      <div className="text-[#FFFFFFCC]">{quantity}</div>
    </div>
  )
}

export default OrderRecord
