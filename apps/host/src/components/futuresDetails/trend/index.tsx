import Statistic from '@/components/futuresDetails/trend/Statistic'
import { Button } from '@/components/ui/button'
import { APP_PATH } from '@/lib/constant'
import ls from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs.ts'
import Container from '@components/common/Container.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { OrderContractState, OrderSide } from '@components/futuresDetails/trade/type.order'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateAlertDrawer from '../allAlerts/CreateAlertDrawer'
import Chart from '../chart'
import LatestTransaction from './latest-transaction'
import OrderBook from './order-book'
import { useTranslation } from 'react-i18next'
import { usePreference } from '@/hooks/usePreference'

interface TrendPageProps {
  baseCoin: string
  isActive?: boolean
  onNavigateToTrade?: () => void
}

const TrendPage = memo(
  ({ baseCoin, onNavigateToTrade, isActive }: TrendPageProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
    const scrollElement = useRef<HTMLDivElement>(null)

    const { preference } = usePreference()
    const priceChangeColor = preference?.priceChangeColor || 'normal'
    const bgMultiBuy =
      priceChangeColor === 'normal' ? 'bg-[#00CE89] shadow-multi-green' : 'bg-[#EA3B4F] shadow-multi-red'
    const bgMultiSell =
      priceChangeColor === 'normal' ? 'bg-[#EA3B4F] shadow-multi-red' : 'bg-[#00CE89] shadow-multi-green'

    const currentListTabs: UITab[] = useMemo(() => {
      if (!isActive) return []

      return [
        {
          value: 'currentCommission',
          label: t('futuresDetails.tabs.orderBook.title'),
        },
        {
          value: 'myPositions',
          label: t('futuresDetails.tabs.latestTransactions'),
        },
      ]
    }, [isActive])

    const [currentTab, setCurrentTab] = useState<string>(() =>
      isActive ? currentListTabs[0]?.value || 'currentCommission' : 'currentCommission',
    )
    const [openAlert, setOpenAlert] = useState(false)

    const handleChangeTab = useCallback(
      (tab: string) => {
        if (!isActive) return
        setCurrentTab(tab)
      },
      [isActive],
    )

    const handleOpenAlerts = useCallback(() => {
      if (!isActive) return

      const isFirst = ls.get('is_first_open_alert')
      if (!isFirst) {
        setOpenAlert(true)
        ls.set('is_first_open_alert', true)
        return
      }
      navigate(APP_PATH.ALL_ALERTS)
    }, [navigate, isActive])

    const handleTradeAction = useCallback(
      (side: OrderSide) => {
        if (!isActive) return

        if (onNavigateToTrade) {
          onNavigateToTrade()
        } else {
          navigate(APP_PATH.FUTURES + '/' + baseCoin)
        }
        dispatch(
          setOrderInfo({
            ...orderInfo,
            side,
          }),
        )
      },
      [onNavigateToTrade, navigate, baseCoin, dispatch, orderInfo, isActive],
    )

    return (
      <div className="relative flex flex-col min-h-full pt-2">
        <div className="flex-1 h-full" ref={scrollElement}>
          {isActive && (
            <Container>
              <Statistic />
            </Container>
          )}

          <Chart baseCoin={baseCoin} isTrendPage={true} />

          {/* {isActive && ( */}
          <>
            <div className="sticky top-0 z-[5] bg-[#121214]">
              <MovingLineTabs
                tabs={currentListTabs}
                onTabChange={handleChangeTab}
                defaultTab={currentTab}
                containerClassName="w-full mb-[14px] bg-[none] after:hidden"
                tabsClassName="w-full "
              />
            </div>

            <div className="pb-[250px] min-h-[500px]">
              <div className={cn(currentListTabs[0]?.value === currentTab ? 'block' : 'hidden')}>
                <OrderBook isActive={currentListTabs[0]?.value === currentTab} />
              </div>

              <div className={cn(currentListTabs[1]?.value === currentTab ? 'block' : 'hidden')}>
                <LatestTransaction
                  isActive={currentListTabs[1]?.value === currentTab}
                  scrollElement={scrollElement.current}
                />
              </div>
            </div>
          </>
          {/* )} */}
        </div>

        {/* <div className="fixed bottom-[70px] left-0 right-0 z-5 w-full pb-6 px-3 bg-[#121214] border-t border-[#ECECED14] pt-2.5 max-w-[768px] mx-auto">
          <div className="flex flex-row justify-center max-w-md mx-auto gap-2">
            <Button
              type="submit"
              className={cn('w-full rounded-[50px] h-[calc(1rem*(32/16))] font-bold text-[#fff] text-[16px]', `${bgMultiBuy}`)}
              onClick={() => handleTradeAction(OrderSide.buy)}
            >
              {t('futuresDetails.common.long')}
            </Button>
            <Button
              type="submit"
              className={cn('w-full rounded-[50px] h-[calc(1rem*(32/16))] font-bold text-[#fff] text-[16px]', `${bgMultiSell}`)}
              onClick={() => handleTradeAction(OrderSide.sell)}
            >
              {t('futuresDetails.common.short')}
            </Button>
          </div>
        </div> */}

        {openAlert && <CreateAlertDrawer open={openAlert} setOpen={setOpenAlert} />}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.baseCoin === nextProps.baseCoin &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.onNavigateToTrade === nextProps.onNavigateToTrade
    )
  },
)
export default TrendPage
