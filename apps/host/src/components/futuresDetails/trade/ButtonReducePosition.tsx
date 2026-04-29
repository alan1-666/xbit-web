import { useState, useRef } from 'react'
import { CheckboxXbit } from '@components/ui/checkbox-xbit.tsx'
import { cn } from '@/lib/utils.ts'

interface ButtonReducePosition {
  className?: string
  isReducePosition: boolean
  onReducePositionChange: (reduceOnly: boolean) => void;
}

const ButtonReducePosition = ({ className, isReducePosition,onReducePositionChange}: ButtonReducePosition) => {
  const handleChangeIsReducePosition = (status?: boolean) => {
    onReducePositionChange(status as boolean)
  }

  return (
    <div  
      className={cn('flex items-center', className)}
      onClick={() => {handleChangeIsReducePosition(!isReducePosition)}}
      >
      <CheckboxXbit
        checked={isReducePosition}
        className="cursor-pointer mr-1"
      >
      </CheckboxXbit>
      <span className='text-[calc(1rem*(10/16))] leading-[1] text-[#FFFFFFB2]'>只减仓</span>
    </div>
  )
}
export default ButtonReducePosition