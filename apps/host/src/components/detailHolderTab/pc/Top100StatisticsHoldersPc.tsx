import { getChainId } from '@/lib/blockchain'
import { formatPercent, formatPrice } from '@/lib/format'
import Loader from '@components/common/Loader.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { useHolderStatistics } from '@hooks/useHolderStatistics.ts'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Divider = React.memo(() => <div className="min-w-[1px] h-[12px] bg-[#ECECED14]" />)

type Props = {
  token?: string
}

const Top100StatisticsHoldersPc = (props: Props) => {
  const { t } = useTranslation()
  const { token } = props
  const activeChain = useActiveChain()

  const chainId = getChainId(activeChain)
  const { data, isLoading: loading } = useHolderStatistics({ token, chainId })

  return (
    <div className="flex items-center gap-4 px-2">
      <div className="flex items-center gap-1.5 py-3">
        <span className="text-[13px] font-light text-[#FFFFFF80] leading-[1]">
          {t('detail.holderChart.top100holding')}
        </span>
        <div className="text-[13px] font-normal text-[#FFFFFF] leading-[1]">
          {loading ? <Loader /> : formatPercent(data?.getTop100HolderStatistic?.totalHoldingPct ?? 0)}
        </div>
      </div>
      <Divider />
      <div className="flex items-center gap-1.5 py-3">
        <span className="text-[13px] font-light text-[#FFFFFF80] leading-[1]">
          {t('detail.holderChart.top100avgBuy')}
        </span>
        <div className="text-[13px] font-normal text-[#FFFFFF] leading-[1]">
          {loading ? (
            <Loader />
          ) : (
            formatPrice(data?.getTop100HolderStatistic?.averageBuyPrice ?? 0, {
              showCurrency: true,
              roundMode: 'ceil',
            })
          )}
        </div>
        <span className="flex items-center text-[13px] font-normal text-rise leading-[1]">
          (
          <span className="text-[13px] font-normal text-rise leading-[1]">
            {loading ? <Loader /> : formatPercent(data?.getTop100HolderStatistic?.averageBuyPrice24hChangePct ?? 0)}
          </span>
          )
        </span>
      </div>
      <Divider />
      <div className="flex items-center gap-1.5 py-3">
        <span className="text-[13px] font-light text-[#FFFFFF80] leading-[1]">
          {t('detail.holderChart.top100avgSell')}
        </span>
        <div className="text-[13px] font-normal text-[#FFFFFF] leading-[1]">
          {loading ? (
            <Loader />
          ) : (
            formatPrice(data?.getTop100HolderStatistic?.averageSellPrice ?? 0, {
              showCurrency: true,
              roundMode: 'ceil',
            })
          )}
        </div>
        <span className="flex items-center text-[13px] font-normal text-fall leading-[1]">
          (
          <span className="text-[13px] font-normal text-fall leading-[1]">
            {loading ? <Loader /> : formatPercent(data?.getTop100HolderStatistic?.averageSellPrice24hChangePct ?? 0)}
          </span>
          )
        </span>
      </div>
    </div>
  )
}

export default Top100StatisticsHoldersPc
