import { SimpleTooltip } from '@/components/v2/ui-shared/components/SimpleTooltip'
import { DevMigratedTooltip } from '../DevMigratedTooltip'
import { IconCrown } from '@components/v2/ui-shared/icons/IconCrown.tsx'
import { cn } from '@/lib/utils'
import { fShortenNumber } from '@/lib/number'
import { useTranslation } from 'react-i18next'
import { IconWithValue } from '@pages/meme/discover/desktop/components/IconWithValue.tsx'
import { IconBot } from '@components/icon/stroke/IconBot.tsx'
import { NumberOfTransactionPill } from '@components/discover/NumberOfTransactionPill.tsx'
import { useAppSelector } from '@/redux/store'
import { selectFromMemeToken } from '@/redux/modules/memeTokenInfo.slice.ts'
import { useMemo } from 'react'

export interface TxRowProps {
  devMigrated: number
  devLaunched: number
  numberOfHolder: number
  smartMoneyHolder: number
  botHolder: number
  buy: number
  sell: number
  timeframe: string
  chainId: number
  tokenAddress: string
}

interface DevMigratedProps {
  devMigrated: number
  devLaunched: number
  chainId: number
  tokenAddress: string
}

const DevMigrated = (props: DevMigratedProps) => {
  const { devMigrated: initValue, devLaunched, chainId, tokenAddress } = props
  const realtimeDevMigrated = useAppSelector(selectFromMemeToken(chainId, tokenAddress, 'dt'))
  const devMigrated = useMemo(() => {
    if (!realtimeDevMigrated) return initValue
    return +realtimeDevMigrated || 0
  }, [initValue, realtimeDevMigrated])
  return (
    <SimpleTooltip content={<DevMigratedTooltip devMigratedCount={devMigrated} devLaunched={devLaunched || 1} />}>
      <div className="flex items-center gap-1 border-r border-[#ECECED2E] pr-2">
        <IconCrown className={cn(devMigrated >= 2 ? 'text-[#FACC14]' : 'text-[#79778C]')} />
        <span className={cn('text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB]')}>
          {fShortenNumber(devMigrated ?? 0)}
        </span>
      </div>
    </SimpleTooltip>
  )
}

interface HolderProps {
  numberOfHolder: number
  chainId: number
  tokenAddress: string
}

const Holder = (props: HolderProps) => {
  const { numberOfHolder, tokenAddress, chainId } = props
  const { t } = useTranslation()
  const realtimeHC = useAppSelector(selectFromMemeToken(chainId, tokenAddress, 'hc'))
  const holders = useMemo(() => {
    if (!realtimeHC) return numberOfHolder
    return +realtimeHC || 0
  }, [numberOfHolder, realtimeHC])
  return (
    <SimpleTooltip content={t('listCoin.tooltip.holders')}>
      <div className="flex items-center gap-1">
        <img src="/images/discover/ic-holder.svg" className="size-3.5" alt="" />
        <span className="text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB] align-middle">
          {fShortenNumber(holders)}
        </span>
      </div>
    </SimpleTooltip>
  )
}

interface NumberOfTxsProps {
  chainId: number
  tokenAddress: string
  buy: number
  sell: number
  timeframe: string
}

const NumberOfTxs = (props: NumberOfTxsProps) => {
  const { buy, sell, timeframe, chainId, tokenAddress } = props
  const { t } = useTranslation()

  const { buyKey, sellKey } = useMemo(() => {
    return {
      buyKey: `txb${timeframe}` as 'txb1m' | 'txb5m' | 'txb1h' | 'txb6h' | 'txb24h',
      sellKey: `txs${timeframe}` as 'txs1m' | 'txs5m' | 'txs1h' | 'txs6h' | 'txs24h',
    }
  }, [timeframe])
  const realtimeBuyTxs = useAppSelector(selectFromMemeToken(chainId, tokenAddress, buyKey))
  const realtimeSellTxs = useAppSelector(selectFromMemeToken(chainId, tokenAddress, sellKey))

  const buyCount = useMemo(() => {
    if (realtimeBuyTxs === undefined || realtimeBuyTxs === null) return buy
    return +realtimeBuyTxs
  }, [buy, realtimeBuyTxs])

  const sellCount = useMemo(() => {
    if (realtimeSellTxs === undefined || realtimeSellTxs === null) return sell
    return +realtimeSellTxs
  }, [sell, realtimeSellTxs])

  const totalTx = buyCount + sellCount

  return (
    <SimpleTooltip
      content={
        <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)] text-[#FFFFFF99] w-40 py-1 space-y-2.5">
          <div className="flex items-center gap-2 justify-between">
            <span>
              {timeframe} {t('listCoin.toasts.totalTransactions')}
            </span>
            <span className="text-[#FFFFFF]">{totalTx}</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>
              {timeframe}
              {t('listCoin.toasts.buyCount')}
            </span>
            <span className="text-[#00FFB4]">{buyCount}</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>
              {timeframe}
              {t('listCoin.toasts.sellCount')}
            </span>
            <span className="text-[#F25461]">{sellCount}</span>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-1 cursor-pointer">
        <span className="text-[calc(12rem/16)] text-[#FFFFFF80]">TX</span>{' '}
        <div className="text-[calc(14rem/16)] leading-3.5">{totalTx}</div>
        <NumberOfTransactionPill buy={buyCount} sell={sellCount} progressClassName="rounded-0" />
      </div>
    </SimpleTooltip>
  )
}

export const TxRow = (props: TxRowProps) => {
  const {
    devMigrated,
    devLaunched,
    numberOfHolder,
    smartMoneyHolder,
    botHolder,
    timeframe,
    sell,
    buy,
    chainId,
    tokenAddress,
  } = props
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2">
      <DevMigrated chainId={chainId} tokenAddress={tokenAddress} devLaunched={devLaunched} devMigrated={devMigrated} />
      <Holder chainId={chainId} tokenAddress={tokenAddress} numberOfHolder={numberOfHolder} />
      <SimpleTooltip content={t('listCoin.tooltip.smartMoneyPC')}>
        <div className="flex items-center gap-1">
          <img src="/images/discover/ic-sm2.svg" className="size-3.5" alt="" />
          <span className="text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB]">
            {fShortenNumber(smartMoneyHolder || 0)}
          </span>
        </div>
      </SimpleTooltip>
      <SimpleTooltip content={t('listCoin.tooltip.botTx')}>
        <IconWithValue
          icon={<IconBot className="text-[#878787] size-3.5" />}
          value={fShortenNumber(botHolder || 0)}
          className="text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB]"
        />
      </SimpleTooltip>
      <NumberOfTxs chainId={chainId} tokenAddress={tokenAddress} buy={buy} sell={sell} timeframe={timeframe} />
    </div>
  )
}
