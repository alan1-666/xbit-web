import { useTranslation } from 'react-i18next'
import { formatNumberWithCommas } from '@/utils/helpers'
import { IconNodeAgentUpArrow,IconNodeAgentDownArrow } from '@/components/icon/IconNodeAgent'

// Removed useEffect and API call - now using data from parent component

interface TradingOverviewProps {
  data?: Array<{
    claimedUsd: string
    invitationCount: string
    pendingClaimUsd: string
    transactingUserCount: string
    transactionAmountUsd: string
  } | null>
  dataType: string
  timeRange: string
}

const PercentageChange = ({ value, className = "" }: { value: string; className?: string }) => {
  const isPositive = Number(value) >= 0
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isPositive ? <IconNodeAgentUpArrow className={'text-rise'} /> : <IconNodeAgentDownArrow className={'text-fall'} />}
      <span className={`text-sm font-medium ${isPositive ? 'text-rise' : 'text-fall'}`}>
        {value} %
      </span>
    </div>
  )
}

const MiniChart = () => {
  return (
    <div className="w-[80px] h-[40px] flex items-end justify-center">
      <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
        <path 
          d="M2 30L8 25L14 28L20 20L26 22L32 15L38 18L44 12L50 16L56 8L62 12L68 6L74 10L78 4" 
          stroke="var(--rise)" 
          strokeWidth="2" 
          fill="none"
        />
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--rise)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--rise)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path 
          d="M2 30L8 25L14 28L20 20L26 22L32 15L38 18L44 12L50 16L56 8L62 12L68 6L74 10L78 4L78 40L2 40Z" 
          fill="url(#chartGradient)"
        />
      </svg>
    </div>
  )
}

const TradingOverview = ({ data, dataType,timeRange }: TradingOverviewProps) => {
  const { t } = useTranslation()
  const actualData:any = data?.[0]

  return (
    <div className="space-y-3">
      {/* Main Card */}
      <div className="bg-[var(--bgInput)] rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[var(--text-secondary)] text-sm mb-2">
              {t('nodeAgent.tradingOverview.totalCommissionReceived')}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-title text-2xl font-bold">
                {formatNumberWithCommas(actualData?.claimedUsd || '0',6)}
              </span>
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] text-sm">
                {t('nodeAgent.tradingOverview.comparedToYesterday')}
              </span>
              <PercentageChange value={actualData?.claimedUsd || '0'} />
            </div> */}
          </div>
          {/* <div className="flex-shrink-0">
            <MiniChart />
          </div> */}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Derivatives Volume */}
        <div className="bg-[var(--bgInput)] rounded-xl p-4">
          <p className="text-[var(--text-secondary)] text-sm mb-2">
            {dataType === 'ALL' ? t('nodeAgent.tradingOverview.derivativesVolume') : t('nodeAgent.tradingOverview.Available')}
          </p>
          <div className="">
            <span className="text-title text-lg font-bold">
              {dataType === 'ALL' ? formatNumberWithCommas(actualData?.contractVolumeUsd || '0',6) : formatNumberWithCommas(actualData?.pendingClaimUsd || '0',6)}
    
            </span>
          </div>
          {/* <PercentageChange value={actualData?.pendingClaimUsd || '0'} /> */}
        </div>

        {/* Meme Volume */}
        <div className="bg-[var(--bgInput)] rounded-xl p-4">
          <p className="text-[var(--text-secondary)] text-sm mb-2">
            {dataType === 'CONTRACT' ?  t('nodeAgent.tradingOverview.derivativesVolume') : t('nodeAgent.tradingOverview.memeVolume')}
          </p>
          <div className="">
            <span className="text-title text-lg font-bold">
              {dataType === 'CONTRACT' ? formatNumberWithCommas(actualData?.contractVolumeUsd || '0',6) : formatNumberWithCommas(actualData?.memeVolumeUsd || '0',6)}
            </span>
          </div>
          {/* <PercentageChange value={actualData?.transactionAmountUsd || '0'} /> */}
        </div>

        {/* Invitees Count */}
        <div className="bg-[var(--bgInput)] rounded-xl p-4">
          <p className="text-[var(--text-secondary)] text-sm mb-2">
            {t('nodeAgent.tradingOverview.invitedCount')}
          </p>
          <div className="">
            <span className="text-title text-lg font-bold">
              {actualData?.invitationCount}
            </span>
          </div>
          {/* <PercentageChange value={actualData?.invitationCount || '0'} /> */}
        </div>

        {/* Traders Count */}
        <div className="bg-[var(--bgInput)] rounded-xl p-4">
          <p className="text-[var(--text-secondary)] text-sm mb-2">
            {t('nodeAgent.tradingOverview.tradersCount')}
          </p>
          <div className="">
            <span className="text-title text-lg font-bold">
              {actualData?.transactingUserCount}
            </span>
          </div>
          {/* <PercentageChange value={actualData?.transactingUserCount || '0'} /> */}
        </div>
      </div>
    </div>
  )
}

export default TradingOverview
