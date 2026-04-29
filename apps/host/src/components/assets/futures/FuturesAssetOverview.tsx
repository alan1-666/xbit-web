import { symbolDexClient } from '@/lib/gql/apollo-client'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { UserPositionState, setOneDayChange } from '@/redux/modules/userPosition.Slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { GetUserPrevDayBalance } from '@/services/assets.service'
import { loadUserPosition } from '@/utils/indexedDB/userPositionDB'
import { useLazyQuery } from '@apollo/client'
import { ReactNode, useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { FuturesAssetBalanceView } from './FuturesAssetBalanceView'
import { usePortfolioData } from '@/hooks/hyperliquid/usePortfolioData'
export interface AssetOverviewProps {
  hideBalance: boolean
  setHideBalance: (value: boolean) => void
  walletName?: ReactNode
  futuresBalance: number
}

export interface ICurrentAmount {
  balance: number
  oneDayChange: number
  oneDayPercentChange: number
}

export const FuturesAssetOverview = (props: AssetOverviewProps) => {
  const { hideBalance, setHideBalance, walletName, futuresBalance } = props
  const dispatch = useAppDispatch()
  const { balance, oneDayChange, hasData } = useAppSelector<RootState, UserPositionState>((state) => state.userPosition)
  const [currentAmount, setCurrentAmount] = useState<ICurrentAmount | undefined>(undefined)
  const activeWallet = useSelector(_activeWallet)
  const { weekData } = usePortfolioData()
  const [isLoading, setIsLoading] = useState(true)
  const futuresValueHistory = useMemo(() => {
    const accountValueHistory = weekData?.accountValueHistory
    // 规则 如第一个值不等于0 说明账户已满一周 则取第一个值 否则取最新不等于0值
    const accountValue = accountValueHistory?.[0]?.[1] !== '0.0' ? Number(accountValueHistory?.[0]?.[1]) : Number(accountValueHistory?.[1]?.[1]) || 0
    const timeValue = accountValueHistory?.[0]?.[1] !== '0.0' ? Number(accountValueHistory?.[0]?.[0]) : Number(accountValueHistory?.[1]?.[0]) || 0
    return {
      changeAmount: 0,
      changePercentage: 0,
      timestamp: timeValue,
      price: accountValue,
    }

  }, [weekData])
  const [getUserPrevDayBalanceData, { data, loading }] = useLazyQuery(GetUserPrevDayBalance, {
    client: symbolDexClient,
    fetchPolicy: 'cache-and-network',
  })


  const handleFetch = () => {
    getUserPrevDayBalanceData({
      variables: {
        input: {
          walletAddress: activeWallet?.walletAddress,
        },
      },
    })
  }

  useEffect(() => {
    // if (data?.getUserPrevDayBalance) {
    //   const { Balance } = data.getUserPrevDayBalance
    //   dispatch(setOneDayChange({ oneDayChange: Balance }))
    // }
    if (futuresValueHistory && futuresValueHistory?.price > 0) {
        const futuresValueHistoryPrice = Number(futuresValueHistory?.price).toFixed(2)
        const oneDayChange = (Number(futuresBalance) - Number(futuresValueHistoryPrice)).toFixed(2)
        dispatch(setOneDayChange({ oneDayChange: Number(oneDayChange) }))
    }
    else {
      console.log('futuresValueHistoryPrice111', futuresValueHistory)
      dispatch(setOneDayChange({ oneDayChange: 0 }))
    }

  }, [futuresValueHistory, dispatch, futuresBalance])

  useEffect(() => {

    if (Number(futuresBalance) > 0 || futuresValueHistory?.price > 0) {
      if (Number(oneDayChange) === 0) {
        setCurrentAmount({
          balance: Number(futuresBalance),
          oneDayChange,
          oneDayPercentChange: 0,
        })
        setIsLoading(false)
        return
      }
      const totalPrice = Number(futuresValueHistory?.price > 0 ? futuresValueHistory?.price : Number(futuresBalance))
      const oneDayPercentChange = ((Number(futuresBalance) - totalPrice) * 100) / totalPrice
      setCurrentAmount({
        balance: Number(futuresBalance),
        oneDayChange,
        oneDayPercentChange,
      })
      setTimeout(() => {
        setIsLoading(false)
      }, 300);

    }

    if (Number(futuresBalance) === 0 && Number(oneDayChange) === 0) {
      setCurrentAmount({
        balance: 0,
        oneDayChange: 0,
        oneDayPercentChange: 0,
      })
      setIsLoading(false)
    }

    // setIsLoading(false)

  }, [futuresBalance, oneDayChange, futuresValueHistory])

  useEffect(() => {
    const initializeFromCache = async () => {
      if (!activeWallet?.walletAddress) return

      try {
        const cacheLoaded = await loadUserPosition()

        if (cacheLoaded && cacheLoaded.oneDayChange) {
          dispatch(
            setOneDayChange({
              oneDayChange: cacheLoaded.oneDayChange,
            }),
          )
        }

        handleFetch()
      } catch (error) {
        console.error('Error loading cache:', error)
        handleFetch()
      }
    }

    initializeFromCache()
  }, [activeWallet?.walletAddress, dispatch])

  return (
    <>
      <div className="flex items-end mb-[calc(1rem*(14/16))] px-[10px]">
        <FuturesAssetBalanceView
          hideBalance={hideBalance}
          toggleHideBalance={() => setHideBalance(!hideBalance)}
          // futuresValueHistory={futuresValueHistory}
          currentAmount={currentAmount}
          timeRange={'1day'}
          walletName={walletName}
          isLoading={isLoading}
        />
      </div>
    </>
  )
}
