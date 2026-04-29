import { useState } from 'react'
import { IconArrowDown2 } from '@/components/icon'
import { cn } from '@/lib/utils'
import { ReactComponent as AiIcon } from '@/components/icon/smart-money/ai.svg'
import AIDrawer from './AIDrawer'
import { useTranslation } from 'react-i18next'

type AICardProp = {
  address: string
  summary: JSX.Element
  enableToExpand?: boolean
}

const AICard = ({ address, summary, enableToExpand = true }: AICardProp) => {
  const { t } = useTranslation()
  const [isExpand, setIsExpand] = useState(!enableToExpand)

  const toggleExpand = () => {
    if(enableToExpand) {
      setIsExpand((prev) => !prev)
    } else {
      setIsExpand(true)
    }
    
  }

  return (
    <div className="w-full">
      <div className={cn("w-full py-3 bg-[#18181B] rounded-md flex flex-col gap-2.5 px-2.5")}>
        <div className="flex items-center justify-between cursor-pointer select-none" onClick={toggleExpand}>
          <div className="flex items-center gap-2">
            <AiIcon className="h-3.5 w-5 text-[#C8A7FD]" />
            <div className="text-[#C8A7FD] text-base font-normal font-['Geist'] leading-4">{t('smartMoney.addressDetail.AISummary')}</div>
          </div>

          {enableToExpand && <IconArrowDown2
            className={cn('h-4 w-4 text-[#878787] transition-transform duration-200', isExpand && 'rotate-180')}
          />}
        </div>

        {isExpand && (
          <div className="flex flex-col gap-2.5">
            <div className="text-left text-white text-sm font-light font-['Geist'] leading-5">{summary}</div>

            <div className="flex justify-end">
              <AIDrawer address={address} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AICard
