import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import FilterSelect, { FilterSelectOption } from '../common/FilterSelect'
import { TokenDetail } from '@/@generated/gql/graphql-core'
import { FormValues } from '.'
import { useFormContext } from 'react-hook-form'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { ChangeEvent, useCallback, useEffect } from 'react'
import { formatNumberLimitPrice } from '@/lib/number'
import { RootState, useAppSelector } from '@/redux/store'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { LIMIT_DECIMAL_PRICE } from '@/pages/detail/orderForm/useOrderForm'

type InputBorderGradientProps = {
  placeHolder?: string
  containerClassName?: string
  onFocus?: () => void
  onBlur?: () => void
  plusCallback?: () => void
  minusCallback?: () => void
  tokenDetail: TokenDetail
  inputType?: string
  setInputType?: any
  side?: TransactionType
}

const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] as const

const LimitPrice = ({
  placeHolder,
  containerClassName,
  onFocus,
  onBlur,
  tokenDetail,
  inputType,
  setInputType,
  side = TransactionType.Buy,
}: InputBorderGradientProps) => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const totalSupply = Number(tokenDetail?.circulatingSupply ?? tokenDetail?.totalSupply)
  const lastPrice = ohlcPrice && ohlcPrice !== 0 ? ohlcPrice : tokenDetail?.price
  const marketCap = lastPrice ? totalSupply * Number(lastPrice) : tokenDetail?.marketCap

  const {
    setValue,
    register,
    // formState: { errors },
    watch,
  } = useFormContext<FormValues>()

  const limitPrice = watch('limitPrice')
  const limitMarketCap = watch('limitMarketCap')
  const isLimitPrice = inputType === 'price'

  const inputOptions: FilterSelectOption[] = [
    {
      value: 'price',
      label: t('orderForm.form.price'),
    },
    {
      value: 'marketCap',
      label: t('orderBook.marketCap'),
    },
  ]

  useEffect(() => {
    if (tokenDetail) {
      if (inputType === 'price') {
        setValue('limitMarketCap', '')
        setValue('limitPrice', formatNumberLimitPrice(lastPrice, LIMIT_DECIMAL_PRICE))
      }
      if (inputType === 'marketCap') {
        setValue('limitPrice', '')
        setValue('limitMarketCap', formatNumberLimitPrice(marketCap, LIMIT_DECIMAL_PRICE))
      }
    }
  }, [tokenDetail, inputType])

  // Input validation handler
  const handleOnInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>, decimal: number) => {
    const char = e.key

    // Special case for reload shortcut
    if ((e.ctrlKey || e.metaKey) && char === 'r') {
      console.log('Ctrl+R or Cmd+R pressed!')
      return true
    }

    // Allow control keys
    if (CONTROL_KEYS.includes(char as (typeof CONTROL_KEYS)[number])) {
      return true
    }

    const input = e.currentTarget.value
    const [_, decimalPart] = input.split('.')

    // Prevent more than max decimal places
    if (decimalPart && decimalPart.length >= decimal) {
      e.preventDefault()
      return false
    }

    // Allow numeric input
    if (char >= '0' && char <= '9') {
      return true
    }

    // Allow first decimal point
    if (char === '.') {
      return input.indexOf('.') === -1
    }

    // Prevent other characters
    e.preventDefault()
    return false
  }, [])

  // quote amount change handler
  const onChangeQuoteAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue(isLimitPrice ? 'limitPrice' : 'limitMarketCap', value)
  }

  const label =
    (side === TransactionType.Buy ? t('transaction.buy') : t('transaction.sell')) +
    ' ' +
    (isLimitPrice ? t('orderBook.price') : t('orderBook.marketCap')) +
    ' (USDT)'
  return (
    <div className="relative">
      <InputBorderGradient
        unit=""
        placeHolder={t('orderForm.form.limitPrice')}
        inputClassName="flex-1 pr-4"
        containerClassName="mb-2 w-full p-0"
        innerBgClassName="bg-[#141414]"
        containerInputClassName="bg-[#201e25] h-[48px] px-3 pt-2 pb-1"
        unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
        isFocusShowTooltip={true}
        textTooltip={label}
        hasValue={isLimitPrice ? !!limitPrice : !!limitMarketCap}
        inputProps={{
          ...register(isLimitPrice ? 'limitPrice' : 'limitMarketCap', {
            onChange: onChangeQuoteAmount,
          }),
          onKeyDown: (e) => handleOnInput(e, LIMIT_DECIMAL_PRICE),
        }}
      />
      <div className="absolute top-[50%] translate-y-[-50%] right-3">
        <FilterSelect
          triggerIconClassname="w-4 h-4"
          triggerIcon="/images/icons/ic-down-new.svg"
          options={inputOptions}
          defaultValue={inputOptions[0].value}
          selectTriggerProps={{
            className: '!w-[48px] flex border-none bg-[none] !p-0 text-[12px] text-white',
          }}
          onValueChange={(value) => setInputType(value)}
        />
      </div>
    </div>
  )
}

export default LimitPrice
