import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { toast } from 'sonner'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import { Button } from '@components/ui/button.tsx'
export interface ExchangeActionsProps {
  onDepositClick?: () => void
  onWithdrawClick?: () => void
  onTransferClick?: () => void
  onBuyClick?: () => void
  hidenBuy?: boolean
}

export const ExchangeActions = (prop: ExchangeActionsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { onDepositClick, onWithdrawClick, onTransferClick, onBuyClick, hidenBuy } = prop

  const assetsNav = [
    {
      key: 'deposit',
      icon: '/images/icons/asset-deposit-v3.svg?v=1',
      title: t('assets.deposit.title'),
      onClick: () => {
        logEvent2(ACTIONS.deposit_click)
        if (onDepositClick) {
          onDepositClick()
        } else {
          navigate(APP_PATH.DEPOSIT)
        }
      },
    },
    {
      key: 'withdraw',
      icon: '/images/icons/asset-withdraw-v3.svg?v=1',
      title: t('assets.withdraw.withdrawLabel'),
      onClick: onWithdrawClick ? () => onWithdrawClick() : () => navigate(APP_PATH.WITHDRAWAL),
    },
    {
      key: 'transfer',
      icon: '/images/icons/asset-swap-v3.svg?v=1',
      title: t('assets.transfer'),
      onClick: onTransferClick ? () => onTransferClick() : () => navigate(APP_PATH.TRANSFER),
    },
    {
      key: 'buy',
      icon: '/images/icons/asset-buy.svg?v=1',
      title: t('assets.buy'),
      onClick: onBuyClick ? () => onBuyClick() : () => toast.info(t('liquidityChart.comingSoon')),
      hidden: hidenBuy,
    },
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {assetsNav.map((item, index) => {
        if (item.hidden) {
          return null
        }
        return (
          <Button
            key={index}
            variant="glassLiquid"
            className="block h-full w-20 p-2.5 rounded-2xl"
            onClick={() => item.onClick && item.onClick()}
          >
            <div className="flex items-center justify-center">
              <div className="rounded-full">
                <img src={item.icon} alt={item.title} className="size-8 min-w-8" />
              </div>
            </div>
            <div className="mt-1.25 text-center text-[12px] leading-none text-white whitespace-nowrap">
              {item.title}
            </div>
          </Button>
        )
      })}
    </div>
  )
}

export default ExchangeActions
