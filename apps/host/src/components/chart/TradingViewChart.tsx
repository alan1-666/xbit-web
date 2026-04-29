import { KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import ChartHeadPC from '@/components/chart/ChartHeadPC'
import { useTheme } from '@/components/theme-provider.js'
import { TvConfig } from '@/datafeeds/configPC'
import { Datafeeds, IntervalItem, resolutionMap } from '@/datafeeds/index'
import { useChartMarks } from '@/hooks/chart/useChartMarks'
import { usePageType } from '@/hooks/usePageType'
import { usePreference } from '@/hooks/usePreference'
import { formatPrice, formatVolume } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { capitalizeFirstLetter } from '@/lib/utils.js'
import { chartActions } from '@/redux/modules/chart.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { chartRefRegistry, TvChartRef } from '@/services/chartRefRegistry'
import { getTokenMetadata } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums'
import { useQuery } from '@apollo/client'
import { Loading } from '@components/common/Loading.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  ThemeName,
  widget,
} from '../../../public/charting_library'
import PurchaseMarkDrawer from './purchaseMarkDrawer'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

declare global {
  interface Window {
    lastTopicMqtt?: string
  }
}
export const ALL_USER_TYPES = [
  KlineStickerUserType.Bot,
  KlineStickerUserType.Dev,
  KlineStickerUserType.Fresh,
  KlineStickerUserType.Insider,
  KlineStickerUserType.Kol,
  KlineStickerUserType.Renames,
  KlineStickerUserType.Smart,
  KlineStickerUserType.Sniper,
  KlineStickerUserType.Top10,
  KlineStickerUserType.Tracking,
  KlineStickerUserType.User,
  KlineStickerUserType.Whale,
]

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol']
  interval: ChartingLibraryWidgetOptions['interval']
  datafeedUrl: string
  libraryPath: ChartingLibraryWidgetOptions['library_path']
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
  clientId: ChartingLibraryWidgetOptions['client_id']
  userId: ChartingLibraryWidgetOptions['user_id']
  fullscreen: ChartingLibraryWidgetOptions['fullscreen']
  autosize: ChartingLibraryWidgetOptions['autosize']
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
  container: ChartingLibraryWidgetOptions['container']
}

type TvChartProps = {
  token: string
  period: string
  symbol?: string
  chainId: number
  chartType: number
  typeOHLC?: 'price' | 'marketCap'
  chartColor?: string
  lang: string
  isChartFullScreen?: boolean
  isSnapshot?: boolean
  setIsSnapshot?: (value: boolean) => void
  selectedUserTypes?: Set<KlineStickerUserType | 'all'>
  isPatch?: boolean
}

const getTimeZone = () => {
  let timezone = 'Asia/Shanghai'
  if (Intl && Intl.DateTimeFormat() && Intl.DateTimeFormat().resolvedOptions()) {
    const tempObj = Intl.DateTimeFormat().resolvedOptions()
    timezone = (tempObj && tempObj.timeZone) || 'Asia/Shanghai'
    if (timezone === 'Asia/Saigon') timezone = 'Asia/Ho_Chi_Minh'
  }
  return timezone
}

