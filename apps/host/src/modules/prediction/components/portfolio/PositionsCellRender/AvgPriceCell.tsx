import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip'
import { ArrowRightIcon } from '../../icons'
import { usePortfolio } from '@/modules/prediction/context/PortfolioContext'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const AvgPriceCell = () => {
  const { t } = useTranslation()
  const { sortBy, sortDirection, setSort } = usePortfolio()
  const isActive = sortBy === 'avg'

  return (
    <div className="flex flex-row items-center justify-start select-none cursor-pointer" onClick={() => setSort('avg')}>
      <span
        className={cn(
          'leading-3.75 tracking-wider flex items-center gap-1 text-[#FFFFFF80] text-sm font-[330]',
          'font-medium text-gray-500 hover:text-white',
        )}
      >
        <div className="flex flex-row items-center gap-x-1 text-[#FFFFFF80] text-sm font-[330]">
          <span>{t('prediction.table.avg')}</span>
          <ArrowRightIcon className="text-gray-600" />
          <span>{t('prediction.table.now')}</span>
          <SimpleTooltip
            content={
              <div className="flex flex-col gap-1 text-center">
                <span>{t('prediction.table.avgPriceTooltip')}</span>
              </div>
            }
          >
            <div className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <img className="w-4 min-w-4" alt="" src="/images/orderSetting/icon-info.svg" />
            </div>
          </SimpleTooltip>
          {isActive && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      </span>
    </div>
  )
}

export default AvgPriceCell
