import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLoyalty } from '../context/LoyaltyContext'

export interface IntegralMultiplierDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const IntegralMultiplierDrawer = (props: IntegralMultiplierDrawerProps) => {
  const { t } = useTranslation()
  const { open, onOpenChange } = props
  const { status, debug } = useLoyalty()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-none py-3.5 max-w-[768px] mx-auto bg-[#2B2B33]">
        <DrawerHeader className="pb-4 px-5 flex justify-between items-start">
          <DrawerTitle className="text-white text-left flex flex-col gap-1 font-[400] text-[16px]">
            <div className="flex items-center gap-2">
              {t('loyalty.bottomshet.pointsBonusTitle')}
              <span className="flex items-center cursor-pointer">
                <span className="app-font-light text-[#FFC767] text-xs">
                  {t('loyalty.learnMorePointsRule')}
                </span>
                <img src="/images/loyalty/arrow-right.svg" alt="" className="ml-1" />
              </span>
            </div>
          </DrawerTitle>

          <X
            className="cursor-pointer text-white/60 hover:text-white h-5 w-5"
            onClick={() => {
              onOpenChange(false)
            }}
          />
        </DrawerHeader>
        <div className="px-5 pb-6">
          <div className="space-y-4">
            {/* Description */}
            <div className="text-[calc(14rem/16)] text-[#908E9A] leading-relaxed">
              {t('loyalty.bottomshet.pointsMultiplierDescription')}
            </div>

            {/* Current Multiplier Table */}
            <div>
              <div className="text-[calc(14rem/16)] text-white mb-3">
                {t('loyalty.bottomshet.currentBonus')}
              </div>
              
              <div className="bg-[#18181F0A] rounded-[8px] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-2 bg-[#302E38]">
                  <div className="px-3 py-3 text-[calc(12rem/16)] text-[#908E9A] text-center border-[#79778C29] border border-r-0">
                    {t('loyalty.bottomshet.activeDaysBonus')}
                  </div>
                  <div className="px-3 py-3 text-[calc(12rem/16)] text-[#908E9A] text-center border-x border-[#79778C29] border">
                    {t('loyalty.bottomshet.seasonBonus')}
                  </div>
                  {/* <div className="px-3 py-3 text-[calc(12rem/16)] text-[#908E9A] text-center border-[#79778C29] border border-l-0">
                    {t('loyalty.bottomshet.totalMultiplier')}
                  </div> */}
                </div>

                {/* Table Body */}
                <div className="grid grid-cols-2">
                  <div className="px-3 py-4 text-[calc(16rem/16)] text-white font-[450] text-center border-[#79778C29] border border-r-0 border-t-0 rounded-bl-[8px]">
                    {status?.boost ? `${status?.boost.toFixed(1)}X` : '--'}
                  </div>
                  <div className="px-3 py-4 text-[calc(16rem/16)] text-white font-[450] text-center border-x border-[#79778C29] border  border-t-0 rounded-br-[8px]">
                    {status?.seasonBoost ? `${status.seasonBoost.toFixed(1)}X` : '--'}
                  </div>
                  {/* <div className="px-3 py-4 text-[calc(16rem/16)] text-white font-[450] text-center border-[#79778C29] border border-t-0 border-l-0">
                    {status?.boost ? `${status.boost}X` : '3.2X'}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default IntegralMultiplierDrawer