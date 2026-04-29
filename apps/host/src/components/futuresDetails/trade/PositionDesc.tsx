
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { futuresTradeConfigActions, futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useUpdateUserSymbolPreference } from '@/components/futuresDetails/hooks/useUpdateUserSymbolPreference.ts'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useResponsive } from '@/hooks/useResponsive'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../ui/dialog'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { X } from 'lucide-react'


interface PositionModeProps {
  isFullWidth?: boolean
  childrenTrigger?: React.ReactNode
}

const PositionMode = ({ isFullWidth, childrenTrigger }: PositionModeProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { baseCoin } = useAppSelector(symbolInfoSelector)
  const [open, setOpen] = useState(false)
  
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const [mode, setMode] = useState(tradeConfigs.positionMode)
  const isLogin = useCheckLoginOnArb()
  const { isDesktop } = useResponsive()

  const { updateUserSymbolPreference } = useUpdateUserSymbolPreference()

  const modeOptions = [
    {
      value: 'cross',
      label: t('futuresDetails.positionMode.cross'),
      desc: t('futuresDetails.positionMode.crossDesc'),
    },
    {
      value: 'isolated',
      label: t('futuresDetails.positionMode.isolated'),
      desc: t('futuresDetails.positionMode.isolatedDesc'),
    },
  ]

  const handleTempChange = (mode: 'cross' | 'isolated') => {
    setMode(mode)
  }

  const handleBtnSure = () => {
    handleModeChange(mode)
    setOpen(false)

  }

  const handleModeChange = (mode: string) => {
    if (isLogin) {
      updateUserSymbolPreference({
        leverage: Number(tradeConfigs.leverage),
        isCross: mode === 'cross',
        baseCoin,
      })
    } else {
      dispatch(
        futuresTradeConfigActions.updateFuturesTradeConfig({
          symbol: baseCoin,
          config: {
            positionMode: mode === 'cross' ? 'cross' : 'isolated',
          },
        }),
      )
    }
  }
  useEffect(() => {
    setMode(tradeConfigs.positionMode)
  }, [tradeConfigs.positionMode, open])

  const showLabel = useMemo(() => {
    return modeOptions.find((item) => item.value === tradeConfigs.positionMode)?.label
  }, [tradeConfigs.positionMode, t])

  return (
    isDesktop ? 
    
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={'ghost'}
          className="flex-1 text-[#fff] h-[32px]  text-[12px] leading-[12px] px-[10px] py-[7px] rounded-[6px] bg-[#212127]"
          >
          <div className='flex items-center'>
            {t('futuresDetails.common.OneWay')}
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#232329] w-[400px] py-4 px-0" showDialogPrimitiveClose={false}>
        <DialogHeader className='border-b border-[#302E38] px-4 pb-4'>
          <div className='flex items-center justify-between'>
            <DialogTitle className="text-[18px] ">{t('futuresDetails.common.positionMode')}</DialogTitle>
             <button
                onClick={() => setOpen(false)}
                className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>
          </div>
        </DialogHeader>
        <div className='px-4'>
          <div className="text-[#A9A9B3] text-[calc(1rem*(14/16))] leading-[calc(1rem*(21/16))] mb-6 text-center">{t('futuresDetails.common.oneWayIntrod')}</div>
          <Button 
            variant="purpleDefault"
            className="py-0 w-full h-[44px] text-[#fff] rounded-[200px]"
            onClick={handleBtnSure}
            >
            {t('futuresDetails.common.confirm')}
          </Button>
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
           <span className='truncate'>{t('futuresDetails.common.OneWay')}</span>
           
          <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" alt="select-down-icon" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-5 px-3.5  flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('futuresDetails.common.positionMode')}</div>
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DrawerHeader>
        <div className="px-3 pb-8">
          <div className="text-[#A9A9B3] text-[calc(1rem*(14/16))] leading-[calc(1rem*(21/16))] mb-6">{t('futuresDetails.common.oneWayIntrod')}</div>
          <Button 
            variant="purpleDefault"
            className="text-white w-full rounded-[50px]  text-[calc(1rem*(18/16))] h-[44px]"
            onClick={handleBtnSure}
          >
          {t('futuresDetails.common.confirm')}
        </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default PositionMode
