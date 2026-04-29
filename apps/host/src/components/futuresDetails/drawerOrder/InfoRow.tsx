import { cn } from '@/lib/utils'
import React from 'react'

interface InfoRowProps {
  label: string
  value: string | number
  suffix?: string
  valueColor?: string
}

const InfoRow = ({ label, value, suffix, valueColor }: InfoRowProps) => {
  const getTextColor = () => {
    if (suffix?.includes('-')) {
      return 'text-[#AB57FF]'
    } else {
      return 'text-[#00FFB4]'
    }
  }

  return (
    <div className="flex justify-between items-center">
      <div className="text-[#FFFFFFB2] text-[calc(1rem*(11/16))]">{label}</div>
      <div className="flex items-center text-[calc(1rem*(12/16))] font-[500]">
        <span className={cn(valueColor)}>{value}</span>
        {suffix && <span className={`ml-1 ${getTextColor()}`}>{suffix}</span>}
      </div>
    </div>
  )
}

export default InfoRow
