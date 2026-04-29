import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils.ts'
import InputControl from './InputControl'
import LeverageSlider from './LeverageSlider'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { selectMaxLeverageBySymbol } from '@/redux/modules/futuresMeta.slice'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useTranslation } from 'react-i18next'
import { futuresTradeConfigSelector, futuresTradeConfigActions } from '@/redux/modules/futuresTradeConfigs.slice'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { toast } from 'sonner'
import { useUpdateUserSymbolPreference } from '@/components/futuresDetails/hooks/useUpdateUserSymbolPreference.ts'
import { useResponsive } from '@/hooks/useResponsive'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'




type PositionLeverProps = {
  isFullWidth?: boolean
}

type LeverContentProps = {
  open: boolean
  setOpen: (open: boolean) => void
}
const LeverContent = ({setOpen, open}: LeverContentProps) => {
  const { t } = useTranslation()
  const { baseCoin } = useAppSelector(symbolInfoSelector)
  const maxLeverageFromStore = useAppSelector(selectMaxLeverageBySymbol(baseCoin))
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))

  const dispatch = useAppDispatch()
  const { updateUserSymbolPreference } = useUpdateUserSymbolPreference()


  const isLogin = useCheckLoginOnArb()

  const leverage = tradeConfigs.leverage

  const maxLeverage = useMemo(() => {
    return typeof maxLeverageFromStore === 'number' && maxLeverageFromStore > 0 ? maxLeverageFromStore : 40
  }, [maxLeverageFromStore])

  const [lever, setLever] = useState<string>(leverage)
  const [sliderValue, setSliderValue] = useState([Number(leverage)])
  const [isLoading, setIsLoading] = useState(false)
  const originalLeverageRef = useRef(leverage)

  useEffect(() => {
    const numeric = Number(leverage)
    if (!isNaN(numeric)) {
      setLever(numeric > maxLeverage ? `${maxLeverage}` : leverage)
      originalLeverageRef.current = numeric > maxLeverage ? `${maxLeverage}` : leverage
    }
  }, [leverage, maxLeverage])

  useEffect(() => {
    if (open) {
      // 打开抽屉时，保存原始杠杆值并设置当前值
      const numeric = Number(leverage)
      if (!isNaN(numeric)) {
        const validLeverage = numeric > maxLeverage ? `${maxLeverage}` : leverage
        setLever(validLeverage)
        originalLeverageRef.current = validLeverage
      }
    }
  }, [open, leverage, maxLeverage])

  // 抽屉关闭时重置为原始值
  useEffect(() => {
    if (!open) {
      setLever(originalLeverageRef.current)
      setSliderValue([Number(originalLeverageRef.current)])
      setIsLoading(false)
    }
  }, [open])

  useEffect(() => {
    setSliderValue([Number(lever)])
  }, [lever])

  const milestones = useMemo(() => {
    if (maxLeverage > 5 && maxLeverage <= 10) return [1, 5, maxLeverage]
    if (maxLeverage > 10 && maxLeverage <= 25) return [1, 5, 10, maxLeverage]
    if (maxLeverage > 25 && maxLeverage <= 40) return [1, 5, 10, 25, maxLeverage]
    return [1, maxLeverage]
  }, [maxLeverage])

  const onSliderValueChange = (value: number[]) => {
    const newLever = Math.min(value[0], maxLeverage)
    setSliderValue([newLever])
    setLever(`${newLever}`)
  }

  const handleSureBtn = () => {
    const leverage = lever
    if (Number(leverage) > Number(maxLeverage)) {
      toast.error(`Invalid leverage value, the maximum supported leverage is ${maxLeverage} times`)
      return
    }
    // 如果杠杆值相同，则不进行更新
    if (leverage === tradeConfigs.leverage) {
      setOpen(false)
      return
    }

    if (isLogin) {
      updateUserSymbolPreference({
        isCross: tradeConfigs.positionMode === 'cross' ? true : false,
        leverage: Number(leverage),
        baseCoin
      })
      logEvent2(ACTIONS.contract_adjust_leverage, {
        symbol: baseCoin,
        old_leverage: tradeConfigs?.leverage,
        new_leverage: leverage
      })
    } else {
      dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
        symbol: baseCoin,
        config: {
          leverage: leverage
        }
      }))
    }
    setOpen(false)
  }
  const isValidLever = (inputValue: string) => {
    if (inputValue === '') return true
    return /^[1-9][0-9]*$/.test(inputValue) && Number(inputValue) > 0 && Number(inputValue) <= maxLeverage
  }


  return (
    <>
      <div className='text-[#A9A9B3] text-[calc(1rem*(14/16))] leading-[calc(1rem*(21/16))] mb-4'>
        <div className='mb-4'>
          {t('futuresDetails.positionLever.leverageDesc', {
              token: baseCoin,
              leverage: maxLeverage,
            })}
        </div>
        <div>{t('futuresDetails.positionLever.leverageDesc2')}</div>
      </div>
      <InputControl
        value={lever}
        onChange={(v) => {
          if (isValidLever(v)) {
            setLever(v)
          }
        }}
        validateInput={false}
        onMinus={() => setLever((prev) => `${Math.max(+prev - 1, 1)}`)}
        onPlus={() => setLever((prev) => `${Math.min(+prev + 1, maxLeverage)}`)}
        colorBg="bg-[#2B2B33]"
        inputClassName='h-[48px]'
        inputWrapperClassName='h-[48px]'
        minusBtnClassName='w-[32px] ml-[4px]'
        plusBtnClassName='w-[32px] mr-[4px]'

      />

      <div className="mb-[40px] mt-[25px]">
        <LeverageSlider
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
          onSliderValueChange={onSliderValueChange}
          maxValue={maxLeverage}
          milestones={milestones}
        />
      </div>

      <div className="mb-8 mt-[10px] flex items-center text-[#FFC767] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]">
        <img src="/images/futuresDetail/warn-icon.svg" className="mr-1" alt="danger-icon" />
        {t('futuresDetails.positionLever.warning')}
      </div>

      <Button
        variant="purpleDefault"
        className=" text-white w-full rounded-[50px]  text-[calc(1rem*(18/16))] h-[44px]"
        onClick={handleSureBtn}
        disabled={Number(lever) > maxLeverage || Number(lever) <= 0}
      >
        {t('futuresDetails.common.confirm')}
      </Button>
    </>
  )
}

