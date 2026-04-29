import { defaultSymbolData } from '@/hooks/hyperliquid/useActiveAssetCtx'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import useSymbolListSubscription, { useMergedData } from '@/pages/futures-market/hooks/useSymbolListSubscription'
import {
  futuresTradePreferencesActions,
  selectFuturesTradePreferences,
} from '@/redux/modules/futuresTradePreferences.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { saveSymbolSnapshot } from '@/utils/indexedDB/marketDB'
import { loadSymbolListSnapshot, saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import React, { useEffect, useState } from 'react'
import CryptoList from './crypto-list'
import { setData, SymbolListState } from '@/redux/modules/symbolList.slide'

export interface ISymbolList {
  changPxPercent: number
  currentPrice: number
  marketCap: number
  maxLeverage: number
  symbol: string
  volume: string
}

const ListCoinCrypto = () => {
  const { lists } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)

  const { volume: symbolList } = lists
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useAppDispatch()
  const { allSymbols } = useAppSelector(selectFuturesTradePreferences)

  const { symbolData } = useSymbolListSubscription({
    shouldSkip: false,
  })

  const currentData = useMergedData(symbolList?.slice(0, 10) || [], symbolData)

  const loadSymbolListFromCache = async () => {
    try {
      const cachedData = await loadSymbolListSnapshot('volume')
      return cachedData?.list
    } catch (error) {
      console.warn(error)
    }
  }

  const handleGetSymbolList = async () => {
    try {
      const input = {
        condition: 'volume',
      }
      const { data, loading } = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: { input },
      })
      if (allSymbols.length === 0)
        dispatch(futuresTradePreferencesActions.updateAllSymbols(data?.getSymbolList?.list || []))

      await saveSymbolListSnapshot('volume', {
        list: data?.getSymbolList?.list,
        lastUpdated: Date.now(),
        condition: 'volume',
      })
      dispatch(setData({ condition: 'volume', data: data?.getSymbolList?.list }))
      setIsLoading(loading)
    } catch (error) {
      console.error('Error fetching symbol list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeSymbolList = async () => {
      if (symbolList?.length !== 0) {
        setIsLoading(false)
        return
      }
      const cacheLoaded = await loadSymbolListFromCache()

      if (!cacheLoaded?.length) {
        await handleGetSymbolList()
      } else {
        dispatch(setData({ condition: 'volume', data: cacheLoaded as ISymbolList[] }))
        setIsLoading(false)
      }
    }

    initializeSymbolList()
  }, [])

  useEffect(() => {
    if (!symbolData?.length) return
    symbolData.forEach((item: any) => {
      saveSymbolSnapshot(item.symbol, {
        ...defaultSymbolData,
        oraclePx: item.currentPrice?.toString(),
        prevDayPx: item.prevDayPx?.toString(),
      })
    })
  }, [symbolData])

  return (
    <div className="overflow-hidden">
      <CryptoList initialData={currentData} isLoading={isLoading} total={symbolList.length} />
    </div>
  )
}

export default React.memo(ListCoinCrypto)
