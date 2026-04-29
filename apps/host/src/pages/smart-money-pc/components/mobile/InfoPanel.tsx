
import { Drawer, DrawerContent,DrawerHeader,DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { memo } from 'react'

interface InfoPanelProps {
  open: boolean
  type: 'MaxDrawdown' | 'ProfitFactor' | 'SharpeRatio'
  setOpen: (open: boolean) => void
}

const InfoPanel = ({ open, setOpen, type }: InfoPanelProps) => {

  const { t } = useTranslation()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">
              {type === 'MaxDrawdown' ? t('smartMoney.latestTrader.maxDrawdown') : type === 'ProfitFactor' ? t('smartMoney.profitFactor') : t('smartMoney.sharpeRatio')}
            </div>
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-3">
          <div className="text-[calc(1rem*(15/16))] leading-[calc(1rem*(22/16))] text-[#FFFFFFB2]">
            {type === 'MaxDrawdown' ? t('smartMoney.metric.maxDrawdown.desc') : type === 'ProfitFactor' ? t('smartMoney.metric.profitFactor.desc') : t('smartMoney.metric.sharpeRatio.desc')}
          </div>

          <div className="flex justify-center items-center flex-row gap-2.5 mt-9 mb-8">
						<Button variant="purpleDefault" className="h-[44px] text-white rounded-[50px] text-[calc(1rem*(18/16))] w-full"  onClick={() => setOpen(false)}>
              {t('common.actions.confirm')}
						</Button>
					</div>
          
        </div>
      </DrawerContent>
    </Drawer>
  )

}

export default memo(InfoPanel)