import { useState, useEffect, useMemo } from 'react'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useNavigate } from 'react-router-dom'
import { UITab } from '@/types/uiTabs.ts'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { DataCard } from './components/DataCard'
import LevelRecord from './components/LevelRecord'
import PointsActivity from './components/PointsActivity'
import { useTradeRewards } from './hooks/useTradeRewards'
import { formatNumberWithCommas } from '@/utils/helpers'
import ClaimDrawer from './components/Claim'
import _ from 'lodash'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { useResponsive } from '@/hooks/useResponsive'
import PcIndex from './pcIndex'
import { Splash } from '@/components/assets/Splash'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'


// 初始化数
const initialTradeData = {
  currentLevel: 1,
  currentLevelProgress: 0,
  nextLevel: 2,
  pointsNeeded: 0,
  totalVolume: 0,
  activeDays: 0,
  totalCommission: '0',
  // totalEarnings:'0'
}

export interface DialogControl {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

const TradeRewards = ({ setOpen }: DialogControl) => {
  const { isDesktop } = useResponsive()
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)
  const { userLevelInfo, fetchUserTierInfo, fetchTaskCategories, fetchClaimRewardData } = useTradeRewards()
  const [currentTab, setCurrentTab] = useState('0') // 0: 我的等级, 1: 赚取积分
  const [tradeData, setTradeData] = useState(initialTradeData)
  const [banlancelist, setBanlancelist] = useState<any>({})
  const { t } = useTranslation()
  const priceSol = useAppSelector(priceChain('SOL'))
  const [progress, setProgress] = useState(0)
  // Tab configuration
  const tabs: UITab[] = [
    { value: '0', label: t('Activityrewards.mylevel') },
    { value: '1', label: t('Activityrewards.Earnpoints') },
  ]

  useEffect(() => {
    fetchUserTierInfo()
  }, [currentTab])
  useEffect(() => {
    if (!_.isEmpty(userLevelInfo)) {
      const isMaxLevel = !userLevelInfo?.nextTier || userLevelInfo?.nextTier?.tierLevel === null || userLevelInfo?.nextTier?.tierLevel === undefined
      setTradeData({
        currentLevel: userLevelInfo?.tierBenefit?.tierLevel,
        currentLevelProgress: userLevelInfo?.tierBenefit?.cashbackPercentage,
        nextLevel: userLevelInfo?.nextTier?.tierLevel,
        pointsNeeded: userLevelInfo.pointsToNextTier,
        totalVolume: userLevelInfo?.userTierInfo?.tradingVolumeUsd,
        activeDays: userLevelInfo?.userTierInfo?.activeDaysThisMonth,
        totalCommission: userLevelInfo?.userTierInfo?.cumulativeCashbackUsd,
        // availableClaim: userLevelInfo?.userTierInfo?.claimableCashbackUsd,
        // totalEarnings: userLevelInfo?.userTierInfo?.totalPoints
      })
      if (isMaxLevel) {
        // 如果是最高级别，进度设置为 100%
        setProgress(100)
      } else {
        calculateProgress(
          userLevelInfo?.userTierInfo?.totalPoints,
          userLevelInfo?.tierBenefit?.minPoints,
          userLevelInfo?.nextTier?.minPoints,
        )
      }
    } else {
      setTradeData(initialTradeData)
    }
  }, [userLevelInfo])

  //   设当前等级要求积分为n, 下一等级要求积分为m, 用户当前积分为x
  // (x-n)/(m-n)=当前进度比例
  // 例: 当前用户为300分, 当前等级要求为200, 下一等级要求为800
  // 则进度=(300-200)/(800-200)=100/600=0.17=17%
  // totalPoints // 当前用户总积分
  // currentLevelPoints // 当前等级要求积分
  // nextLevelPoints // 下一等级要求积分

  const calculateProgress = (totalPoints: number, currentLevelPoints: number, nextLevelPoints: number | null | undefined) => {
    if (!nextLevelPoints || nextLevelPoints === currentLevelPoints) {
      // 如果没有下一级别或下一级别与当前级别相同，进度为 100%
      setProgress(100)
      return
    }
    const progress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100 || 0
    setProgress(Number(progress.toFixed(2)))
  }
  useEffect(() => {
    fetchTaskCategories()
    // 获取余额
    getClaimReward()
  }, [])

  const getClaimReward = async () => {
    const banlancelist: any = fetchClaimRewardData && (await fetchClaimRewardData())
    setBanlancelist(banlancelist)
  }

  // 根据当前sol 价格 计算美元价值
  const availableUsdValue = useMemo(() => {
    const claimAmount = Number(banlancelist?.claimActivityCashback) || 0
    if (claimAmount === 0 && Number(banlancelist?.claimPerpetualCashback) === 0) {
      return '0'
    }
    const solPrice = Number(priceSol) || 0
    const banlance = (claimAmount * solPrice).toFixed(9)
    const totalClaimed = Number(banlance) + Number(banlancelist?.claimPerpetualCashback) || 0
    // 检查计算结果是否有效
    if (isNaN(Number(totalClaimed)) || !isFinite(Number(totalClaimed))) {
      return '0'
    }
    // 将科学计数法转换为固定小数格式，保留8位小数

    const formattedValue = formatNumberWithCommas(totalClaimed, 9)
    return formattedValue || '0'
  }, [banlancelist?.claimActivityCashback, banlancelist?.claimPerpetualCashback, priceSol])

