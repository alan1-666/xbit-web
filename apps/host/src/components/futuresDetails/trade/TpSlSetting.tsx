import { formatPrice } from '@/components/futuresDetails/trade/tools'
import { MathFun, cn } from '@/lib/utils.ts'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'
import { selectSzMap } from '@/redux/modules/futuresMeta.slice'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { RootState, useAppSelector } from '@/redux/store.ts'
import { UITab } from '@/types/uiTabs.ts'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { OrderSide, OrderTypeEnum } from '@components/futuresDetails/trade/type.order.ts'
import { useEffect, useState, useRef, memo } from 'react'
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
// Hash order price

const TpSlSetting = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    orderInfo: { tpPrice, slPrice, size, side, currency, price: limitPrice, type },
  } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { handleOrderInfoChange } = useHandleChangeValue()
  const { baseCoin, price: marketPrice } = useAppSelector(symbolInfoSelector)

  const szMap = useAppSelector(selectSzMap)

  const entryPrice = type === OrderTypeEnum.market ? Number(marketPrice) : Number(limitPrice)


  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const leverage = Number(tradeConfigs.leverage)

  const tpPricePercentInputRef = useRef(null)
  const slPricePercentInputRef = useRef(null)

  const unitList: UITab[] = [
    {
      value: '%',
      label: '%',
      // desc: '根据预估投资回报率设置止盈止损触发价',
    },
    {
      value: '$',
      label: '$',
      // desc: '根据预估盈亏设置止盈止损触发价',
    },
  ]
  const [inputDisabled, setInputDisabled] = useState<boolean>(false)

  const [unit, setUnit] = useState<string>(unitList[0].value)
  const [pricePercent, setPricePercent] = useState({
    slPricePercent: '',
    tpPricePercent: '',
  })

  const handleUnitChange = (unit: string) => {
    // e.preventDefault()
    setUnit(unit)
    handleOrderInfoChange('tpslUnit', unit)
    // e.preventDefault()
  }

  const handleChangeTsSl = (name: 'slPrice' | 'tpPrice', value: string) => {
    // 更新价格
    handleOrderInfoChange(name, value)

    const priceNumber = Number(value)

    // 如果价格为0或无效，清空对应的盈利亏损值
    if (isNaN(priceNumber) || priceNumber <= 0 || value === '' || value === '0') {
      if (name === 'tpPrice') {
        setPricePercent((prev) => ({
          ...prev,
          tpPricePercent: '',
        }))
      } else {
        setPricePercent((prev) => ({
          ...prev,
          slPricePercent: '',
        }))
      }
      return
    }

    let resultStr = ''

    if (entryPrice && leverage && priceNumber) {
      const priceDiff = side === OrderSide.buy ? priceNumber - entryPrice : entryPrice - priceNumber

      if (unit === '%') {
        const percentage = MathFun.mul(MathFun.div(priceDiff, entryPrice), leverage * 100)
        resultStr = percentage.toFixed(2)
      } else if (unit === '$' && Number(size) > 0) {
        let pnlUsd = 0
        if (currency === 'USDC') {
          // USD 本位：size 是 USD 金额，不再乘 leverage，priceDiff × size / entryPrice
          pnlUsd = MathFun.mul(MathFun.div(priceDiff, entryPrice), size)
        } else {
          // 币本位：size 是币数量，盈亏 = priceDiff  × size
          pnlUsd = MathFun.mul(priceDiff, size)
        }

        resultStr = pnlUsd.toFixed(2)
      }
    }

    if (name === 'tpPrice') {
      setPricePercent((prev) => ({
        ...prev,
        tpPricePercent: resultStr,
      }))
    } else {
      const priceDiff = side === OrderSide.buy ? priceNumber - entryPrice : entryPrice - priceNumber
      if (priceDiff < 0) {
        resultStr = Math.abs(parseFloat(resultStr)).toString();
      } else {
        resultStr = (-Math.abs(parseFloat(resultStr))).toString();
      }

      setPricePercent((prev) => ({
        ...prev,
        slPricePercent: resultStr
      }))
    }
  }

  const handleChanglePricePercent = (name: 'slPricePercent' | 'tpPricePercent', value: string) => {
    const sanitizedValue = value
      .replace(/(\.\d{0,2}).*$/, '$1') // 小数最多保留2位

    setPricePercent({
      ...pricePercent,
      [name]: sanitizedValue,
    })

    const numericInput = Number(value)

    // 如果盈利亏损值为0或无效，清空对应的价格
    if (isNaN(numericInput) || numericInput === 0 || value === '' || value === '0') {
      if (name === 'tpPricePercent') {
        handleOrderInfoChange('tpPrice', '')
      } else {
        handleOrderInfoChange('slPrice', '')
      }
      return
    }

    let newPrice = 0

    if (!entryPrice || !leverage || !numericInput) return

    if (unit === '%') {
      // === 按收益率计算 ===
      const priceOffset = MathFun.div(MathFun.mul(numericInput, entryPrice), leverage * 100)

      const isPositive =
        (name === 'tpPricePercent' && side === OrderSide.buy) || (name === 'slPricePercent' && side === OrderSide.sell)

      newPrice = isPositive ? MathFun.add(entryPrice, priceOffset) : MathFun.sub(entryPrice, priceOffset)
    } else if (unit === '$') {
      let priceOffset = 0
      if (currency === 'USDC') {
        
        // USD 本位，目标盈亏 = size * Δp / entryPrice
        // 推导 Δp = PnL * entryPrice / size
        priceOffset = MathFun.div(MathFun.mul(numericInput, entryPrice), size)
      } else {
        // 币本位，目标盈亏 = Δp * size * leverage
        // 推导 Δp = PnL / (size * leverage)
   
        priceOffset = MathFun.div(numericInput, size)
      }

      const isProfit =
        (name === 'tpPricePercent' && side === OrderSide.buy) || (name === 'slPricePercent' && side === OrderSide.sell)

      newPrice = isProfit ? MathFun.add(entryPrice, priceOffset) : MathFun.sub(entryPrice, priceOffset)
    }
    const formatNewPrice = formatPrice(newPrice, szMap[baseCoin], { limitSigFigs: true})

    // 更新价格
    if (name === 'tpPricePercent') {
      handleOrderInfoChange('tpPrice', formatNewPrice)
    } else {
      handleOrderInfoChange('slPrice', formatNewPrice)
    }
  }


  const handleCheckDisable = () => {
    if (unit ==='$' && Number(size) === 0) {
      return true
    }
    return false
  }

  /* useEffect(() => {
    const intervalId = setInterval(() => {
      handleChangeTsSl('tpPrice', tpPrice)
      handleChangeTsSl('slPrice', slPrice)
    }, 10000);

    return () => clearInterval(intervalId)
  }, [entryPrice, tpPrice, slPrice]) */

  useEffect(() => {
    handleChangeTsSl('tpPrice', tpPrice)
    handleChangeTsSl('slPrice', slPrice)
  }, [unit, type, side])

  useEffect(() => {
    if (!baseCoin) return
    if(orderInfo.tpPrice === '' && orderInfo.slPrice === ''){
       setPricePercent((prev) => ({
        ...prev,
        tpPricePercent:'',
        slPricePercent:'',
      }))
    }
  }, [orderInfo.tpPrice, orderInfo.slPrice,baseCoin])


  useEffect(() => {
    if (Number(size) === 0 && unit === '$') {
      dispatch(
        setOrderInfo({
        ...orderInfo,
        tpPrice: '',
        slPrice: ''
      }),
      )
      setPricePercent({
        tpPricePercent:'',
        slPricePercent:'',
      })
      const timeoutId = setTimeout(() => {
      if (tpPricePercentInputRef.current && typeof tpPricePercentInputRef.current?.blur === 'function') {
        tpPricePercentInputRef.current?.blur()
      }
      if (slPricePercentInputRef.current && typeof slPricePercentInputRef.current.blur === 'function') {
        slPricePercentInputRef.current?.blur()
      }
      // setInputDisabled(true)
    }, 100)

    return () => clearTimeout(timeoutId)
    } else {
      // setInputDisabled(false)
    }
  }, [size, unit])


  return (
    <div className="mb-2.5">
      <div className="flex items-center mb-1 ">
        <InputRightBorderGradient
          label={t('futuresDetails.common.takeProfitPrice')}
          containerClassName="w-full"
          inputClassName="flex-1"
          inputWrapperClassName="flex items-center justify-between"
          onChange={(e) => handleChangeTsSl('tpPrice', e)}
          value={`${tpPrice}`}
          inputProps={{
            disabled: inputDisabled
          }}
          floatingLabel={true}
        />
        <div className='w-[8px]'></div>
        <InputRightBorderGradient
          unit={<UnitSelector unit={unit} unitList={unitList} onChange={handleUnitChange} />}
          inputProps={{
            disabled: inputDisabled
          }}
          onChange={(e) => handleChanglePricePercent('tpPricePercent', e)}
          value={pricePercent.tpPricePercent}
          label={t('futuresDetails.common.profit')}
          containerClassName="w-full"
          inputClassName="flex-1"
          inputWrapperClassName="flex items-center justify-between"
          floatingLabel={true}
          onlyPositiveInteger={false}
          ref={tpPricePercentInputRef}
        />
      </div>

      <div className="flex items-center">
        <InputRightBorderGradient
          label={t('futuresDetails.common.stopLossPrice')}
          containerClassName="w-full"
          inputClassName="flex-1"
          inputWrapperClassName="flex items-center justify-between"
          onChange={(e) => handleChangeTsSl('slPrice', e)}
          value={`${slPrice}`}
          inputProps={{
            disabled: inputDisabled
          }}
          floatingLabel={true}
        />
        <div className='w-[8px]'></div>
        <InputRightBorderGradient
          unit={<UnitSelector unit={unit} unitList={unitList} onChange={handleUnitChange} />}
          inputProps={{
            disabled: inputDisabled
          }}
          onChange={(e) => handleChanglePricePercent('slPricePercent', e)}
          value={pricePercent.slPricePercent}
          label={t('futuresDetails.common.stopLoss')}
          containerClassName="w-full"
          inputClassName="flex-1"
          inputWrapperClassName="flex items-center justify-between"
          floatingLabel={true}
          onlyPositiveInteger={false}
          ref={slPricePercentInputRef}
        />
      </div>
    </div>
  )
}

type UnitSelectorProps = {
  unit: string
  unitList: UITab[]
  onChange: (unit: string) => void
}

const UnitSelector = memo<UnitSelectorProps>(({ unit, unitList, onChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative z-0 flex-1 flex items-center justify-between px-2 ',
            'text-xs text-[#FFFFFFB2] cursor-pointer',
            'transition-colors'
          )}
        >
          <span>{unit}</span>
          <ArrowDownIcon1 fill="#6C6A74" size={16} className="ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn('min-w-[55px] bg-[#1F1E25]  text-[#FFFFFFB2]')}
      >
        {unitList.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              'flex items-center justify-center py-2 text-[calc(1rem*(12/16))] cursor-pointer',
              unit === option.value && 'text-[#FFFFFF] bg-[#ECECED1A]'
            )}
            onClick={() => onChange(option.value)}
          >
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})


export default TpSlSetting
