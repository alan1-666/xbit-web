import React, { useMemo, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { CopyButton } from '../common/copy-button'
import { IconWallet } from '../icon/stroke/IconWallet'
import { IconClockStroke } from '../icon'
import { IconChart } from '../icon/stroke/IconChart'
import { IconArrowDownCircle, IconArrowUpCircle, IconExpand, IconExport, IconNewFilter } from '../icon/stroke'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice'
import { ChainIds } from '@/types/enums'
import { getWalletInfo2 } from '@/services/tokens.service'
import { formatAddressWallet } from '@/lib/string'
import { fShortenNumber } from '@/lib/number'
import CurrencyToggle from '@components/detailTokenTabs/CurrencyToggle.tsx'
import { useAppSelector } from '@/redux/store'
import { cn } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { useQuery } from '@tanstack/react-query'
import { WalletStatisticDto } from '@/@generated/gql/graphql-meme2.ts'
import { HoldingDuration } from '../detaiTokenTable/WalletStatisticTooltipPC.tsx'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_ORDERBOOK_ADDRESS_SELECTED } from './OrderBookPC.tsx'

type Props = {
  children: React.ReactNode
  transaction: RealtimeTransaction
  chainId: ChainIds
  tokenAddress: string
  open: boolean
  setOpen: (open: boolean) => void
}

type StatsValueProps = {
  value: number
  className?: string
  sign?: boolean
}

/** Lightweight tooltip handled by mouse events, rendered inside its parent card */
const HoverTip = React.memo(function HoverTip({
  tip,
  children,
  align = 'center',
  position = 'bottom',
}: {
  tip: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  position?: 'top' | 'bottom'
}) {
  const [show, setShow] = useState(false)
  const onEnter = useCallback(() => setShow(true), [])
  const onLeave = useCallback(() => setShow(false), [])

  const alignment =
    align === 'left'
      ? 'left-0 translate-x-0'
      : align === 'right'
        ? 'right-0 translate-x-0'
        : 'left-1/2 -translate-x-1/2'

  const verticalPosition =
    position === 'top' ? 'bottom-[calc(100%+6px)] origin-bottom' : 'top-[calc(100%+6px)] origin-top'

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{
              opacity: 0,
              y: position === 'top' ? -4 : 4,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: position === 'top' ? -4 : 4,
              scale: 0.98,
            }}
            transition={{ duration: 0.16 }}
            className={`absolute z-20 ${verticalPosition} ${alignment}`}
          >
            <div className="min-w-[160px] rounded-md border border-[#79778c29] bg-[#2a2b31] p-2 shadow-xl">{tip}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

/** Small stat card */
const StatCard = React.memo(function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#2a2b31] rounded-[4px] p-3 flex flex-col items-center justify-center select-none">
      {children}
    </div>
  )
})

const RowLabel = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <p className={`text-[12px] font-[330] leading-none ${className}`}>{children}</p>
)

const AmountP = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <p className={`text-[14px] font-[380] leading-none ${className}`}>{children}</p>
)

const StatsValue = (props: StatsValueProps) => {
  const { value, className, sign = true } = props
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenPrice = useNativeTokenPrice()
  const nativeSymbol = useNativeTokenNameByChain()

  const dataValueString = useMemo(() => {
    if (dataUnit && dataUnit !== 'USD') {
      const solValue = nativeTokenPrice === 0 ? 0 : Number(value / nativeTokenPrice)
      return `${fShortenNumber(solValue)} ${nativeSymbol.toUpperCase()}`
    }
    const pnlValue = value > 0 ? '+' : value < 0 ? '-' : ''
    return `${sign ? pnlValue : ''}$${fShortenNumber(Math.abs(value))}`
  }, [nativeTokenPrice, dataUnit, value, nativeSymbol])

  return <AmountP className={cn('text-[#21e09d]', className)}>{dataValueString}</AmountP>
}