  // // 累计收益：代领取+已领取
  // const totalUsdValue = useMemo(() => {
  //   const claimAmount = Number(banlancelist?.claimActivityCashback) || 0
  //   const solPrice = Number(priceSol) || 0
  //   const totalClaimed = Number(banlancelist?.totalClaimedUsd) || 0

  //   const claimActivsityCashbackUsd = claimAmount * solPrice
  //   const totalValue = claimActivsityCashbackUsd + totalClaimed

  //   // 检查计算结果是否有效
  //   if (isNaN(totalValue) || !isFinite(totalValue)) {
  //     return '0'
  //   }
  //   const formattedValue = formatNumberWithCommas(totalValue, 9)
  //   return formattedValue || '0'
  // }, [banlancelist?.claimActivityCashback, banlancelist?.totalClaimedUsd, priceSol])

  if (!activeWallet.isConnected) return <Splash />

  return (
    isDesktop ? <PcIndex /> : (
    <div
      className={cn(
        'relative mx-auto px-3 bg-[#121212] flex flex-col',
        isDesktop ? 'h-[70vh] overflow-y-scroll w-[660px]' : '@container min-h-[100vh]',
      )}
    >
      {!isDesktop && (
        <div className="flex-shrink-0">
          <HeaderWithBack
            title={t('Activityrewards.title')}
            className="bg-[#121212] px-0"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div
        className={cn(
          'mt-6 h-[44px] flex justify-between w-full bg-[#232329] rounded-[50px] p-[4px]',
          isDesktop && 'mt-0',
        )}
      >
        <div className="flex justify-between items-center w-full">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              onClick={() => setCurrentTab(tab.value || '0')}
              className={cn(
                'text-[#A5A3B1CC] text-[16px] px-4 py-2 w-[50%] text-center',
                currentTab === tab.value && 'text-white bg-[#121215] rounded-[50px]',
              )}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-[8px] bg-impartal bg-cover">
        {/* Current Level Section */}
        <div
          className="p-1 bg-[#AB57FF] rounded-[8px]"
          style={{
            backgroundImage: 'url(/images/nodeAgent/bg.png)',
            backgroundSize: '100% 190px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            className=" rounded-[8px]  px-3 pb-3 "
            style={{
              backgroundImage: 'url(/images/nodeAgent/bg-white.png)',
              backgroundSize: '100%',
              backgroundRepeat: 'round',
            }}
          >
            <div className="flex items-center  py-4 gap-3">
              <div className="text-[#141414] text-[16px]">
                {t('Activityrewards.currentLevel')} <span className="font-bold">Lv{tradeData.currentLevel}</span>
              </div>
              <div className="border border-impartal text-impartal h-[24px] px-3 rounded-full text-[14px]">
                {tradeData.currentLevelProgress.toFixed(0)}% {t('Activityrewards.cashback')}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2 relative">
                <div className="bg-[#121214] text-white text-[13px] font-medium px-2 h-[21px] rounded-full z-10">
                  Lv{tradeData.currentLevel}
                </div>
                {/* Progress Bar Container */}
                <div className="flex-1 relative ml-[-2px]">
                  {/* Background Track */}
                  <div className="w-full bg-[#2323291F]  h-[6px] relative">
                    {/* Active Progress */}
                    <div
                      className="bg-impartal h-[6px] rounded-full transition-all duration-300 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4  bg-impartal rounded-full shadow-lg">
                        <span className="bg-black w-[10px] h-[10px] rounded-full block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Level */}
                <div className="bg-[#121214] text-white text-[13px] font-medium px-2 h-[21px] rounded-full">
                  {tradeData.nextLevel === null || tradeData.nextLevel === undefined ? 'Max' : `Lv${tradeData.nextLevel}`}
                </div>
              </div>

              {/* Progress Text */}
              {tradeData.nextLevel !== null && tradeData.nextLevel !== undefined && (
                <div className="text-left text-[#14141480] text-[13px]">
                  {t('Activityrewards.distanceToNextLevel')}{' '}
                  <span className="text-impartal font-bold">{tradeData.pointsNeeded}</span> {t('Activityrewards.exp')}
                </div>
              )}
            </div>
            {/* Data Card */}
            {currentTab === '0' && <DataCard tradeData={tradeData} />}
          </div>
        </div>
        {/* Available Claim Amount */}
        {currentTab === '0' && (
          <>
            <div className="px-3 flex justify-between items-center mt-3">
              <div className=" text-left">
                <div className="text-white text-[14px]">{t('Activityrewards.PendingCliam')}</div>
                <div className="text-white text-[24px] font-bold">${availableUsdValue}</div>
              </div>
              <ClaimDrawer
                banlancelist={banlancelist}
                solPrice={priceSol}
                onClaimSuccess={getClaimReward}
              />
            </div>
            <div className="mt-3 h-[36px] flex justify-between items-center border-t border-[#ECECED1F] pt-1 px-3">
              <div className="text-[#FFFFFF80] text-[14px]">{t('Activityrewards.Totalreceived')}</div>
              <div className="text-[#FFFFFF90] text-[14px]">
                ${formatNumberWithCommas(banlancelist?.totalClaimedUsd || 0, 6)}
              </div>
            </div>
          </>
        )}
      </div>
      {currentTab === '0' ? <LevelRecord userLevel={tradeData.currentLevel} /> : <PointsActivity setOpen={setOpen} />}
    </div>
    )
  )
}

export default TradeRewards
