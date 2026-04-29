import ChartHead from '@/components/chart/ChartHead'
import TvChart from '@/components/chart/TvChart'
import { IntervalItem, TradingViewChartTypeItem, intervalMap, tradingviewChartTypeList } from '@/datafeeds/index'
// import { useChartRef } from '@/hooks/useChartRef'
import { usePageType } from '@/hooks/usePageType'
import { usePreference } from '@/hooks/usePreference'
import { chartActions } from '@/redux/modules/chart.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import TradingViewWidget from './TradingViewWidget'
import { KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import { ALL_USER_TYPES } from './TradingViewChart'

const STORAGE_KEY = 'chart-selected-user-types'
const DEFAULT_SELECTED_USER_TYPES = new Set([KlineStickerUserType.User, KlineStickerUserType.Dev])

const loadSelectedUserTypesFromStorage = (): Set<KlineStickerUserType | 'all'> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      return new Set(
        parsed.filter(
          (type): type is KlineStickerUserType | 'all' =>
            type === 'all' || Object.values(KlineStickerUserType).includes(type as KlineStickerUserType),
        ),
      )
    }
  } catch (error) {
    console.error('Error loading selected user types from localStorage:', error)
  }
  return new Set(DEFAULT_SELECTED_USER_TYPES)
}

const Chart = () => {
  const env = import.meta.env.VITE_STAGE
  const defaultChartTypeList = tradingviewChartTypeList.filter((item) => {
    return item.value === 1 || item.value === 2
  })
  const params = useParams()
  // const chartRef = useChartRef()
  const tvChartRef = useRef(null)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { i18n } = useTranslation()
  const i18Lang = i18n.language || 'en'
  const { preference } = usePreference()
  const [showIntervalMapList, setShowIntervalMapList] = useState<IntervalItem[]>(intervalMap)
  const [showChartTypeList, setShowChartTypeList] = useState<TradingViewChartTypeItem[]>(defaultChartTypeList)
  const dispatch = useAppDispatch()
  const pageType = usePageType()
  const [selectedUserTypes, setSelectedUserTypes] = useState<Set<KlineStickerUserType | 'all'>>(
    loadSelectedUserTypesFromStorage,
  )
  const { period, ohlcType, chartType, token, priceChangeColor, lang, symbol } = useAppSelector(
    (state: RootState) => state.chart[pageType],
  )
  const chainId = useActiveChainId()
  const chain = params?.chain

  useEffect(() => {
    const newToken = params?.address || searchParams.get('token') || ''
    if (newToken !== token) {
      dispatch(chartActions.updateTokenWithType({ type: pageType, token: newToken }))
    }
    const newSymbol = location.state && (location.state as any).symbol ? (location.state as any).symbol : ''
    if (newSymbol !== symbol) {
      dispatch(chartActions.updateSymbolWithType({ type: pageType, symbol: newSymbol }))
    }
    const newLang = searchParams.get('lang') || i18Lang
    if (newLang !== lang) {
      dispatch(chartActions.updateLangWithType({ type: pageType, lang: newLang }))
    }
  }, [params, searchParams, token, lang, pageType, dispatch, i18Lang, location, symbol])

  useEffect(() => {
    const newPriceChangeColor = preference?.priceChangeColor || 'normal'
    if (newPriceChangeColor !== priceChangeColor) {
      dispatch(chartActions.updatePriceChangeColorWithType({ type: pageType, priceChangeColor: newPriceChangeColor }))
    }
  }, [preference?.priceChangeColor, priceChangeColor, pageType, dispatch])

  const handlePeriodChange = (value: string) => {
    dispatch(chartActions.updatePeriodWithType({ type: pageType, period: value }))
  }

  const handleChartTypeChange = (value: number) => {
    dispatch(chartActions.updateChartTypeWithType({ type: pageType, chartType: value }))
    // 2: line style
    if (value !== 2) {
      const newChartTypeList = tradingviewChartTypeList.filter((item) => {
        return item.value === value || item.value === 2
      })
      setShowChartTypeList(newChartTypeList)
    }
  }

  const handleShowPeriodListChange = (value: IntervalItem[]) => {
    setShowIntervalMapList(value)
  }

  const handleIndictorClick = () => {
    // chartRef?.tvIndictor()
    tvChartRef.current?.tvIndictor()
  }

  const handleSettingClick = () => {
    // chartRef?.tvSetting()
    tvChartRef.current?.tvSetting()
  }

  return (
    <div id="index-chart" className="h-full relative bg-[#111111]">
      <div className="">
        {env === '' ? (
          <TradingViewWidget />
        ) : (
          <>
            <ChartHead
              defaultPeriod={period}
              showPeriodList={showIntervalMapList}
              onShowPeriodListChange={handleShowPeriodListChange}
              onPeriodChange={handlePeriodChange}
              defaultChartType={chartType}
              chartTypeList={showChartTypeList}
              typeOHLC={ohlcType}
              setTypeOHLC={
                ((typeOrUpdater: 'price' | 'marketCap' | ((prev: 'price' | 'marketCap') => 'price' | 'marketCap')) => {
                  const currentPageType = pageType
                  const type = typeof typeOrUpdater === 'function' ? typeOrUpdater(ohlcType) : typeOrUpdater
                  dispatch(chartActions.updateOHLCTypeWithType({ type: currentPageType, ohlcType: type }))
                }) as React.Dispatch<React.SetStateAction<'price' | 'marketCap'>>
              }
              onChartTypeChange={handleChartTypeChange}
              onIndictorClick={handleIndictorClick}
              onSettingClick={handleSettingClick}
              selectedUserTypes={selectedUserTypes}
              onToggleUserType={(userType: KlineStickerUserType | 'all') => {
                setSelectedUserTypes((prev) => {
                  const newSet = new Set(prev)
                  if (userType === 'all') {
                    const allSelected = newSet.has('all') && ALL_USER_TYPES.every((type) => newSet.has(type))

                    if (allSelected) {
                      return new Set()
                    } else {
                      return new Set(['all', ...ALL_USER_TYPES])
                    }
                  } else {
                    if (newSet.has(userType)) {
                      newSet.delete(userType)
                    } else {
                      newSet.add(userType)
                    }

                    const allTypesSelected = ALL_USER_TYPES.every((type) => newSet.has(type))
                    if (allTypesSelected) {
                      newSet.add('all')
                    } else {
                      newSet.delete('all')
                    }

                    return newSet
                  }
                })
              }}
            />
            <TvChart
              ref={tvChartRef}
              chainId={chainId as number}
              token={token}
              symbol={symbol}
              period={period}
              chartType={chartType}
              typeOHLC={ohlcType}
              chartColor={priceChangeColor}
              lang={lang}
              selectedUserTypes={selectedUserTypes}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Chart
