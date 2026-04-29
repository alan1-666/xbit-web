import { TokenDetail as TokenDetailCore } from '@/@generated/gql/graphql-core.ts'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import { useUserReferralSnapshot } from '@/hooks/useUserReferralSnapshot'
import { useTokenPortrait } from '@/pages/detail/orderForm/desktop/hook/useTokenPortrait'
import { TokenMarketStats } from '@/types/token'
import OnChainAnalytics from '@components/aiAnalytics/OnChainAnalytics.tsx'
import OnChainTextAnalysis from '@components/aiAnalytics/OnChainTextAnalysis.tsx'
import Chart from '@components/chart/index.tsx'
import ShareBottomSheet from '@components/common/ShareBottomSheet.tsx'
import DetailBanner from '@components/detailBanner'
import DetailInfo from '@components/detailInfo'
import PoolStatistic from '@components/detailToken/PoolStatistic.tsx'
import TokenStatistic from '@components/detailToken/TokenStatistic.tsx'
import OrderBook from '@components/orderBook'
import OrderForm from '@components/orderForm'
import { Dispatch, SetStateAction, memo, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import NewDetailStatistic from '../detailStatistic/NewDetailStatistic'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import DetailListIcon from '@components/detailListIcon/index.tsx'
import { UITab } from '@/types/uiTabs.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { useSearchParams } from 'react-router-dom'
import { TAB_AI } from '@pages/detail'

// export const EVENT_MESSAGE_FAVORITE = 'EVENT_MESSAGE_FAVORITE'

interface ShareBottomProps {
  shareTitle: string
  tokenData: TokenDetail
  page: string
  openShareBottomSheet: boolean
  tokenStatistic: TokenMarketStats
  setOpenShareBottomSheet: Dispatch<SetStateAction<boolean>>
  tab: string
}

const ShareBottom = memo(
  ({
    page,
    tokenData,
    shareTitle,
    tokenStatistic,
    openShareBottomSheet,
    setOpenShareBottomSheet,
    tab,
  }: ShareBottomProps) => {
    const { t } = useTranslation()
    const tokenPortrait = useTokenPortrait(tokenData?.address, tokenData?.chainId)
    const activeWallet = useSelector(_activeWallet)

    const { data } = useUserReferralSnapshot()

    const referralCode = useMemo(() => {
      if (data?.referralSnapshot?.user?.invitationCode) {
        return `/@${data?.referralSnapshot?.user?.invitationCode}`
      }
      return ''
    }, [data])
    const currentUrl = useMemo(() => window.location.href, [])

    const isXstockPath = useIsXStockPath()
    const navTabs = useMemo(() => {
      const tabs: UITab[] = [
        {
          value: 'trading',
          label: t('detail.tabs.trading'),
        },
        {
          value: 'info',
          label: t('detail.tabs.information'),
        },
      ]
      if (isXstockPath) return tabs
      return tabs.concat([
        {
          value: TAB_AI,
          label: t('detail.tabs.aiAnalysis'),
        },
      ])
    }, [t, isXstockPath])

    const [searchParams, setSearchParams] = useSearchParams()
    const [currentNavTab, setCurrentNavTab] = useState<string>(tab || searchParams.get('page') || navTabs[0].value)

    const handleChangeNavTab = (tab: string) => {
      setCurrentNavTab(tab)
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('page', tab)
        return newParams
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
      handleChangeNavTab(tab)
    }, [tab])

    return (
      <ShareBottomSheet
        open={openShareBottomSheet}
        setOpen={setOpenShareBottomSheet}
        classDrawerContent="max-h-[90vh]"
        title={t('shareBottomSheet.title')}
        classContent=" max-h-[773px]"
        classNameWrapper="classNameWrapper"
        fileName={
          page === 'trading'
            ? `${tokenData?.symbol} - Trading`
            : page === 'info'
              ? `${tokenData?.symbol} - Info`
              : `${tokenData?.symbol} - AI`
        }
        text={shareTitle}
        url={referralCode ? `${currentUrl}${referralCode}` : currentUrl}
      >
        <div className="relative">
          <div className="sticky top-0 z-20 bg-[#0A0A0A]">
            {/*<DetailHeader tokenData={tokenData} />*/}
            <div className="flex items-center justify-between w-full pt-3 border-b-[0.6px] border-b-[#25242b]">
              <MovingLineTabs
                tabs={navTabs}
                defaultTab={currentNavTab}
                onTabChange={handleChangeNavTab}
                containerClassName="bg-[none] after:hidden"
                tabsClassName="w-full"
              />
              <DetailListIcon tokenData={tokenData} currentNavTab={tab} />
            </div>
          </div>
          <div className="bg-[#111111] w-full max-h-[45vh]">
            {page === 'trading' && (
              <div className="pb-2 overflow-hidden w-full! max-w-[350px] md:max-w-[450px]">
                <DetailInfo
                  tokenData={tokenData}
                  tokenPortrait={tokenPortrait}
                  classNameLeftSide="max-w-[calc(100%-90px)] overflow-x-hidden"
                  classNameRightSide="gap-2 sm:gap-4"
                  avatarUrl={tokenData?.info?.avatarUrl ? `${tokenData?.info?.avatarUrl}?t=` + `${Date.now()}` : ''}
                  crossOrigin
                />
                <Chart />
                {activeWallet?.isConnected && <NewDetailStatistic />}
                <div className="relative mt-2 flex gap-2.5 px-2">
                  <OrderBook tokenDetail={tokenData} />
                  <OrderForm tokenDetail={tokenData} />
                </div>
              </div>
            )}
            {page === 'info' && (
              <div className="pb-2.5 w-full">
                <DetailBanner tokenData={tokenData as TokenDetailCore} />
                <div className="px-2.5">
                  <TokenStatistic tokenData={tokenData as TokenDetailCore} tokenStatistic={tokenStatistic} />
                  <PoolStatistic tokenData={tokenData as TokenDetailCore} />
                </div>
              </div>
            )}
            {page === 'AI' && tokenData?.address && (
              <div className="px-2.5 pb-2.5 w-full">
                <OnChainAnalytics address={tokenData?.address} />
                <OnChainTextAnalysis tokenAddress={tokenData?.address} />
              </div>
            )}
          </div>
        </div>
      </ShareBottomSheet>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.openShareBottomSheet === nextProps.openShareBottomSheet &&
      prevProps.page === nextProps.page &&
      prevProps.shareTitle === nextProps.shareTitle &&
      prevProps.tokenData?.address === nextProps.tokenData?.address &&
      prevProps.tokenData?.symbol === nextProps.tokenData?.symbol &&
      prevProps.tokenStatistic === nextProps.tokenStatistic &&
      prevProps.setOpenShareBottomSheet === nextProps.setOpenShareBottomSheet
    )
  },
)

ShareBottom.displayName = 'ShareBottom'

export default ShareBottom
