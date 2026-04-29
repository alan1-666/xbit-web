import { convertChainNameToNativeToken, TYPE_CHAIN } from '@/lib/blockchain.ts'
import { cn, showRate } from '@/lib/utils.ts'
import { useMemo, useState } from 'react'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { formatBalanceWallet, fShortenNumber } from '@/lib/number.ts'
import { NullableDataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import { useTranslation } from 'react-i18next'
import { usePreference } from '@hooks/usePreference.ts'
import clsx from 'clsx'
import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

export interface BalanceViewProps {
  hideBalance: boolean
  toggleHideBalance: (hide: boolean) => void
  currentAmount: NullableDataItem
  firstItem: NullableDataItem
  timeRange: string
  arrow?: boolean
  arrowClassName?: string
  onArrowClick?: () => void
}

export const BalanceView = (props: BalanceViewProps) => {
  const {
    hideBalance,
    toggleHideBalance,
    currentAmount,
    firstItem,
    timeRange,
    arrowClassName,
    arrow = false,
    onArrowClick,
  } = props
  const { preference, updatePreference } = usePreference()
  const { currency } = preference
  const activeWallet = useSelector(_activeWallet)
  const chain = activeWallet?.chainType || TYPE_CHAIN.SOLANA
  const priceNativeToken = useAppSelector(priceChain(chain))
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)
  const iconWalletWeb3 = activeWallet?.avatar

  const walletBalance = useMemo(() => {
    const balance = currentAmount ? currentAmount.balance : +(activeWallet?.balance?.formatted || 0)
    if (currency === 'usd') {
      if (chain === TYPE_CHAIN.SOLANA) return formatBalanceWallet({ balance: balance * priceNativeToken, decimal: 2 })
      if (chain === TYPE_CHAIN.ETH || chain === TYPE_CHAIN.ARB)
        return formatBalanceWallet({ balance: balance * priceNativeToken, decimal: 2 })
      return '0'
    } else {
      return formatBalanceWallet({ balance })
    }
  }, [currency, currentAmount?.balance, activeWallet?.balance?.formatted, priceNativeToken, priceNativeToken, chain])

  const changePercentage = useMemo(() => {
    if (currentAmount) return currentAmount.changePercentage
    const balance = +(activeWallet?.balance?.formatted || 0)
    const firstPrice = Number(firstItem?.balance ?? 0)
    return ((balance - Number(firstPrice)) * 100) / Number(firstPrice)
  }, [currentAmount, firstItem])

  const changeAmountInNativeToken = useMemo(() => {
    if (currentAmount) return currentAmount.changeAmount
    const balance = +(activeWallet?.balance?.formatted || 0)
    const firstPrice = Number(firstItem?.balance ?? 0)
    return balance - Number(firstPrice)
  }, [currentAmount, firstItem])

  const changeAmount = useMemo(() => {
    if (currency === 'usd') {
      let amount = 0
      if (chain === 'sol') {
        amount = changeAmountInNativeToken * +priceNativeToken
      } else if (chain === 'eth' || chain === 'arb') {
        amount = changeAmountInNativeToken * +priceNativeToken
      }
      if (Math.abs(amount) < 0.01) return '≈$0'
      const isNegative = changeAmountInNativeToken < 0
      return (isNegative ? '-' : '+') + '$' + fShortenNumber(amount, 2).replace('-', '')
    } else {
      if (Math.abs(changeAmountInNativeToken) < 0.01)
        return '≈0' + ' ' + convertChainNameToNativeToken(chain.toUpperCase()).toUpperCase()
      return (
        changeAmountInNativeToken.toFixed(2).replace(/0+$/g, '').replace(/\.$/, '') +
        ' ' +
        convertChainNameToNativeToken(chain.toUpperCase()).toUpperCase()
      )
    }
  }, [changeAmountInNativeToken, currency, chain])

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case '1day':
        return t('chart.period.day')
      case '1week':
        return t('chart.period.week')
      case '1month':
        return t('chart.period.month')
      case '1year':
        return t('chart.period.year')
      default:
        return t('chart.period.day')
    }
  }, [timeRange])

  const handleChangePriceType = () => {
    updatePreference({
      currency: currency === 'usd' ? 'native' : 'usd',
    })
  }

  return (
    <div className="flex-1 mr-3">
      <div className="flex items-center mb-3">
        <div
          className="mr-[calc(1rem*(6/16))] flex items-center font-[380] text-[15px] leading-none text-white/70 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <p>{t('wallet.balance', { chain: chain.toUpperCase() })}</p>
          <div className={clsx(open && 'rotate-180')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.8185 6.00098H7.85197H5.18067C4.72355 6.00098 4.49499 6.7093 4.81878 7.12452L7.28533 10.2875C7.68055 10.7943 8.32338 10.7943 8.7186 10.2875L9.65665 9.08461L11.1852 7.12452C11.5042 6.7093 11.2756 6.00098 10.8185 6.00098Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        <NewSwitchWalletBottomSheet open={open} setOpen={setOpen} />
        <button onClick={() => toggleHideBalance(!hideBalance)}>
          <img
            src={hideBalance ? '/images/icons/icon-eye-slash.svg' : '/images/icons/eye-open-icon.svg'}
            className="w-4"
            alt=""
          />
        </button>
      </div>

      <div className="flex items-center mb-2">
        <span className="text-[calc(1rem*(24/16))] leading-[calc(1rem*(24/16))] mr-1 font-bold">≈</span>
        <span className="text-[calc(1rem*(32/16))] leading-[calc(1rem*(32/16))] mr-2 font-bold">
          {hideBalance ? '*****' : walletBalance}
        </span>
        <span
          className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] flex items-center cursor-pointer"
          onClick={handleChangePriceType}
        >
          <img className="mr-0.5" src="/images/icons/fund-icon.svg" alt="" />
          {currency === 'native' ? convertChainNameToNativeToken(chain.toUpperCase()).toUpperCase() : 'USD'}
        </span>
      </div>

      <div className="flex items-center text-(--text-tertiary) h-4">
        <div className="text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mr-2">
          {hideBalance ? '*****' : changeAmount}
        </div>
        {!hideBalance && (
          <>
            <div
              className={cn(
                'mr-2 py-0.5 px-1 text-[#1D1D20] rounded-[3px] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]',
                changePercentage <= -0.01 ? 'bg-(--fall)' : 'bg-(--rise)',
              )}
            >
              {showRate(changePercentage)}
            </div>
          </>
        )}
        <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]">{timeRangeLabel}</div>
        {arrow && (
          <div
            className={cn(
              'inline-block rounded-[200px] px-1.5 cursor-pointer transition-transform duration-300',
              arrowClassName,
            )}
            onClick={() => onArrowClick?.()}
          >
            <img src="/images/icons/arrow-down-icon.svg" alt="Arrow Icon" />
          </div>
        )}
      </div>
    </div>
  )
}
