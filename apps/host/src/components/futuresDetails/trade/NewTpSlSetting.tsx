import { MathFun, cn, hasPercent, removePercent } from '@/lib/utils.ts'
import { RootState, useAppSelector } from '@/redux/store.ts'
import { UITab } from '@/types/uiTabs.ts'
import { OrderSide, OrderTypeEnum, TpslTypeEmum } from '@components/futuresDetails/trade/type.order.ts'
import { useEffect, useState, useRef, memo, useMemo } from 'react'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import InputRightBorderGradient from './InputRightBorderGradient.tsx'
import { OrderContractState } from './type.order.ts'
import { useAppDispatch } from '@/redux/store.ts'
import { setOrderInfo } from '@/redux/modules/orderContract.slice.ts'
import { useTranslation } from 'react-i18next'
import { ArrowDownIcon1 } from '@/components/icon/ArrowDownIcon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { fundingSelector } from '@/redux/modules/futuresUserInfo.slice'



const TpSlSetting = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    orderInfo: { tpType, slType, tpValue, slValue, type, size, currency, price: limitPrice },
  } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { handleOrderInfoChange } = useHandleChangeValue()

  const { baseCoin, price: marketPrice } = useAppSelector(symbolInfoSelector)


  const [tpIsFocus, setTpIsFocus] = useState<boolean>(false)
  const [slIsFocus, setSlIsFocus] = useState<boolean>(false)

  const entryPrice = type === OrderTypeEnum.market ? Number(marketPrice) : Number(limitPrice)
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const leverage = Number(tradeConfigs.leverage)
  const { available: availableToTrade } = useAppSelector(fundingSelector)


  const tpPricePercentInputRef = useRef(null)
  const slPricePercentInputRef = useRef(null)

  const tpslTypeList: UITab[] = [
    {
      value: TpslTypeEmum.ROI,
      label: `${t('futuresDetails.common.ROI')} (%)`,
    },
    {
      value: TpslTypeEmum.Price,
      label: `${t('futuresDetails.common.price')} (USDC)`,
    },
  ]
  const [inputDisabled, setInputDisabled] = useState<boolean>(false)



  const tpInputLabel = tpType === TpslTypeEmum.ROI ? t('futuresDetails.common.tp') : `${t('futuresDetails.common.trigger')}${t('futuresDetails.common.tp')}`
  const slInputLabel = slType === TpslTypeEmum.ROI ? t('futuresDetails.common.sl') : `${t('futuresDetails.common.trigger')}${t('futuresDetails.common.sl')}`



  const handleChanglePricePercent = (name: 'tpValue' | 'slValue', value: string) => {
    handleOrderInfoChange(name, value)
  }

  const getNotionalSize = (
    side: OrderSide,
    size: string,
    leverage: number,
    currency: string
  ) => {
    if (!size) return 0
    if (typeof size === 'string' && hasPercent(size)) {
        const availableMargin = side === OrderSide.buy ? (availableToTrade?.[0] || 0) : (availableToTrade?.[1] || 0)
      if (typeof size === 'string' && hasPercent(size)) {
        return MathFun.mul(
          MathFun.mul(availableMargin, Number(removePercent(size)) / 100),
          leverage
        )
      }
    } else {
      return currency === 'USDC' ? size : Number(size) * Number(marketPrice)
    }
  

  }



  const getExpectedProfitDisplay = (
    side: OrderSide,
    value: string,
    tpslType: TpslTypeEmum,
    tpOrsl: 'tp' | 'sl'
  ) => {
    let triggerPrice = 0
    if (tpslType === TpslTypeEmum.Price) {
      triggerPrice = Number(value)
    } else {
      const roi = Number(value) / 100
      const priceChange = roi / leverage

      triggerPrice =
        side === OrderSide.buy
          ? entryPrice * (1 + priceChange)
          : entryPrice * (1 - priceChange)
    }
    if (!triggerPrice || !entryPrice) return '--'

    const notionalSize = getNotionalSize(
      side,
      size as string,
      leverage,
      currency
    )


    if (!notionalSize) return '--'

    const isProfit =
      side === OrderSide.buy ? triggerPrice > entryPrice : triggerPrice < entryPrice

    const text = '$'
    const mathSymbol =
      !isProfit && tpslType === TpslTypeEmum.Price ? '-' : '+'

    const priceDiff = Math.abs(triggerPrice - entryPrice)

    if (tpOrsl == 'tp' && mathSymbol === '-') return '--'
    if (tpOrsl == 'sl' && mathSymbol === '+') return '--'



    // USDC 盈亏
    let pnl = 0
    let roiText = ''
    if (tpslType === TpslTypeEmum.Price) {
      // ROI（本来就只和杠杆、价格有关）
      const percentage = MathFun.mul(
        MathFun.div(priceDiff, entryPrice),
        leverage * 100
      )
      roiText = ` (${mathSymbol}${percentage.toFixed(2)}%)`
    }

    pnl = MathFun.mul(
      MathFun.div(priceDiff, entryPrice),
      notionalSize
    )
    return <span className={cn(mathSymbol == '+' ? "text-[#00CE89]" : "text-[#EA3B4F]")}>{`${mathSymbol}${text}${pnl.toFixed(2)}${roiText}`}</span>




  }
  const expectedProfitDisplay = useMemo(() => {
    return {
      long: getExpectedProfitDisplay(OrderSide.buy, tpValue, tpType, 'tp'),
      short: getExpectedProfitDisplay(OrderSide.sell, tpValue, tpType, 'tp'),
    }
  }, [tpValue, tpType, size, currency, leverage, entryPrice])


  const expectedLossDisplay = useMemo(() => {
    return {
      long: getExpectedProfitDisplay(OrderSide.buy, slValue, slType, 'sl'),
      short: getExpectedProfitDisplay(OrderSide.sell, slValue, slType, 'sl'),
    }
  }, [slValue, slType, size, currency, leverage, entryPrice])


  return (
    <div className="mb-2.5">
      <div className="flex items-center mb-1 relative">
        <div className={cn('absolute bg-[#1F1E25] border border-[#302E38] p-1 rounded-[4px] top-[-40px]  right-0  text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))]',
          tpIsFocus ? 'block' : 'hidden'
        )}>
          <p className='mb-1 text-[#908E98]'>{t("futuresDetails.common.long")}{t("futuresDetails.common.estimatedPnl")} {expectedProfitDisplay.long}</p>
          <p className='text-[#908E98]'>{t("futuresDetails.common.short")}{t("futuresDetails.common.estimatedPnl")} {expectedProfitDisplay.short}</p>
        </div>
        <InputRightBorderGradient
          unit={<UnitSelector unit={tpType} tpslTypeList={tpslTypeList} onChange={(type) => {
            dispatch(
              setOrderInfo({
                ...orderInfo,
                tpType: type,
                tpValue: ''
              }),
            )
          }} />}
          inputProps={{
            disabled: inputDisabled
          }}
          onChange={(e) => handleChanglePricePercent('tpValue', e)}
          value={tpValue}
          label={tpInputLabel}
          onFocus={() => setTpIsFocus(true)}
          onBlur={() => setTpIsFocus(false)}
          containerClassName="w-full"
          inputClassName="flex-1"
          inputWrapperClassName="flex items-center justify-between"
          floatingLabel={true}
          onlyPositiveInteger={true}
          ref={tpPricePercentInputRef}
        />
      </div>

      <div className="flex items-center relative">
        <div className={cn('absolute bg-[#1F1E25] border border-[#302E38] p-1 rounded-[4px] top-[-40px] right-0  text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))]',
          slIsFocus ? 'block' : 'hidden'
        )}>
          <p className='mb-1 text-[#908E98]'>{t("futuresDetails.common.long")}{t("futuresDetails.common.estimatedPnl")} {expectedLossDisplay.long}</p>
          <p className='text-[#908E98]'>{t("futuresDetails.common.short")}{t("futuresDetails.common.estimatedPnl")} {expectedLossDisplay.short}</p>
        </div>
        <InputRightBorderGradient
          unit={<UnitSelector unit={slType} tpslTypeList={tpslTypeList} onChange={(type) => {
            handleChanglePricePercent('slValue', '')
            dispatch(
              setOrderInfo({
                ...orderInfo,
                slType: type,
                slValue: ''
              }),
            )
          }} />}
          inputProps={{
            disabled: inputDisabled
          }}
          onChange={(e) => handleChanglePricePercent('slValue', e)}
          value={slValue}
          label={slInputLabel}
          onFocus={() => setSlIsFocus(true)}
          onBlur={() => setSlIsFocus(false)}
          containerClassName="w-full"
          inputClassName="flex-1"
          inputWrapperClassName="flex items-center justify-between"
          floatingLabel={true}
          onlyPositiveInteger={true}
          ref={slPricePercentInputRef}
        />
      </div>
    </div>
  )
}

type UnitSelectorProps = {
  unit: string
  tpslTypeList: UITab[]
  onChange: (unit: TpslTypeEmum) => void
}

const UnitSelector = memo<UnitSelectorProps>(({ unit, tpslTypeList, onChange }) => {

  const unitLabel = tpslTypeList.find((item: any) => item.value === unit)?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative z-0 flex-1 flex items-center justify-between pl-2',
            'text-xs text-[#FFFFFFB2] cursor-pointer',
            'transition-colors'
          )}
        >
          <span>{unitLabel}</span>
          <ArrowDownIcon1 fill="#6C6A74" size={16} className="ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn('min-w-[55px] bg-[#1F1E25]  text-[#FFFFFFB2]')}
      >
        {tpslTypeList.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              'flex items-center justify-center py-2 text-[calc(1rem*(12/16))] cursor-pointer',
              unit === option.value && 'text-[#FFFFFF] bg-[#ECECED1A]'
            )}
            onClick={() => onChange(option.value as TpslTypeEmum)}
          >
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})


export default TpSlSetting
