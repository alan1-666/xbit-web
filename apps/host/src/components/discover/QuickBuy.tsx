import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TradeSettingsBottomSheet from '@components/common/TradeSettingsBottomSheet.tsx'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setQuickBuyAmount } from '@/redux/modules/quickBuy.slice'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { toast } from 'sonner'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { cn } from '@/lib/utils.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'

// const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] as const

export interface QuickBuyProps {
  presetSelectType?: 'dropdown' | 'list'
  className?: string
  icon?: ReactNode
  renderRight?: ReactNode
  showUnitIcon?: boolean
  inputWrapperClassName?: string
  presetListClassName?: string
}

const UnitIcon = () => {
  const activeChainId = useActiveChainId()
  if (activeChainId === ChainIds.Ethereum) {
    return <img src="/images/icons/chains/ic-ethereum.svg" alt="ETH" className="w-3 h-3" />
  }
  if (activeChainId === ChainIds.Bsc) {
    return <img src="/images/icons/chains/ic-bnb.svg" alt="BSC" className="w-3 h-3" />
  }
  if (activeChainId === ChainIds.Mon) {
    return <img src="/images/icons/chains/ic-monad.svg" alt="MON" className="w-3 h-3" />
  }
  return <img src="/images/icons/chains/ic-solana.svg" alt="SOL" className="w-3 h-3" />
}

const QuickBuy = (props: QuickBuyProps) => {
  const {
    presetSelectType,
    className,
    icon,
    showUnitIcon = false,
    inputWrapperClassName,
    presetListClassName,
    renderRight,
  } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const amount = useSelector((state: RootState) => state.quickBuy.amount)
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const [_, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const activeWallet = useActiveWallet()

  // Configuration limits for input validation
  const MAX_INTEGER_DIGITS = 15 // Safe limit (Number.MAX_SAFE_INTEGER has 16 digits)
  const MAX_DECIMALS = 8 // Maximum decimal places
  const MAX_SAFE_VALUE = 999999999999999 // ~1 Quadrillion

  /**
   * Opens trade settings bottom sheet
   * Requires wallet to be connected
   */
  const handleOpenTradeSettings = useCallback(
    (open: boolean) => {
      if (!activeWallet.isConnected) {
        toast.warning(t('appSettings.loginRequired'))
        return
      }
      setOpenTradeSettings(open)
    },
    [activeWallet.isConnected, t],
  )

  /**
   * Validates and formats input value
   * - Removes invalid characters
   * - Limits integer and decimal digits
   * - Prevents overflow and precision loss
   * @param value - Raw input string
   * @returns Validated and formatted string
   */
  const validateAndFormatInput = (value: string): string => {
    // Remove all characters except numbers, dots, and commas
    let newValue = value.replace(/[^0-9.,]/g, '')

    // Convert commas to dots for decimal separator
    newValue = newValue.replace(/,/g, '.')

    // Allow only one decimal point
    const parts = newValue.split('.')
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('')
    }

    // Limit integer digits
    if (parts[0] && parts[0].length > MAX_INTEGER_DIGITS) {
      toast.warning(t('Maximum digits exceeded'))
      return amount // Keep previous value
    }

    // Limit decimal places
    if (parts[1] && parts[1].length > MAX_DECIMALS) {
      newValue = parts[0] + '.' + parts[1].slice(0, MAX_DECIMALS)
    }

    // Check maximum value to prevent Infinity or precision loss
    const numValue = parseFloat(newValue)
    if (!isNaN(numValue)) {
      if (!isFinite(numValue)) {
        toast.warning(t('Value too large'))
        return amount
      }

      if (numValue > MAX_SAFE_VALUE) {
        toast.warning(t('Value exceeds safe limit'))
        return amount
      }
    }

    // Prevent multiple leading zeros (except 0.xxx format)
    if (newValue.length > 1 && newValue[0] === '0' && newValue[1] !== '.') {
      newValue = newValue.replace(/^0+/, '0')
    }

    return newValue
  }

  /**
   * Handle click outside to remove focus state
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'flex items-center justify-center gap-1 p-2 rounded-full border-[#343339] border-[0.5px]',
        className,
      )}
    >
      <div className={cn('flex items-center gap-1', inputWrapperClassName)}>
        <div className="flex items-center justify-center mr-3">
          {icon ? icon : <img src="/images/icons/quick-buy.svg" alt="quick buy" className="h-4" />}
          <input
            id="quick-buy-input"
            inputMode="decimal"
            className="max-w-14 pl-2 font-[300] text-[11px] leading-none text-white text-left"
            placeholder={t('orderForm.buySettings.buyAmount')}
            value={amount}
            onChange={(e) => {
              const validatedValue = validateAndFormatInput(e.target.value)
              dispatch(setQuickBuyAmount(validatedValue))
            }}
            onFocus={() => setFocused(true)}
            onPaste={(e) => {
              // Prevent default paste behavior and validate pasted content
              e.preventDefault()
              const pastedText = e.clipboardData.getData('text')
              const validatedValue = validateAndFormatInput(pastedText)
              dispatch(setQuickBuyAmount(validatedValue))
            }}
          />
        </div>
        {showUnitIcon && <UnitIcon />}
      </div>
      {renderRight ? (
        renderRight
      ) : (
        <div className={cn('flex items-center', presetListClassName)}>
          <TradeSettingsBottomSheet
            open={openTradeSettings}
            setOpen={handleOpenTradeSettings}
            transactionType={TransactionType.Buy}
            selectType={presetSelectType}
          />
        </div>
      )}
    </div>
  )
}

export default QuickBuy
