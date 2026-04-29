import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useUserPnl } from '@/modules/prediction/hooks/useUserPnl'
import { EmptyList } from '@/components/discover/EmptyList'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { PortfolioChart } from '../portfolio/PortfolioChart'
import { RollingNumber } from '../portfolio/RollingNumber'
import { isArray } from 'lodash'
import { UserPnlFidelity, UserPnlInterval } from '@/@generated/gql/graphql-prediction.ts'
import { formatBalance } from '@/lib/format'
import { useTranslation } from 'react-i18next'

// const PERIOD_LABELS: Record<string, string> = {
//   '1D': 'Past Day',
//   '1W': 'Past Week',
//   '1M': 'Past Month',
//   ALL: 'All-Time',
// }

interface ProfitLossChartCardProps {
  userAddress: string
}

const ProfitLossChartCard = ({ userAddress }: ProfitLossChartCardProps) => {
  const { t } = useTranslation()
  const [activePeriod, setActivePeriod] = useState('1M')
  const [hoverData, setHoverData] = useState<{ value: number; date: Date } | null>(null)

  const { data: pnlData, isPending } = useUserPnl({
    userAddress,
    interval: UserPnlInterval.All,
    fidelity: UserPnlFidelity.OneDay,
  })

  // Calculate the latest PNL value from the data
  const latestPnl = pnlData && pnlData.length > 0 ? pnlData[pnlData.length - 1].p : 0

  const rawPnlData = isArray(pnlData) ? pnlData : []

  const isLoading = userAddress && isPending

  // if (!userAddress) {
  //   return (
  //     <div className="relative flex h-48 w-full flex-col justify-between rounded-xl bg-[#141418] border border-[#79778C29] p-4">
  //       <h2 className="text-sm font-medium text-gray-400 mb-2">{t('prediction.portfolio.totalPnl')}</h2>
  //       <EmptyList emptyText={t('prediction.portfolio.noData')} containerClassName="h-32 flex-1" />
  //     </div>
  //   )
  // }

  if (isLoading) {
    return (
      <div className="relative flex h-48 w-full flex-col justify-between rounded-xl  bg-[#141418] border border-[#79778C29] p-3">
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div className="flex w-full flex-col p-0 pb-2">
            <div className="mb-0 flex w-full flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-1.5">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="hidden gap-2 p-1">
                {['1D', '1W', '1M', 'ALL'].map((period) => (
                  <Skeleton key={period} className="h-7 w-9 rounded-md" />
                ))}
              </div>
            </div>
            <div className="mb-1 mt-2 flex items-center gap-1.5">
              <Skeleton className="h-9 w-32 rounded" />
            </div>
            <div className="mb-2 mt-2">
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="relative min-h-16 w-full flex-1">
              <Skeleton className="h-full w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-48 w-full flex-col justify-between rounded-xl  bg-[#141418] border border-[#79778C29] p-3">
      <div className="flex w-full flex-col overflow-hidden">
        <div className="flex w-full flex-col p-0 pb-2">
          <div className="mb-0 flex w-full flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-x-1.5">
              <h2 className="text-sm font-medium text-gray-400">{t('prediction.portfolio.totalPnl')}</h2>
            </div>
            <div className="relative flex">
              <div className="hidden gap-2 p-1">
                {['1D', '1W', '1M', 'ALL'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setActivePeriod(period)}
                    className={`relative z-10 h-7 w-9 cursor-pointer rounded-md bg-transparent text-xs font-semibold uppercase transition-colors md:text-sm ${
                      activePeriod === period ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {activePeriod === period && (
                      <motion.div
                        layoutId="activePeriod"
                        className="absolute inset-0 z-[-1] rounded-md bg-[#3a3a3c] shadow-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-start justify-between">
            <div className="mb-1 flex items-center gap-1.5">
              <span className={cn('pointer-events-none text-3xl font-semibold transition-colors')}>
                <RollingNumber
                  value={
                    hoverData
                      ? formatBalance(hoverData.value, {
                          showCurrency: true,
                        })
                      : formatBalance(latestPnl, {
                          showCurrency: true,
                        })
                  }
                />
              </span>
              {/* <PortfolioProfitLossTooltip /> */}
            </div>
          </div>
          <div className="flex flex-col relative">
            <p className="mb-2 text-xs font-medium text-gray-400 absolute top-0">{t('prediction.portfolio.allTime')}</p>
            <div className="relative min-h-24 w-full flex-1 mt-2.5">
              <div className="absolute inset-0">
                <div style={{ width: '100%', height: '100%' }}>
                  <PortfolioChart data={rawPnlData} onHover={setHoverData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfitLossChartCard
