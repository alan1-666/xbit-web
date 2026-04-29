import { cn } from '@/lib/utils.ts'
import { IconDeposit } from '@components/icon/stroke/IconDeposit.tsx'
import { IconSwap } from '@components/icon/stroke/IconSwap.tsx'
import { IconWithdraw } from '@components/icon/stroke/IconWithdraw.tsx'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { DepositCard } from '@pages/assets/overview/components/DepositCard.tsx'
import { TransferCard } from '@pages/assets/overview/components/TransferCard.tsx'
import { WithdrawCard } from '@pages/assets/overview/components/WithdrawCard.tsx'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import PrefetchPerpsDepositAddress from '@pages/assets/overview/components/PrefetchPerpsDepositAddress.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'


export const ExchangeCard = ({
  defaultTab,
  defaultChainId,
  className,
  onWithdrawSuccess,
}: {
  defaultTab?: string
  defaultChainId?: number
  className?: string
  defaultAccountType?: 'MEME' | 'CONTRACT' | 'PREDICTION'
  onWithdrawSuccess?: () => void
}) => {
  const [tab, setTab] = useState(defaultTab ?? 'deposit')
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)

  // const isMeme = location.search.includes('funding') || location.search.includes('meme')
  const defaultAccountType = useMemo(() => {
    const { search, pathname } = location
    if (search.includes('funding') || search.includes('meme') || pathname.includes('assets/meme')) {
      return 'MEME'
    }
    if (search.includes('prediction') || pathname.includes('assets/prediction') || pathname.includes('/prediction')) {
      return 'PREDICTION'
    }
    return 'CONTRACT'
  }, [location.search, location.pathname])

  return (
    <div className={cn('bg-[#141418] w-full border border-[#79778C29] p-3 rounded-xl', className)}>
      {activeWallet.isConnected && <PrefetchPerpsDepositAddress />}

      <Tabs value={tab} onValueChange={setTab} defaultValue="deposit" className="w-full">
        <TabsList className="w-full border border-[#79778C29] bg-transparent relative p-0 rounded-full h-12 mb-2">
          <div
            className={cn(
              'absolute w-1/3 top-0 left-0 bottom-0 transition py-1',
              tab === 'withdraw' && 'translate-x-full',
              tab === 'deposit' && 'translate-x-0 px-1',
              tab === 'transfer' && 'translate-x-[200%] px-1',
            )}
          >
            <div className="size-full purple-btn-gradient rounded-full " />
          </div>
          <TabsTrigger
            value="deposit"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 flex items-center gap-2"
          >
            <IconDeposit />
            {t('assets.overview.deposit')}
          </TabsTrigger>
          <TabsTrigger
            value="withdraw"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 flex items-center gap-2"
          >
            <IconWithdraw />
            {t('assets.overview.withdraw')}
          </TabsTrigger>
          <TabsTrigger
            value="transfer"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 flex items-center gap-2"
          >
            <IconSwap />
            {t('assets.overview.convert')}
          </TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <div className={cn(tab === 'deposit' ? 'block' : 'hidden')}>
            <DepositCard defaultAccountType={defaultAccountType} defaultChainId={defaultChainId} />
          </div>
          <div className={cn(tab === 'withdraw' ? 'block' : 'hidden')}>
            <WithdrawCard
              defaultAccountType={defaultAccountType}
              defaultChainId={defaultChainId}
              onWithdrawSuccess={onWithdrawSuccess}
            />
          </div>
          <div className={cn(tab === 'transfer' ? 'block' : 'hidden')}>
            <TransferCard />
          </div>
        </div>
      </Tabs>
    </div>
  )
}