const Chart = memo(
  forwardRef(
    (
      {
        token,
        symbol,
        chainId,
        period,
        chartType,
        typeOHLC,
        chartColor,
        lang,
        isChartFullScreen,
        isSnapshot,
        setIsSnapshot,
        selectedUserTypes,
        isPatch = false,
      }: TvChartProps,
      ref,
    ) => {
      const { theme } = useTheme()
      const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>
      const tvWidgetRef = useRef<IChartingLibraryWidget>(null)
      const dispatch = useAppDispatch()
      const pageType = usePageType()
      const defaultProps: Omit<ChartContainerProps, 'container'> = {
        symbol: 'BTC/USD',
        interval: 'D' as ResolutionString,
        datafeedUrl: 'https://demo_feed.tradingview.com',
        libraryPath: '/charting_library/',
        chartsStorageUrl: 'https://saveload.tradingview.com',
        chartsStorageApiVersion: '1.1',
        clientId: 'tradingview.com',
        userId: 'public_user_id',
        fullscreen: false,
        autosize: true,
        studiesOverrides: {},
      }
      const retryCountRef = useRef(1)
      const MAX_RETRIES = 20
      const datafeedRef = useRef<Datafeeds | null>(null)
      const widgetInitializedRef = useRef(false)
      const { data, refetch, error } = useQuery(getTokenMetadata, {
        skip: !token,
        variables: { input: token, chainId: chainId },
        fetchPolicy: 'no-cache',
        client: futureClient,
      })
      const tokenMetaData = data?.getTokenMetadata
      const activeWallet = useSelector(_activeWallet)

      const [retryTrigger, setRetryTrigger] = useState(0)
      const [isLoading, setIsLoading] = useState<boolean>(false)

      useEffect(() => {
        if (error) {
          const errorCode = error?.graphQLErrors?.[0]?.extensions?.code
          if (errorCode === 'TOKEN_NOT_FOUND' && retryCountRef.current < MAX_RETRIES) {
            const delay = Math.pow(1.8, retryCountRef.current) * 1000
            console.warn(`Retrying #${retryCountRef.current + 1} in ${delay / 1000}s...`)
            const timer = setTimeout(() => {
              retryCountRef.current += 1
              refetch()
                .then((_) => {
                  setRetryTrigger((v) => v + 1)
                })
                .catch((_) => {
                  setRetryTrigger((v) => v + 1)
                })
            }, delay)
            return () => clearTimeout(timer)
          }
        }
      }, [error, retryTrigger])

      const { getMarks, handleMarkClick, isDrawerOpen, setIsDrawerOpen, selectedTrade } = useChartMarks({
        token: token,
        chainId: chainId,
        timeframe: resolutionMap[period],
        tvWidgetRef,
        selectedUserTypes,
        userAddress: activeWallet?.walletAddress || '',
      })

      function tvIndictor() {
        if (tvWidgetRef && tvWidgetRef?.current) {
          tvWidgetRef?.current?.chart().executeActionById('insertIndicator')
        }
      }

      function tvSetting() {
        if (tvWidgetRef && tvWidgetRef?.current) {
          tvWidgetRef?.current?.chart().executeActionById('chartProperties')
        }
      }

      const chartRefMethods = {
        tvIndictor,
        tvSetting,
      }

      useImperativeHandle(ref, () => chartRefMethods)

      // Register ref in registry and update store
      useEffect(() => {
        chartRefRegistry.setRef(pageType, chartRefMethods)
        dispatch(chartActions.updateChartReadyWithType({ type: pageType, isChartReady: true }))

        return () => {
          chartRefRegistry.setRef(pageType, null)
          dispatch(chartActions.updateChartReadyWithType({ type: pageType, isChartReady: false }))
        }
      }, [pageType, dispatch])

      const getSymbol = () => {
        const sym = symbolRef.current

        const symbolInfo = {
          name:
            typeOHLC === 'price'
              ? !isPatch
                ? token
                : `${token}-PATCH`
              : !isPatch
                ? `${token}-MC`
                : `${token}-MC-PATCH`,
          timezone: getTimeZone(),
          minmov: 1,
          minmov2: 0,
          pointvalue: 1,
          data_status: 'streaming',
          fractional: false,
          session: '24x7',
          has_intraday: true,
          exchange: 'XBIT.COM',
          listed_exchange: '',
          description: ``,
          hide_side_toolbar: false,
          pricescale: Math.pow(10, 10),
          ticker: 'BTC',
          address: token,
          totalSupply: 1,
          has_weekly_and_monthly: true,
          has_seconds: true,
          seconds_multipliers: [1, 30],
          supported_resolutions: ['1S', '30S', '1', '5', '15', '30', '60', '240', '1D', '1W'],
          custom_css_url: '/css/tvChart.css?v=' + Date.now(),
          chainId: chainIdRef.current,
          isPatch: isPatch,
        }

        if (sym) {
          return {
            ...symbolInfo,
            description: `${sym}/USD`,
          }
        }

        if (!tokenMetaData?.symbol) {
          return {
            ...symbolInfo,
            description: `BTC/USD`,
          }
        }
        return {
          ...symbolInfo,
          description: `${tokenMetaData?.symbol}/USD`,
        }
      }

      const getConfig = () => {
        return {
          supports_time: true,
        }
      }

      const getCatchName = (symbolInfo: any, resolution: any) => {
        const tempName = symbolInfo.description + '_#_' + resolution
        return tempName
      }

      const getTypeOHLC = () => {
        return typeOHLC
      }

      const getOnReadyChart = () => {}

      const symbolRef = useRef(symbol)
      useEffect(() => {
        symbolRef.current = symbol
      }, [symbol])

      const chainIdRef = useRef(chainId)
      useEffect(() => {
        chainIdRef.current = chainId
      }, [chainId])

      const externalInstanceRef = useRef({
        getOnReadyChart,
        getConfig,
        getSymbol,
        getCatchName,
        getTypeOHLC,
        getMarks,
      })

      useEffect(() => {
        externalInstanceRef.current.getOnReadyChart = getOnReadyChart
        externalInstanceRef.current.getConfig = getConfig
        externalInstanceRef.current.getSymbol = getSymbol
        externalInstanceRef.current.getCatchName = getCatchName
        externalInstanceRef.current.getTypeOHLC = getTypeOHLC
        externalInstanceRef.current.getMarks = getMarks
      }, [tokenMetaData, typeOHLC, token, chainId, symbol, isPatch, getMarks])

      // Initialize widget and datafeed only once when container is ready
      useEffect(() => {
        if (widgetInitializedRef.current) return
        if (!chartContainerRef.current) return

        // Create datafeed only once
        if (!datafeedRef.current) {
          datafeedRef.current = new Datafeeds(externalInstanceRef.current)
        }
        setIsLoading(true)
        if (!tokenMetaData) return

        const initialSymbol = tokenMetaData?.symbol
          ? typeOHLC === 'price'
            ? !isPatch
              ? token
              : `${token}-PATCH`
            : !isPatch
              ? `${token}-MC`
              : `${token}-MC-PATCH`
          : 'BTC/USD'

        const widgetOptions = Object.assign(
          {
            symbol: initialSymbol,
            description: tokenMetaData?.symbol ?? 'BTC/USD',
            datafeed: datafeedRef.current as any,
            interval: period as ChartingLibraryWidgetOptions['interval'],
            container: chartContainerRef.current,
            library_path: defaultProps.libraryPath as string,
            timezone: getTimeZone(),
            locale: lang,
            charts_storage_url: defaultProps.chartsStorageUrl,
            charts_storage_api_version: defaultProps.chartsStorageApiVersion,
            client_id: defaultProps.clientId,
            user_id: defaultProps.userId,
            fullscreen: defaultProps.fullscreen,
            autosize: defaultProps.autosize,
            studies_overrides: defaultProps.studiesOverrides,
            custom_css_url: '/css/tvChart.css?v=' + Date.now(),
            custom_formatters: {
              priceFormatterFactory: (symbolInfo: any) => {
                if (symbolInfo === null) {
                  return null
                }
                if (symbolInfo.name.includes('-MC')) {
                  return {
                    format: (value: any) => {
                      return value ? formatVolume(value, {}) : '--'
                    },
                  }
                }
                return {
                  format: (value: any) => {
                    return formatPrice(value, {})
                  },
                }
              },
              studyFormatterFactory: () => {
                return {
                  format: (value: any) => {
                    return formatVolume(value, {})
                  },
                }
              },
            },
            theme: capitalizeFirstLetter(theme) as ThemeName,
          },
          TvConfig(chartColor === 'inverse' ? 'rg' : 'gr'),
        ) as unknown as ChartingLibraryWidgetOptions

        const tvWidget = new widget(widgetOptions)
        tvWidget.onChartReady(() => {
          tvWidgetRef.current = tvWidget
          widgetInitializedRef.current = true
          tvWidget.chart().setChartType(chartType)
          if (tokenMetaData?.symbol) {
            const symbol =
              typeOHLC === 'price'
                ? !isPatch
                  ? token
                  : `${token}-PATCH`
                : !isPatch
                  ? `${token}-MC`
                  : `${token}-MC-PATCH`
            tvWidget.chart().setSymbol(symbol)
          }
          setIsLoading(false)

          setTimeout(() => {
            ;(tvWidgetRef.current as any)?.resize()
          }, 100)
          requestAnimationFrame(() => {
            tvWidget.subscribe('onMarkClick', handleMarkClick)
          })
        })
      }, [lang, chartColor, tokenMetaData])

      useEffect(() => {
        const isCheckExactChartPage = () => {
          const isExactChartPage = /^\/(meme|xstocks)\/[^/]+\/token\/[^/]+$/.test(location.pathname)
          if (!isExactChartPage) {
            if (widgetInitializedRef.current && tvWidgetRef.current) {
              tvWidgetRef.current.remove()
              tvWidgetRef.current = null
              widgetInitializedRef.current = false
            }
          }
        }
        return () => {
          isCheckExactChartPage()
        }
      }, [location.pathname])

      useEffect(() => {
        if (!widgetInitializedRef.current || !tvWidgetRef.current) return
        const newSymbol =
          typeOHLC === 'price' ? (!isPatch ? token : `${token}-PATCH`) : !isPatch ? `${token}-MC` : `${token}-MC-PATCH`
        const currentSymbol = tvWidgetRef.current?.chart()?.symbol()
        if (currentSymbol !== newSymbol) {
          // tvWidgetRef.current?.resetCache?.()
          tvWidgetRef.current?.chart().setSymbol(newSymbol, () => {})
        }
      }, [token, typeOHLC, isPatch])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef?.current) {
          // tvWidgetRef?.current?.resetCache?.()
          tvWidgetRef?.current?.chart().setResolution(period as ResolutionString, () => {})
        }
      }, [period])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef?.current && chartType === 0) {
          tvWidgetRef?.current?.chart().setChartType(0)
        }
        if (tvWidgetRef && tvWidgetRef?.current && chartType !== 0) {
          tvWidgetRef?.current?.chart().setChartType(chartType)
        }
      }, [chartType])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef?.current) {
          tvWidgetRef?.current?.changeTheme(capitalizeFirstLetter(theme) as ThemeName)
        }
      }, [theme])

      useEffect(() => {
        if (!isSnapshot) return
        handleSnapshot()
        setIsSnapshot?.(false)
      }, [isSnapshot])

      useEffect(() => {
        if (!chartContainerRef.current) return
        const container = chartContainerRef.current

        const observer = new ResizeObserver(() => {
          window.dispatchEvent(new Event('resize'))
        })
        observer.observe(container)
        return () => observer.disconnect()
      }, [])

      const handleSnapshot = async () => {
        if (!tvWidgetRef.current) return
        const screenshotCanvas = await tvWidgetRef.current.takeClientScreenshot()
        const linkElement = document.createElement('a')
        linkElement.download = 'screenshot'
        linkElement.href = screenshotCanvas.toDataURL()
        linkElement.dataset.downloadurl = ['image/png', linkElement.download, linkElement.href].join(':')
        document.body.appendChild(linkElement)
        linkElement.click()
        document.body.removeChild(linkElement)
      }
      return (
        <div className={cn('watermark relative w-full flex flex-col z-9', isChartFullScreen ? 'h-full' : `flex-1`)}>
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#121214] z-10">
              <Loading />
            </div>
          )}
          <div
            id="chartContainer"
            ref={chartContainerRef}
            className={`block w-full h-full ${isLoading ? 'hidden' : ''}`}
          />
          {selectedTrade && (
            <PurchaseMarkDrawer
              open={isDrawerOpen}
              setOpen={setIsDrawerOpen}
              address={selectedTrade?.wallet || ''}
              token={token}
              chainId={tokenMetaData?.chainId ?? 0}
            />
          )}
        </div>
      )
    },
  ),
)

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

