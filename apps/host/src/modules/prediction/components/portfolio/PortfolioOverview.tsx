import Loader from '@/components/common/Loader'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatBalance } from '@/lib/format.ts'
import { cn } from '@/lib/utils'
import { useMyBalance } from '@/modules/prediction/hooks/useMyBalance.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { exchangeActions } from '@/redux/modules/exchange.slice.ts'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { EnableTradingDialog } from '../shared/EnableTradingButton'
import ProfitLossChartCard from '../shared/ProfitLossChartCard'

export const PortfolioOverview = () => {
  const [showBalance, setShowBalance] = useState(true)
  const userAddress = useProxyWallet()
  const { totalBalance, usdcBalance, isLoading } = useMyBalance()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    console.log('data', { totalBalance, usdcBalance })
  }, [totalBalance, usdcBalance])

  const assetsNav = [
    {
      key: 'deposit',
      icon: 'asset-deposit.svg',
      title: t('assets.overview.deposit'),
    },
    {
      key: 'withdraw',
      icon: 'asset-withdraw.svg',
      title: t('assets.withdraw.withdrawLabel'),
    },
    {
      key: 'transfer',
      icon: 'asset-swap.svg',
      title: t('assets.transfer'),
    },
  ]

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:justify-between">
      {/* Portfolio Card */}
      <div className="relative mb-4 flex h-48 w-full flex-col justify-between rounded-xl border border-[#79778C29] bg-[#141418] p-4">
        <div className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-x-1.5">
              <p className="text-[16px] leading-none font-[380] text-[#FBFBFB]">
                {t('prediction.portfolio.totalAssets')}
              </p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="group inline-flex size-4 cursor-pointer items-center justify-center gap-2 rounded-sm bg-transparent whitespace-nowrap text-gray-400 transition hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:outline-none active:scale-[97%]"
              >
                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          </div>
          <div className="mb-1 flex items-center justify-between">
            <div className="transition-all duration-200">
              <div className="flex items-center gap-8">
                <div className="space-y-2">
                  <div className="text-[12px] leading-none font-[380] text-[#6C6A74]">
                    {t('prediction.portfolio.totalValue')}
                  </div>
                  <div className="text-[20px] leading-none font-[450] text-[#FBFBFB]">
                    {showBalance ? (
                      <>
                        {isLoading ? (
                          <Loader />
                        ) : totalBalance ? (
                          formatBalance(totalBalance, {
                            showCurrency: true,
                            roundMode: 'floor',
                          })
                        ) : (
                          '0.00'
                        )}
                      </>
                    ) : (
                      '******'
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[12px] leading-none font-[380] text-[#6C6A74]">
                    {t('prediction.portfolio.availableBalance')}
                  </div>
                  <div className="text-[20px] leading-none font-[450] text-[#FBFBFB]">
                    {showBalance ? (
                      <>
                        {isLoading ? (
                          <Loader />
                        ) : usdcBalance !== undefined ? (
                          formatBalance(usdcBalance, {
                            showCurrency: true,
                            roundMode: 'floor',
                          })
                        ) : (
                          '0.00'
                        )}
                      </>
                    ) : (
                      '******'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {assetsNav.map((item, index) => (
            <div
              key={index}
              className="flex cursor-pointer flex-col items-center"
              onClick={() => {
                if (item.key === 'transfer') {
                  toast.info(t('personalCenter.featureList.comingSoon'))
                  return
                }
                dispatch(
                  exchangeActions.openExchangeDialog({
                    defaultTab: item.key as 'deposit' | 'withdraw' | 'transfer',
                  }),
                )
              }}
            >
              <div className="flex items-center justify-center rounded-lg bg-[#2B2B35] px-4 py-2">
                <img src={`/images/icons/${item.icon}`} alt={item.title} className="mr-2 h-5 w-5" />
                <span className="text-primary text-sm">{item.title}</span>
              </div>
            </div>
          ))}

          {!userAddress && (
            <div className="absolute inset-x-0 inset-y-1 z-10 flex items-center justify-center rounded-lg bg-[#141418]/60 backdrop-blur-[2px]">
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

      {/* Profit/Loss Card */}
      <ProfitLossChartCard userAddress={userAddress} />
    </div>
  )
}
