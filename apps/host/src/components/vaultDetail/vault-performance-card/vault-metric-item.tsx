import { Info } from 'lucide-react'
import React from 'react'

interface VaultMetricItemProps {
  title: string
  value: string
  isShowInfo?: boolean
  isRegularColor?: boolean
  isShowGradient?: boolean
  customRenderValue?: () => React.ReactNode
}

const VaultMetricItem: React.FC<VaultMetricItemProps> = ({
  title,
  value,
  isShowInfo,
  isRegularColor,
  isShowGradient,
  customRenderValue,
}) => {
  const handleRenderColorValue = () => {
    if (isRegularColor) {
      return 'text-white'
    }
    if (value.includes('-')) {
      return 'text-[#AB57FF]'
    }
    return 'text-[#00FFB4]'
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 items-center">
        <div className="text-[calc(1rem*(12/16))] app-font-regular text-[#FFFFFFB2]">{title}</div>
        {isShowInfo && <Info className="size-[11.66px] text-[#9B9B9B]" />}
      </div>
      <div className="flex flex-col gap-1">
        {isShowGradient && <div className="linear-gradient-vault-metric rounded-[4px] w-full h-[4px]" />}
        <div className={`text-[calc(1rem*(14/16))] app-font-medium ${handleRenderColorValue()}`}>
          {customRenderValue ? customRenderValue() : value}
        </div>
      </div>
    </div>
  )
}

export default VaultMetricItem
