import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import dayjs from 'dayjs'
import { RootState, useAppDispatch } from '@/redux/store'
import useGetHolderChart from '@hooks/useGetHolderChart.ts'
import useGetMemeTokenInfo from '@hooks/useGetMemeTokenInfo.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import {
  // resetDataHolderTab,
  setAvgHolding,
  setAvgHoldingChart, setBotPct, setBundlePct,
  setHolderCount,
  setHolderCountChart, setInActivePct,
  setInsiderChart,
  setInsiderPct, setNewWalletPct, setPhishingPct,
  setTop10Chart,
  setTop10Holder,
  TradeTabState,
} from '@/redux/modules/tradeTab.slice.ts'
import { getChainId } from '@/lib/blockchain'

type TabsInformationSubscriptionProps = {
  totalSupply?: string
  createdTime?: string
}

const TabsInformationSubscription = ({ totalSupply, createdTime }: TabsInformationSubscriptionProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()

  const { totalSupply: totalSupplyFromStore, currentDetailTab } = useSelector(
    (state: RootState) => state.tradeTab as TradeTabState,
  )
  const activeWallet = useSelector(_activeWallet)
  const activeChain = activeWallet?.chainType || 'sol'
  const chainId = getChainId(activeChain)

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  // Fetch API and MQTT data
  const { data: apiData, refetch } = useGetHolderChart({ token: tokenAddress, chainId })
  const dataMqtt = useGetMemeTokenInfo({ token: tokenAddress, createdTime, totalSupply })

  // Calculate derived values with priority: MQTT > API > fallback
  const holderCount = useMemo(() => {
    if (dataMqtt?.hc) return Number(dataMqtt.hc)
    return apiData?.getHolderChart?.numberOfHolderHistory?.at(-1) ?? 0
  }, [dataMqtt?.hc, apiData])

  const top10 = useMemo(() => {
    if (dataMqtt?.top10HolderPercentage) return Number(dataMqtt?.top10HolderPercentage)
    const top10History = apiData?.getHolderChart?.top10HolderHistory?.at(-1) ?? 0
    return top10History * 100
  }, [dataMqtt?.top10HolderPercentage, apiData])

  const avgHolding = useMemo(() => {
    const supply = totalSupplyFromStore && totalSupplyFromStore > 0 ? totalSupplyFromStore : totalSupply
    if (holderCount && holderCount > 0) return Number(supply) / holderCount
    return 0
  }, [holderCount, totalSupply, totalSupplyFromStore])

  const insiderPct = useMemo(() => {
    if (dataMqtt?.i && totalSupply && +totalSupply !== 0) return Number(dataMqtt.i) / +totalSupply
    if (dataMqtt?.insiderTradingPercentage) return Number(dataMqtt.insiderTradingPercentage)
    return apiData?.getHolderChart?.insiderHoldingHistory?.at(-1) ?? 0
  }, [dataMqtt, totalSupply, apiData])

  // Dispatch values when they change
  useEffect(() => {
    if (apiData?.getHolderChart) {
      dispatch(setHolderCount(apiData?.getHolderChart?.numberOfHolderHistory?.at(-1)))
      dispatch(setTop10Holder(Number(apiData?.getHolderChart?.top10HolderHistory?.at(-1)) * 100))
      dispatch(setAvgHolding(apiData?.getHolderChart?.averageHoldingPerWalletHistory?.at(-1)))
      dispatch(setInsiderPct(apiData?.getHolderChart?.insiderHoldingHistory?.at(-1)))
      dispatch(setHolderCountChart(apiData?.getHolderChart?.numberOfHolderHistory))
      dispatch(setPhishingPct(apiData?.getHolderChart?.phishingWalletHistory?.at(-1)))
      dispatch(setBundlePct(apiData?.getHolderChart?.bundleHistory?.at(-1)))
      dispatch(setBotPct(apiData?.getHolderChart?.botHistory?.at(-1)))
      dispatch(setNewWalletPct(apiData?.getHolderChart?.newWalletHistory?.at(-1)))
      dispatch(setInActivePct(apiData?.getHolderChart?.inactiveWalletHistory?.at(-1)))
      //multiple 100
      const listTop10FromAPI = apiData?.getHolderChart?.top10HolderHistory ?? []
      dispatch(setTop10Chart(listTop10FromAPI?.map((item) => item * 100)))
      dispatch(setAvgHoldingChart(apiData?.getHolderChart?.averageHoldingPerWalletHistory))
      dispatch(setInsiderChart(apiData?.getHolderChart?.insiderHoldingHistory))
    }
  }, [apiData])

  useEffect(() => {
    const reFetchHoldersChart = async () => {
      try {
        if (currentDetailTab !== 'holders') return
        refetch().catch(console.error)
      } catch (error) {
        console.error(error)
      }
    }

    // Run immediately and then every 3 seconds
    const intervalId = setInterval(reFetchHoldersChart, 3000)

    return () => clearInterval(intervalId)
  }, [currentDetailTab])

  useEffect(() => {
    if (holderCount !== undefined) {
      dispatch(setHolderCount(holderCount))
    }
  }, [holderCount, dispatch])

  useEffect(() => {
    if (top10 !== undefined) {
      dispatch(setTop10Holder(top10))
    }
  }, [])

  useEffect(() => {
    if (avgHolding !== undefined) {
      dispatch(setAvgHolding(avgHolding))
    }
  }, [avgHolding, dispatch])

  useEffect(() => {
    if (insiderPct !== undefined) {
      dispatch(setInsiderPct(insiderPct))

      // Alert when insider > 100%
      if (insiderPct > 1) {
        Sentry.captureException(`Token ${tokenAddress} has insider%: ${insiderPct * 100} at ${dayjs().toISOString()}`)
      }
    }
  }, [insiderPct, dispatch, tokenAddress])

  // clear data
  // useEffect(() => {
  //   dispatch(resetDataHolderTab())
  // }, [tokenAddress])
  // useEffect(() => {
  //   return () => {
  //     dispatch(resetDataHolderTab())
  //   }
  // }, [])

  return null
}

export default TabsInformationSubscription
