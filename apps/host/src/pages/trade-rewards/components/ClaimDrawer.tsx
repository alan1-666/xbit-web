import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useTradeRewards } from '../hooks/useTradeRewards'
import { formatNumberWithCommas } from '@/utils/helpers'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import Records from './records'
import TierBenefitsTable from './TierBenefitsTable'


interface ClaimDrawerProps {
  banlancelist: any
  onClaimSuccess: () => void
  userLevel?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  solPrice?: number
  drawerRef?: React.RefObject<HTMLDivElement | null>
  currentType?: string
}

const ClaimDrawer = ({
  banlancelist,
  onClaimSuccess,
  userLevel = 1,
  open,
  onOpenChange,
  solPrice,
  drawerRef,
  currentType,
}: ClaimDrawerProps) => {
  const { t } = useTranslation()
  const { claimReward, fetchClaimRecord } = useTradeRewards()
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress

  const [currentTab, setCurrentTab] = useState(currentType || '0') // 0: 领取奖励, 1: 领取记录, 2: 等级权益
  const [claimingAll, setClaimingAll] = useState(false)
  const [recordsData, setRecordsData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const pageSize = 10

  // 当 drawer 打开时，根据 currentType 重置 currentTab
  useEffect(() => {
    if (open && currentType !== undefined) {
      setCurrentTab(currentType)
    }
  }, [open, currentType])

  const solTotalUsd = Number(banlancelist?.claimActivityCashback) * Number(solPrice) || 0
  const rewards = [
    {
      id: '1',
      symbol: 'SOL',
      type: 'MEME',
      amount: banlancelist?.claimActivityCashback,
      usdValue: solTotalUsd,
      icon: '/images/cryptoDeposit/solana.svg',
    },
    {
      id: '2',
      symbol: 'USDC',
      type: 'PERPETUAL',
      amount: banlancelist?.claimPerpetualCashback,
      usdValue: banlancelist?.claimPerpetualCashback,
      icon: '/images/cryptoDeposit/usdc.svg',
    },
  ]

  // 获取领取记录数据
  useEffect(() => {
    if (currentTab === '1' && open) {
      getClaimReward(1, true)
    }
  }, [currentTab, open])


  const getClaimReward = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true)
        setRecordsData([])
      } else {
        setIsLoadingMore(true)
      }

      const ListData = await fetchClaimRecord(page, pageSize, 'success', true)
      if (ListData && ListData.success) {
        const newData = ListData.data || []

        if (isRefresh) {
          setRecordsData(newData)
        } else {
          setRecordsData((prevData: any[]) => {
            const existingIds = new Set(prevData.map((item: any) => item.id))
            const filteredNewData = newData.filter((item: any) => !existingIds.has(item.id))
            return [...prevData, ...filteredNewData]
          })
        }

        const currentTotal = isRefresh ? newData.length : recordsData.length + newData.length
        const hasMore = ListData.total > currentTotal
        setHasNextPage(hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch claim records:', error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = (page: number) => {
    getClaimReward(page, false)
  }

  // 领取单个奖励
  const handleClaimToken = async (item: any) => {
    if (Number(item.usdValue) < 5) {
      toast.error(t('Activityrewards.mustBeGreaterThanOrEqualTo'))
      return
    }
    setClaimingAll(true)
    try {
      const res: any = await claimReward(userAddress, item.type)
      if (res.success) {
        if (item.type === 'PERPETUAL') {
          toast.success(t('Activityrewards.claimPerpSuccess'))
        } else {
          toast.success(t('Activityrewards.claimSuccess'))
        }
        onOpenChange(false)
        onClaimSuccess && onClaimSuccess()
      } else {
        toast.error(t('Activityrewards.claimFailed'))
        onOpenChange(false)
      }
    } finally {
      setClaimingAll(false)
    }
  }

  const tabs = [
    { value: '0', label: t('Activityrewards.ClaimReward') },
    { value: '1', label: t('Activityrewards.ClaimRecord') },
    { value: '2', label: t('Activityrewards.levelBenefits') },
  ]

  if (!open) {
    return null
  }

  return (
    <div 
      ref={drawerRef}
      className="fixed left-1/2 -translate-x-1/2 bottom-[100px] w-full bg-[#121214] backdrop-blur-[34px] rounded-[18px] p-0 border-none z-20 max-h-[70vh] overflow-y-auto"
    >
      <div className="flex flex-col items-start pb-4 pt-0 px-0 w-full">
          {/* Tab 导航 */}
          <div className="p-4 ">
            <div className="bg-[#27272a] flex h-[40px] items-center p-1 rounded-[6px]">
              {tabs.map((tab) => (
                <div
                  key={tab.value}
                  onClick={() => setCurrentTab(tab.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[4px] cursor-pointer transition-all flex items-center justify-center',
                    currentTab === tab.value
                      ? 'bg-[#09090b] text-[#fafafa] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]'
                      : 'text-[#9d9ca2] hover:text-[#fafafa]'
                  )}
                >
                  <div className="text-[14px] font-medium leading-[20px] whitespace-nowrap">
                    {tab.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="px-4 w-full">
            {currentTab === '0' && (
              <div className="flex flex-col gap-6">
                {/* Reward List */}
                <div className="px-4 mt-2 flex  gap-3 rounded-xl">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center w-[50%] py-3 "
                    >
                      <div className="flex items-center gap-3">
                        <img src={reward.icon} alt={reward.symbol} className="w-8 h-8" />
                        <div>
                          <div className="text-white text-base font-medium">
                            {reward.amount} {reward.symbol}
                          </div>
                          {/* <div className="text-sm text-white/70">
                            ${formatNumberWithCommas((reward.usdValue || 0).toString(), 9)}
                          </div> */}
                        </div>
                      </div>
                      <div className="ml-[10px]">
                        <Button
                          disabled={Number(reward.usdValue) <= 0}
                          onClick={() => handleClaimToken(reward)}
                          className={`w-full py-3 h-[28px] rounded-[8px] text-white text-[14px] border border-[#27272A] bg-[#212127] text-[#ffffff]  
                            ${Number(reward.usdValue) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {claimingAll
                            ? t('Activityrewards.claimLoading')
                            : t('Activityrewards.claim')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab === '1' && (
              <div className="w-full h-[323px] border border-[rgba(236,236,237,0.12)] rounded-[8px] overflow-hidden ">
                <Records
                  data={recordsData}
                  loading={loading}
                  hasNextPage={hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  pageSize={pageSize}
                  initialPage={1}
                />
              </div>
            )}

            {currentTab === '2' && (
              <div className="w-full h-[323px]">
                <TierBenefitsTable currentLevel={userLevel} />
              </div>
            )}
          </div>
        </div>
      </div>
  
  )
}

export default ClaimDrawer