const saveSelectedUserTypesToStorage = (types: Set<KlineStickerUserType | 'all'>): void => {
  try {
    const array = Array.from(types)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array))
  } catch (error) {
    console.error('Error saving selected user types to localStorage:', error)
  }
}

const TradingViewChart = () => {
  const tvChartRef = useRef<TvChartRef>(null)
  const params = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { i18n } = useTranslation()
  const i18Lang = i18n.language || 'en'
  const { preference } = usePreference()
  const dispatch = useAppDispatch()
  const pageType = usePageType()
  const { period, ohlcType, chartType, token, priceChangeColor, lang, symbol, listTimeFrames, isPatch } =
    useAppSelector((state: RootState) => state.chart[pageType])
  const [showIntervalMapList, setShowIntervalMapList] = useState<IntervalItem[]>(listTimeFrames)
  const chainId = useActiveChainId()
  const [isChartFullScreen, setIsChartFullScreen] = useState(false)
  const [isSnapshot, setIsSnapshot] = useState(false)

  const [selectedUserTypes, setSelectedUserTypes] = useState<Set<KlineStickerUserType | 'all'>>(
    loadSelectedUserTypesFromStorage,
  )

  useEffect(() => {
    saveSelectedUserTypesToStorage(selectedUserTypes)
  }, [selectedUserTypes])

  useEffect(() => {
    const newToken = params?.address || searchParams.get('token') || ''
    if (newToken !== token) {
      dispatch(chartActions.updateTokenWithType({ type: pageType, token: newToken }))
    }
    const newSymbol = location.state && location.state?.symbol ? location.state?.symbol : ''
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

  const handleShowPeriodListChange = (value: IntervalItem[]) => {
    setShowIntervalMapList(value)
  }

  const handleIndictorClick = () => {
    tvChartRef?.current?.tvIndictor()
  }

  const handleSettingClick = () => {
    tvChartRef?.current?.tvSetting()
  }

  useEffect(() => {
    window.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        setIsChartFullScreen(false)
      }
    })
    return () => {
      window.removeEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          setIsChartFullScreen(false)
        }
      })
    }
  }, [])

  return (
    <div id="TradingViewChart" className="flex flex-col relative bg-[#121214] h-full border-[0.5px] border-[#ECECED14]">
      <ChartHeadPC
        showPeriodList={showIntervalMapList}
        onShowPeriodListChange={handleShowPeriodListChange}
        onIndictorClick={handleIndictorClick}
        onSettingClick={handleSettingClick}
        onClickFullScreen={() => {
          const el = document.getElementById('chartContainer')
          if (el) {
            if (document.fullscreenElement) {
              document.exitFullscreen()
              setIsChartFullScreen(false)
            } else {
              el.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
              })
              setIsChartFullScreen(true)
            }
          }
        }}
        onClickSnapshot={() => setIsSnapshot(true)}
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
      <Chart
        ref={tvChartRef}
        token={token}
        symbol={location.state && location.state?.symbol ? location.state?.symbol : ''}
        chainId={chainId as number}
        period={period}
        chartType={chartType}
        typeOHLC={ohlcType}
        chartColor={priceChangeColor}
        lang={lang}
        isChartFullScreen={isChartFullScreen}
        isSnapshot={isSnapshot}
        setIsSnapshot={setIsSnapshot}
        selectedUserTypes={selectedUserTypes}
        isPatch={isPatch}
      />
    </div>
  )
}

export default TradingViewChart