const PositionLever = ({ isFullWidth }: PositionLeverProps) => {
  const { t } = useTranslation()
  const { baseCoin } = useAppSelector(symbolInfoSelector)

  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const [open, setOpen] = useState(false)

  const maxLeverageFromStore = useAppSelector(selectMaxLeverageBySymbol(baseCoin))

  const dispatch = useAppDispatch()


  const maxLeverage = useMemo(() => {
    return typeof maxLeverageFromStore === 'number' && maxLeverageFromStore > 0 ? maxLeverageFromStore : 10
  }, [maxLeverageFromStore])


  const leverage = tradeConfigs.leverage

  useEffect(() => {
    if (tradeConfigs.leverage === '' ) {
      const showMaxLeverageValue = Number(maxLeverage) > 10 ? 10 : maxLeverage
      dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({ symbol: baseCoin, config: { 
        leverage: showMaxLeverageValue ? showMaxLeverageValue?.toString() : ''
      } }))
    } 
  },[maxLeverage, baseCoin, dispatch])


  const { isDesktop } = useResponsive()


  return (
    isDesktop ?
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={'ghost'}
            className="flex-1 text-[#fff] h-[32px]  text-[12px] leading-[12px] px-[10px] py-[7px] rounded-[6px] bg-[#212127]"
            >
            <div className='flex items-center'>
              {`${leverage}x`}
            </div>
          </Button>
        </DialogTrigger>

        {/* 内容 */}
        <DialogContent className="bg-[#232329] w-[400px] py-4 px-0" showDialogPrimitiveClose={false}>
          <DialogHeader className='border-b border-[#302E38] px-4 pb-4'>
            <div className='flex items-center justify-between'>
              <DialogTitle>{t('futuresDetails.positionLever.adjustLeverage')}</DialogTitle>
              
              <button
                onClick={() => setOpen(false)}
                className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>
          <div className="mt-1">
            <div className='px-4'>
              <LeverContent open={open} setOpen={setOpen}/>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      : <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div
            className={cn(
              `flex-1 flex items-center py-1.5 px-2 rounded-[6px] border border-[#302E38] text-white 
            text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] cursor-pointer`,
              isFullWidth && 'w-full justify-between',
            )}
          >
            <span className='truncate'>{`${leverage}x`}</span>
            <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" alt="select-down-icon" />
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5  flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('futuresDetails.positionLever.adjustLeverage')}</div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DrawerHeader>
          <div className="px-3 pb-8">
            <LeverContent open={open} setOpen={setOpen}/>
          </div>
        </DrawerContent>
      </Drawer>
  )
}

export default PositionLever
