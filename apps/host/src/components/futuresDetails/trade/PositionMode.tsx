import { useEffect, useMemo, useState } from 'react'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
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
import { logEvent2, ACTIONS } from '@services/google-analytics.service'


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
      logEvent2(ACTIONS.contract_switch_margin, {
        symbol: baseCoin,
        margin_mode: mode,
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

  const renderContent = (
    <>
      <div className="">
        {modeOptions.map((item) => {
          return (
            <div
              className={cn(
                'flex justify-between items-center py-[18px] cursor-pointer px-[16px] border-[1px] border-solid rounded-[6px] mb-4',
                mode === item.value ? 'bg-[#79778C29] border-transparent' : 'border-[#302E38]'
              )}
              key={item.value}
              onClick={() => {
                handleTempChange(item.value as 'cross' | 'isolated')
              }}
            >
              <div className="flex-1 ">
                <p className={cn("text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))]",
                  mode === item.value ? 'text-[#FBFBFB] ' : 'text-[#908E98]'
                )}> {item.label}</p>
                {item?.desc && (
                  <p className={cn("text-[calc(1rem*(14/16))] leading-[calc(1rem*(21/16))] mt-2",
                    mode === item.value ? 'text-[#A9A9B3]' : 'text-[#605E68]'
                  )}>
                    {item?.desc}
                  </p>
                )}
              </div>

              <img
                className={cn(
                  'transition-opacity duration-300 ml-4',
                  mode !== item.value ? 'opacity-0 pointer-events-none' : 'opacity-100',
                )}
                src="/images/futuresDetail/selected-icon2.svg"
                alt="selected-icon"
              />
            </div>
          )
        })}
      </div>

      <Button 
        variant="purpleDefault"
        className="py-0 mt-3 h-[44px] text-[#fff] rounded-[200px] w-full"
        onClick={handleBtnSure}
        >
        {t('futuresDetails.common.confirm')}
      </Button>
        
    </>
  )

  return (
    isDesktop ? 
    
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={'ghost'}
          className="flex-1 text-[#fff] h-[32px]  text-[12px] leading-[12px] px-[10px] py-[7px] rounded-[6px] bg-[#212127]"
          >
          <div className='flex items-center'>
            {showLabel}
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#232329] w-[400px] py-4 px-0" showDialogPrimitiveClose={false}>
        <DialogHeader className='border-b border-[#302E38] px-4 pb-4'>
          <div className='flex items-center justify-between'>
            <DialogTitle className="text-[18px] ">{t('futuresDetails.common.marginMode')}</DialogTitle>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        <div className='px-4'>
          {renderContent}
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
          <span className='truncate'>{showLabel}</span>
          <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" alt="select-down-icon" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-5 px-3.5  flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('futuresDetails.common.marginMode')}</div>
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DrawerHeader>
        <div className="px-3 pb-8">
          {renderContent}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default PositionMode
