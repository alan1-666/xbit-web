import ExchangeActions from '@/components/assets/overview/ExchangeActions.tsx'
import Loader from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { formatBalance, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { useState } from 'react'
import { toast } from 'sonner'
import { EnableTradingDialog } from '../shared/EnableTradingButton'

interface PredictionHeaderProps {
  totalBalance?: number
  usdcBalance?: number
  changeAmount?: number
  changePercent?: number
  isPending?: boolean
  hideBalance?: boolean
  onToggleBalance: () => void
  onDeposit: () => void
  onWithdraw: () => void
  t: (key: string) => string
}

export const PredictionHeader = ({
  totalBalance = 0,
  changeAmount = 0,
  changePercent = 0,
  isPending = false,
  hideBalance = false,
  onToggleBalance,
  onDeposit,
  onWithdraw,
  t,
}: PredictionHeaderProps) => {
  const proxyWallet = useProxyWallet()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative flex min-h-[240px] flex-col items-center justify-between bg-transparent">
      <div className="flex flex-1 flex-col items-center justify-center space-y-2">
        {isPending ? (
          <Loader />
        ) : (
          <div className="font-semi-bold cursor-pointer text-[32px] leading-8" onClick={onToggleBalance}>
            {hideBalance
              ? '*****'
              : formatBalance(totalBalance, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}
          </div>
        )}

        {/* PnL Display invisible to maintain height matching Overview.tsx */}
        <div
          className={cn(
            'invisible flex items-center gap-2 text-[16px] leading-4', // Added invisible
            changeAmount > 0 ? 'text-rise' : changeAmount < 0 ? 'text-fall' : 'text-white',
          )}
        >
          <span>
            {hideBalance
              ? '*****'
              : formatBalance(changeAmount, {
                  showSign: true,
                  showCurrency: true,
                  roundMode: 'floor',
                })}
          </span>
          <span
            className={cn(
              'rounded-[4px] px-2 py-[2.5px]',
              changePercent > 0 ? 'bg-rise/15' : changePercent < 0 ? 'bg-fall/15' : 'bg-white/15',
            )}
          >
            {formatPercent(changePercent, {
              showSign: true,
            })}
          </span>
        </div>
      </div>

      <div className="">
        <ExchangeActions
          onDepositClick={onDeposit}
          onWithdrawClick={onWithdraw}
          onTransferClick={() => {
            toast.info(t('personalCenter.featureList.comingSoon'))
          }}
          hidenBuy={true}
        />
        {!proxyWallet && (
          <div className="absolute inset-0 z-10 flex min-h-[250px] items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-[2px]">
            <div className="mx-auto w-36">
              <Button className={cn('w-full rounded-md')} variant="gradient" onClick={() => setIsOpen(true)}>
                {t('prediction.enableTrading.btnEnable')}
              </Button>
            </div>
          </div>
        )}
        <EnableTradingDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>
    </div>
  )
}