const TooltipTransaction = React.memo(({ children, transaction, chainId, tokenAddress, open, setOpen }: Props) => {
  const { t } = useTranslation()
  const tooltipRef = useRef<HTMLDivElement>(null)

  // fetch only when the outer tooltip/panel is open
  const { data } = useQuery({
    queryKey: ['wallet-info', transaction?.maker, tokenAddress, chainId],
    queryFn: async () => {
      const { data } = await gqlMeme2.query({
        query: getWalletInfo2,
        variables: {
          input: {
            addresses: transaction?.maker,
            token: tokenAddress,
            chainId: chainId,
          },
        },
        fetchPolicy: 'network-only',
      })
      return data
    },
    enabled: open, // Only fetch when tooltip is open
  })

  const walletStatistics = useMemo<WalletStatisticDto | undefined>(() => {
    if (!data || !data.getWalletInfo) return undefined
    return data.getWalletInfo[0] as WalletStatisticDto
  }, [data])

  const [avgOpen, setAvgOpen] = useState(true)
  const toggleAvg = useCallback(() => setAvgOpen((s) => !s), [])

  const buyUsd = walletStatistics?.totalUsdBuyAmount ?? 0
  const sellUsd = walletStatistics?.totalUsdSellAmount ?? 0
  const buyTxs = walletStatistics?.totalBuyTxs ?? 0
  const sellTxs = walletStatistics?.totalSellTxs ?? 0
  const currentHolding = walletStatistics?.currentHolding ?? 0
  const avgBuyMc = walletStatistics?.avgBuyMarketCap ?? 0
  const avgSellMc = walletStatistics?.avgSellMarketCap ?? 0
  const PnL = walletStatistics?.pnl ?? 0

  const openWallet = () => {
    window.open(`${APP_PATH.MEME_WALLET}/${transaction?.maker}`, '_blank')
  }

  const openTx = () => {
    window.open(`${CHAIN_EXPLORER_TX_URLS[chainId]}/${transaction?.txHash}`, '_blank')
  }

  const onClickFilter = () => {
    eventBus.dispatch(EVENT_MESSAGE_ORDERBOOK_ADDRESS_SELECTED, { data: { address: transaction?.maker } })
  }
  
  return (
    <Tooltip open={open} onOpenChange={(v) => setOpen(v)}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipContent ref={tooltipRef} className="bg-transparent">
        <div className="bg-[#212127] p-2 pb-0 min-w-[284px] rounded-[8px] border border-[#79778c29]">
          {/* header */}
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-1">
              <p className="text-[12px] font-[330] leading-none text-[#908e98]">
                {formatAddressWallet(transaction?.maker, 8, 4)}
              </p>
              <CopyButton icon="/images/icons/ic-copy2.svg" text={transaction?.maker} />
            </div>
            <div className="flex items-center gap-0.5">
              <CurrencyToggle isShowLogo={false} />
              {/* Expand / Collapse avgCell */}
              <button
                aria-label={avgOpen ? 'Collapse averages' : 'Expand averages'}
                onClick={toggleAvg}
                className="ml-2.5 text-[#908e99] hover:text-white cursor-pointer"
              >
                <IconExpand className={`${avgOpen ? '' : 'rotate-180'} transition-transform duration-200`} />
              </button>
            </div>
          </div>

          <div className="grid gap-2 text-center text-white py-2 border-[0.5px] border-b-[#79778c29]">
            <div className="grid grid-cols-3 gap-2">
              <StatCard>
                <div className="flex items-center gap-1">
                  <IconArrowDownCircle className="text-[#21e09d]" />
                  <StatsValue value={buyUsd} sign={false} />
                </div>
                <RowLabel className="text-[#21e09d] mt-1.5">
                  {buyTxs}
                  <span className="ml-1 text-[#908e98]">{t('detail.topInfo.buy')}</span>
                </RowLabel>
              </StatCard>

              <StatCard>
                <div className="flex items-center gap-1">
                  <IconArrowUpCircle className="text-[#EA3B4F]" />
                  <StatsValue value={sellUsd} className={'text-[#EA3B4F]'} sign={false} />
                </div>
                <RowLabel className="text-[#EA3B4F] mt-1.5">
                  {sellTxs}
                  <span className="ml-1 text-[#908e98]">{t('detail.topInfo.sell')}</span>
                </RowLabel>
              </StatCard>

              <StatCard>
                <StatsValue value={PnL} className={PnL >= 0 ? 'text-[#21e09d]' : 'text-[#EA3B4F]'} />
                <RowLabel className="text-[#908e98] mt-1.5">{t('detail.statistics.profitLoss')}</RowLabel>
              </StatCard>
            </div>

            {/* avgCell collapsible section */}
            <AnimatePresence initial={false}>
              {avgOpen && (
                <motion.div
                  id="avgCell"
                  key="avgCell"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                  className="grid grid-cols-2 gap-2"
                >
                  {/* Current holding with inside tooltip */}
                  <StatCard>
                    <div className="flex items-center gap-1">
                      <StatsValue value={avgBuyMc} sign={false} />
                    </div>
                    <RowLabel className="text-[#908e98] mt-1.5">{t('detail.statistics.avgBuyMC')}</RowLabel>
                  </StatCard>

                  {/* Holding duration with inside tooltip */}
                  <StatCard>
                    <div className="flex items-center gap-1">
                      <StatsValue value={avgSellMc} className={'text-[#EA3B4F]'} sign={false} />
                    </div>
                    <RowLabel className="text-[#908e98] mt-1.5">{t('detail.statistics.avgSellMC')}</RowLabel>
                  </StatCard>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2">
              <HoverTip
                position={'top'}
                tip={
                  <div className="space-y-0.5">
                    <p className="text-[12px] leading-[1.5] text-[#908e98]">{`1. ${t('detail.statistics.tokenBalance')}`}</p>
                    <p className="text-[12px] leading-[1.5] text-[#908e98]">{`2. ${t('detail.statistics.holdingRatio')}`}</p>
                    <p className="text-[12px] leading-[1.5] text-[#908e98]">{`3. ${t('detail.statistics.holdingQty')}`}</p>
                  </div>
                }
              >
                <StatCard>
                  <div className="flex items-center gap-1">
                    <IconWallet />
                    <StatsValue value={currentHolding} />
                  </div>
                  <RowLabel className="text-[#908e98] mt-1.5">0% (0)</RowLabel>
                </StatCard>
              </HoverTip>

              {/* Holding duration with inside tooltip */}
              <HoverTip tip={t('detail.statistics.holdingDurationDesc')} position={'top'}>
                <StatCard>
                  <div className="flex items-center gap-1">
                    <IconClockStroke className="text-[#908e98] w-3.5 h-3.5" />
                    <AmountP className="text-[#fbfbfb]">
                      <HoldingDuration holdingDuration={walletStatistics?.holdingDuration} />
                    </AmountP>
                  </div>
                  <RowLabel className="text-[#908e98] mt-1.5">{t('detail.statistics.holdingDuration')}</RowLabel>
                </StatCard>
              </HoverTip>
            </div>
          </div>

          {/* footer icons, each with inside tooltip */}
          <div className="flex items-center px-3 py-2 gap-3">
            <HoverTip tip={t('detail.statistics.openWallet')} align="left" position="top">
              <button className="text-[#a9a9b3] cursor-pointer hover:text-white" onClick={openWallet}>
                <IconChart />
              </button>
            </HoverTip>

            <HoverTip tip={t('detail.statistics.openTx')} align="left" position="top">
              <button className="text-[#a9a9b3] cursor-pointer hover:text-white" onClick={openTx}>
                <IconExport />
              </button>
            </HoverTip>

            <HoverTip tip={t('detail.statistics.filterTx')} align="left" position="top">
              <button className="text-[#a9a9b3] hover:text-white" onClick={onClickFilter}>
                <IconNewFilter />
              </button>
            </HoverTip>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
})

TooltipTransaction.displayName = 'TooltipTransaction'
export default TooltipTransaction
