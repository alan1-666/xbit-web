import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog.tsx'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useLoyalty } from '../context/LoyaltyContext'

export interface IntegralMultiplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const IntegralMultiplierDialog = ({ onOpenChange, open }: IntegralMultiplierDialogProps) => {
  const { t } = useTranslation()
  const { status } = useLoyalty()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-[#212129] gap-0" showDialogPrimitiveClose={false}>
        <DialogHeader className="border-b px-4 py-2.5 flex flex-row items-center justify-between">
          <DialogTitle className="font-[380] text-[calc(18rem/16)] flex items-center gap-2">
            {t('loyalty.bottomshet.pointsBonusTitle')}
            <span className="flex items-center cursor-pointer">
              <span className="app-font-light text-[#FFC767] text-xs">{t('loyalty.learnMorePointsRule')}</span>
              <img src="/images/loyalty/arrow-right.svg" alt="" className="ml-1" />
            </span>
          </DialogTitle>
          <X className="h-5 w-5 cursor-pointer text-white/60 hover:text-white" onClick={() => onOpenChange(false)} />
        </DialogHeader>
        <div className="px-4 py-6">
          <div className="space-y-4">
            {/* Description */}
            <div className="text-[calc(14rem/16)] text-[#908E9A] leading-relaxed">
              {t('loyalty.bottomshet.pointsMultiplierDescription')}
            </div>

            {/* Current Multiplier Table */}
            <div>
              <div className="text-[calc(14rem/16)] text-white mb-3">{t('loyalty.bottomshet.currentBonus')}</div>

              <div className="bg-[#18181F0A] rounded-[8px] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-2 bg-[#302E38]">
                  <div className="px-4 py-3 text-[calc(12rem/16)] text-[#908E9A] text-center border-[#79778C29] border border-r-0">
                    {t('loyalty.bottomshet.activeDaysBonus')}
                  </div>
                  <div className="px-4 py-3 text-[calc(12rem/16)] text-[#908E9A] text-center border-x border-[#79778C29] border"> 
                    {t('loyalty.bottomshet.seasonBonus')}
                  </div>
                  {/* <div className="px-4 py-3 text-[calc(12rem/16)] text-[#908E9A] text-center border-[#79778C29] border border-l-0">
                    {t('loyalty.bottomshet.totalMultiplier')}
                  </div> */}
                </div>

                {/* Table Body */}
                <div className="grid grid-cols-2">
                  <div className="px-4 py-4 text-[calc(18rem/16)] text-white font-[450] text-center border-[#79778C29] border border-r-0 border-t-0 rounded-bl-[8px]">
                    {status?.boost ? `${status?.boost.toFixed(1)}X` : '--'}
                  </div>
                  <div className="px-4 py-4 text-[calc(18rem/16)] text-white font-[450] text-center border-x border-[#79778C29] border  border-t-0 rounded-br-[8px]">
                    {status?.seasonBoost ? `${status.seasonBoost.toFixed(1)}X` : '--'}
                  </div>
                  {/* <div className="px-4 py-4 text-[calc(18rem/16)] text-white font-[450] text-center border-[#79778C29] border border-t-0 border-l-0">
                    {status?.boost ? `${status.boost}X` : '3.2X'}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IntegralMultiplierDialog
