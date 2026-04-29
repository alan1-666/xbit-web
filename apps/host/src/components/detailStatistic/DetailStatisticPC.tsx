import { formatAmount, formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useGetPortfolioTokenByAddress } from '@/pages/detail/orderForm/desktop/hook/useGetPortfolioTokenByAddress'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import Loader from '@components/common/Loader.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

const DetailStatistic = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)
  if (activeWallet.isConnected === false) {
    return null
  }
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const nativeUnit = useMemo(() => {
    switch (activeChain) {
      case 'sol':
        return 'SOL'
      case 'bsc':
        return 'BNB'
      case 'evm':
      case 'arb':
        return 'ETH'
      default:
        return 'USD'
    }
  }, [activeChain])
  const [unit, setUnit] = useState<string>('USD')
  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])
  const { portfolioData } = useGetPortfolioTokenByAddress(tokenAddress)

  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const price = portfolioData?.token && ohlcPrice > 0 ? ohlcPrice : portfolioData?.price
  if (!portfolioData) {
    return null
  }

  const totalBase = portfolioData?.estimateOrderValue
    ? Number(portfolioData?.totalBaseAmount) + Number(portfolioData?.estimateOrderValue)
    : Number(portfolioData?.totalBaseAmount)
  const balance = portfolioData?.isSellAll ? 0 : totalBase
  const realized = portfolioData?.realizedPnL ? Number(portfolioData?.realizedPnL) : 0
  const unrealized = balance > 0 ? (Number(price) - Number(portfolioData?.avgPriceUsd)) * balance : 0
  const holdingValue = totalBase * Number(price)
  const PnL = !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd ? '--' : Number(realized) + Number(unrealized)
  const totalBuyUsd = portfolioData?.totalBuyUsd
  const totalSellUsd = portfolioData?.totalSellUsd
  const isProcessing = portfolioData?.isProcessing || false

  const ChainIcon = () => <img src={getBlockchainLogo2(portfolioData?.chainId)} alt="" className="w-3 h-3" />

  return (
    <div className="rounded-[4px] border-[0.5px] border-[#ECECED1F] py-2 flex items-center justify-between text-nowrap overflow-x-auto min-h-[52px]">
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
        <div className="font-[330] text-[12px] text-white/50 leading-none">{t('detail.holderTable.totalBuy')}</div>
        <div className={cn('font-[380] text-[12px] text-rise leading-none')}>
          {unit === 'USD' ? (
            !price || price === 0 || isProcessing ? (
              <Loader />
            ) : (
              formatBalance(totalBuyUsd, { showCurrency: true, roundMode: 'floor' })
            )
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {!price || price === 0 || isProcessing ? (
                <Loader />
              ) : (
                formatAmount(totalBuyUsd / (priceNativeToken || 1), { roundMode: 'floor' })
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
        <div className="font-[330] text-[12px] text-white/50 leading-none">{t('detail.holderTable.totalSell')}</div>
        <div className={cn('font-[380] text-[12px] text-false leading-none text-fall')}>
          {unit === 'USD' ? (
            !price || price === 0 || isProcessing ? (
              <Loader />
            ) : (
              formatBalance(totalSellUsd, { showCurrency: true, roundMode: 'floor' })
            )
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {!price || price === 0 || isProcessing ? (
                <Loader />
              ) : (
                formatAmount(totalSellUsd / (priceNativeToken || 1), { roundMode: 'floor' })
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
        <div className="font-[330] text-[12px] text-white/50 leading-none">{t('detail.statistics.holdingValue')}</div>
        <div className={cn('font-[380] text-[12px] text-white leading-none', '')}>
          {unit === 'USD' ? (
            !price || price === 0 || isProcessing ? (
              <Loader />
            ) : (
              formatBalance(holdingValue, { showCurrency: true, roundMode: 'floor' })
            )
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {!price || price === 0 || isProcessing ? (
                <Loader />
              ) : (
                formatAmount(holdingValue / (priceNativeToken || 1), { roundMode: 'floor' })
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
        <div className="font-[330] text-[12px] text-white/50 leading-none flex items-center gap-1">
          {t('detail.myPositions.profitAndLoss')}{' '}
          <span
            className="cursor-pointer"
            onClick={() => {
              setUnit((prev) => (prev === 'USD' ? nativeUnit : 'USD'))
            }}
          >
            <IconFund className="size-[14px]" />
          </span>
        </div>
        <div className={cn('font-[380] text-[12px] text-white leading-none', '')}>
          <div
            className={cn(
              'font-[380] text-[14px]',
              Number(realized) + Number(unrealized) === 0 || isProcessing
                ? 'text-[#FFFFFFB2]'
                : Number(realized) + Number(unrealized) > 0
                  ? 'text-rise'
                  : 'text-fall',
            )}
          >
            {unit === 'USD' ? (
              !price || price === 0 || isProcessing ? (
                <Loader />
              ) : (
                formatBalance(PnL, { showCurrency: true, roundMode: 'floor' })
              )
            ) : (
              <div className="flex items-center gap-1">
                <ChainIcon />
                {!price || price === 0 || isProcessing ? (
                  <Loader />
                ) : (
                  formatAmount(typeof PnL === 'number' ? PnL / (priceNativeToken || 1) : null, { roundMode: 'floor' })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailStatistic
