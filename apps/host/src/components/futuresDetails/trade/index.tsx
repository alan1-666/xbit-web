import { useUserFillsData } from '@/hooks/hyperliquid/useUserFillsData'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { selectAllPerpMeta, setSymbolListCtxs } from '@/redux/modules/futuresMeta.slice'
import { updateUserFunding } from '@/redux/modules/futuresUserInfo.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs.ts'
import Container from '@components/common/Container.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { memo, useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Chart from '../chart/index'
import CurrentOrderList from './CurrentOrderList'
import HeaderSetting from './HeaderSetting'
import LeftSetting from './LeftSetting'
import MyPositionList from './MyPositionList'
import { OpenOrdersContext } from './OpenOrdersContext'
import OrderBook from './OrderBook'
import OrderForm from './OrderForm'
import OrderHistoryList from './OrderHistoryList'
import { xOpenOrders, xPositions } from './types'
import { OrderContractState, OrderTypeEnum } from './type.order'
import SafeAreaWrapper from '@/components/common/SafeAreaWrapper'
import { useTranslation } from 'react-i18next'
import { updatePositionsFromWebData2, UserPositionState } from '@/redux/modules/userPosition.Slice'
import { isDepositSelector, futuresUserInfoActions } from '@/redux/modules/futuresUserInfo.slice'
import { useActiveAssetData } from '@/hooks/hyperliquid/useActiveAssetData'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import ButtonKlineExpand from './ButtonKlineExpand'
import { Link } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import FuturesRecordsPage from '@/components/futuresRecords/index.tsx'



interface TradePageProps {
  baseCoin: string
  isActive: boolean
  onRecordsBack: (show: boolean) => void
}

const mapHeight: Partial<Record<OrderTypeEnum, number>> = {
  [OrderTypeEnum.market]: 466,
  [OrderTypeEnum.limit]: 506,
}

export const MIN_AVAILABLE = 5
/**
 * isActive: true - Component is active and should render data
 */
const TradePage = memo(
  ({ baseCoin, isActive, onRecordsBack }: TradePageProps) => {
    const { t } = useTranslation()
    const { positions: positionsRedux } = useAppSelector<RootState, UserPositionState>(
      (state) => state.userPosition,
    )

    const { openOrders, positions, symbolListCtxs, webData2: {clearinghouseState}, withdrawable } = useWebData2()
    const { fills } = useUserFillsData()
    const allMeta = useAppSelector(selectAllPerpMeta)

    const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
    const isDeposit = useAppSelector(isDepositSelector)
    
    const [orderbookHeight, setOrderbookHeight] = useState<number>(0)
    const [showRerods, setShowRecords] = useState(false)
    
    const walletDex = useSelector(_walletDex)
    const {activeAssetData} = useActiveAssetData(orderInfo.orderCoin, walletDex.walletAddress)
    
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    useEffect(() => {
      const rawTab = query.get('tab')
      setCurrentTab(rawTab || 'position')
    }, [baseCoin])

    const currentOpenOrders = useMemo(() => {
      if (!isActive) return []
      
      return openOrders.map((item: xOpenOrders) => {
        const origSz = parseFloat(item.origSz || '0')
        const sz = parseFloat(item.sz || '0')

        if (origSz === 0) {
          const filterFills = fills.filter((citem: any) => citem.oid === item.oid)
          const totalFilled = filterFills.reduce((acc, citem) => {
            return acc + parseFloat(citem.sz || '0')
          }, 0)

          const positionItem = positions.find((citem: xPositions) => citem.coin === item.coin)
          const newOrigSz = positionItem?.szi ?? item.origSz

          return {
            ...item,
            origSz_1: newOrigSz,
            completedSz: totalFilled,
          }
        } else {
          return {
            ...item,
            origSz_1: origSz,
            completedSz: origSz - sz,
          }
        }
      })
    }, [fills, openOrders, positions, isActive])

    const currentListTabs: UITab[] = useMemo(() => {
      if (!isActive) return []
      
      return [
        {
          value: 'position',
          label: t('futuresDetails.tabs.myPosition') + `(${positions.length})`,
        },
        {
          value: 'order',
          label: t('futuresDetails.tabs.currentOrder') + `(${currentOpenOrders.length})`,
        },
        
        {
          value: 'history',
          label: t('futuresDetails.tabs.tradeHistory'),
        },
      ]
    }, [currentOpenOrders.length, positions.length, isActive])

    const query = useMemo(() => {
      if (!isActive) return new URLSearchParams()
      return new URLSearchParams(location.search)
    }, [location.search, isActive])

    const rawTab = query.get('tab')
    const validTabValues = useMemo(() => {
      if (!isActive) return []
      return currentListTabs.map((tab) => tab.value)
    }, [currentListTabs, isActive])

    const initialTab = validTabValues.includes(rawTab || '') ? rawTab! : currentListTabs[0]?.value || 'position'

    const [currentTab, setCurrentTab] = useState<string>(initialTab)
  

    const handleChangeTab = useCallback((tab: string) => {
      if (!isActive) return

      setCurrentTab(tab)
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('tab', tab)
      navigate({ search: searchParams.toString() }, { replace: true })
    }, [isActive, location.search, navigate])

    const handleRenderTab = useCallback(() => {
      if (!isActive) return null

      return (
        <>
          <div style={{ display: currentTab === currentListTabs[0]?.value ? 'block' : 'none' }}>
            <MyPositionList baseCoin={baseCoin} positions={positions} setCurrentTab={handleChangeTab}/>
          </div>
          <div style={{ display: currentTab === currentListTabs[1]?.value ? 'block' : 'none' }}>
            <CurrentOrderList baseCoin={baseCoin} orders={currentOpenOrders} />
          </div>
          <div style={{ display: currentTab === currentListTabs[2]?.value ? 'block' : 'none' }}>
            <OrderHistoryList baseCoin={baseCoin} isActiveCardList={currentTab === currentListTabs[2]?.value} />
          </div>
        </>
      )
    }, [isActive, currentTab, currentListTabs, baseCoin, positions, currentOpenOrders])
        


    useEffect(() => {
      if (isActive) {
        dispatch(setSymbolListCtxs(symbolListCtxs))
      }
    }, [symbolListCtxs, dispatch, isActive])

    useEffect(() => {
      if (isActive) {
        const available = activeAssetData?.availableToTrade
        const minAvailable = Math.min(Number(available?.[0] || 0), Number(available?.[1] || 0))
        if (minAvailable >= MIN_AVAILABLE && !isDeposit) {
          dispatch(
            futuresUserInfoActions.updateDepositStatus(true)
          )
        }
        dispatch(updateUserFunding({ available: available, withdrawable: withdrawable }))
      }
    }, [activeAssetData, dispatch, isActive, withdrawable, isDeposit])

   

    useEffect(() => {
      let containerHeight = mapHeight[orderInfo.type] ?? 390 
      const tpSlHeight = orderInfo.isShowTPSl ? 82 : 0
      containerHeight = containerHeight + tpSlHeight

      setOrderbookHeight(containerHeight)

    }, [orderInfo.type, orderInfo.isShowTPSl])

    useEffect(() => {
      if (clearinghouseState && positions.length !== positionsRedux.length) {
        dispatch(updatePositionsFromWebData2(positions))
      }
    }, [positions, clearinghouseState])

    useEffect(() => {
      const element = document.getElementById('APP_FOOTER');
      const top = document.getElementById('futures-main-header');
      if (element) {
        element.style.display =  showRerods ? 'none' : 'block';
      }
      if (top) {
        top.style.display =  showRerods ? 'none' : 'block';
      }
  

    }, [showRerods])

    return (
      <OpenOrdersContext.Provider value={currentOpenOrders}>

        <Chart baseCoin={baseCoin} disabledExpand={true} isTrendPage={false} positions={positions} openOrders={openOrders}/>

        {isActive && (
          <>
            <Container
              className="pt-[14px] rounded-tl-[8px] rounded-tr-[8px] pb-3 pt-0"
            >
           
              <div 
                className="flex gap-3 min-h-[360px] pt-2"
                style={{height: `${orderbookHeight}px`}}
              >
                <div className="w-[37%] flex flex-col">
                  <ButtonKlineExpand/>
                  <HeaderSetting/>
                  <OrderBook containerHeight={orderbookHeight}/>
                  <LeftSetting />
                </div>
                <OrderForm baseCoin={baseCoin} containerClassName="w-[63%]" positions={positions} />
              </div>
            </Container>
            
            <div className="relative flex justify-between items-center gap-1 pr-2.5 ">
              <MovingLineTabs
                tabs={currentListTabs}
                onTabChange={handleChangeTab}
                defaultTab={initialTab}
                showContainerBottomLine={false}
                containerClassName="bg-[none] flex-1  mb-[10px]  white-gradient-border-b"
                tabsClassName="w-full"
                tabsListClassName="w-full max-w-[100vw] overflow-x-auto justify-start _hidescrollbar "
              />
              {/* <Link className="text-[#FACC14] mt-[-8px] cursor-pointer" to={APP_PATH.FUTURES_RECORDS}>
                  <img src="/images/futuresDetail/record-icon.svg" alt='record-icon' />
              </Link>
 */}
               
              <div className="text-[#FACC14] mt-[-8px] cursor-pointer" onClick={() => {
                setShowRecords(true)
              }} >
                  <img src="/images/futuresDetail/record-icon.svg" alt='record-icon' />
              </div>
            </div>
            {showRerods && <FuturesRecordsPage onBack={() => setShowRecords(false)}/>}


            <SafeAreaWrapper>
                {handleRenderTab()}
            </SafeAreaWrapper>
          </>
        )}
      </OpenOrdersContext.Provider>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.baseCoin === nextProps.baseCoin &&
      prevProps.isActive === nextProps.isActive
    )
  },
)

export default TradePage
