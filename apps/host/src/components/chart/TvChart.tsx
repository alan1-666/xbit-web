import { useTheme } from '@/components/theme-provider.js'
import { Datafeeds, resolutionMap, TvConfig } from '@/datafeeds/index'
import { usePageType } from '@/hooks/usePageType'
import { formatPrice, formatVolume } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { capitalizeFirstLetter } from '@/lib/utils.js'
import { chartActions } from '@/redux/modules/chart.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { chartRefRegistry } from '@/services/chartRefRegistry'
import { getTokenMetadata } from '@/services/tokens.service'
import { useQuery } from '@apollo/client'
import { Loading } from '@components/common/Loading.tsx'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  ThemeName,
  widget,
} from '../../../public/charting_library'
import { KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { useChartMarks } from '@/hooks/chart/useChartMarks'
import PurchaseMarkDrawer from './purchaseMarkDrawer'

declare global {
  interface Window {
    lastTopicMqtt?: string
  }
}

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
  chainId: string | number
  period: string
  symbol?: string
  chartType: number
  typeOHLC?: 'price' | 'marketCap'
  chartColor?: string
  lang: string
  isWebview?: boolean
  selectedUserTypes?: Set<KlineStickerUserType | 'all'>
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

const TvChart = memo(
  forwardRef(
    (
      {
        token,
        chainId,
        symbol,
        period,
        chartType,
        typeOHLC,
        chartColor,
        lang,
        isWebview,
        selectedUserTypes,
      }: TvChartProps,
      ref,
    ) => {
      const { theme } = useTheme()
      const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>
      const tvWidgetRef = useRef<IChartingLibraryWidget>(null)
      const currentMode = useRef<'price' | 'mc'>('price')
      const { height: heightLs } = useAppSelector((state: RootState) => state.chart)
      const dispatch = useAppDispatch()
      const pageType = usePageType()
      const activeWallet = useSelector(_activeWallet)
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
        skip: !token || !chainId,
        variables: { input: token, chainId: Number(chainId) },
        fetchPolicy: 'no-cache',
        client: futureClient,
      })
      const tokenMetaData = data?.getTokenMetadata

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
          name: typeOHLC === 'price' ? token : `${token}-MC`,
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
      const chainIdRef = useRef(chainId)

      useEffect(() => {
        symbolRef.current = symbol
      }, [symbol])

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
      }, [tokenMetaData, typeOHLC, token, chainId, symbol])

      // Initialize widget and datafeed only once when container is ready
      useEffect(() => {
        if (widgetInitializedRef.current) return
        if (!chartContainerRef.current) return

        // Create datafeed only once
        if (!datafeedRef.current) {
          datafeedRef.current = new Datafeeds(externalInstanceRef.current)
        }
        setIsLoading(true)

        const initialSymbol = tokenMetaData?.symbol ? (typeOHLC === 'price' ? token : `${token}-MC`) : 'BTC/USD'

        const widgetOptions = Object.assign(
          {
            symbol: initialSymbol,
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

                if (symbolInfo.name.endsWith('-MC')) {
                  return {
                    format: (value: any) => {
                      return formatVolume(value, {})
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
          TvConfig(chartColor === 'inverse' ? 'rg' : 'gr', true),
        ) as unknown as ChartingLibraryWidgetOptions

        const tvWidget = new widget(widgetOptions)
        tvWidget.onChartReady(() => {
          tvWidgetRef.current = tvWidget
          widgetInitializedRef.current = true
          tvWidget.chart().setChartType(chartType)
          if (tokenMetaData?.symbol) {
            const symbol = typeOHLC === 'price' ? token : `${token}-MC`
            tvWidget.chart().setSymbol(symbol)
          }
          setIsLoading(false)
          const KLineChannelFromWeb = (window as any).KLineChannelFromWeb
          if (KLineChannelFromWeb) KLineChannelFromWeb.postMessage(JSON.stringify({ isChartReady: true }))
          window.parent.postMessage(JSON.stringify({ isChartReady: true }), '*')
          requestAnimationFrame(() => {
            tvWidget.subscribe('onMarkClick', handleMarkClick)
          })
        })

        return () => {
          tvWidget.remove()
          widgetInitializedRef.current = false
        }
      }, [lang, chartColor])

      useEffect(() => {
        if (!widgetInitializedRef.current || !tvWidgetRef.current) return
        const newSymbol = typeOHLC === 'price' ? token : `${token}-MC`
        const currentSymbol = tvWidgetRef.current?.chart()?.symbol()
        if (currentSymbol !== newSymbol) {
          // tvWidgetRef.current?.resetCache?.()
          tvWidgetRef.current?.chart().setSymbol(newSymbol, () => {})
        }
      }, [token, typeOHLC])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef?.current) {
          // tvWidgetRef?.current?.resetCache?.()
          tvWidgetRef?.current?.chart().setResolution(period as ResolutionString, () => {})
        }
      }, [period])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef?.current) {
          tvWidgetRef?.current?.chart().setChartType(chartType)
        }
      }, [chartType])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef?.current) {
          tvWidgetRef?.current?.changeTheme(capitalizeFirstLetter(theme) as ThemeName)
        }
      }, [theme])

      const [height, setHeight] = useState(heightLs ?? 200)
      const [isResizing, setIsResizing] = useState(false)
      const startYRef = useRef(0)
      const startHeightRef = useRef(0)

      useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
          if (!isResizing) return
          const delta = e.clientY - startYRef.current
          const newHeight = startHeightRef.current + delta
          if (newHeight > 50 && newHeight < window.innerHeight - 100) {
            setHeight(newHeight)
          }
        }

        const handlePointerUp = (e: PointerEvent) => {
          if (!isResizing) return

          setIsResizing(false)
          dispatch(chartActions.updateHeight(height))
          if (e.target instanceof Element) {
            e.target.releasePointerCapture(e.pointerId)
          }
        }

        if (isResizing) {
          document.addEventListener('pointermove', handlePointerMove)
          document.addEventListener('pointerup', handlePointerUp)
          document.addEventListener('pointercancel', handlePointerUp)
        }

        return () => {
          document.removeEventListener('pointermove', handlePointerMove)
          document.removeEventListener('pointerup', handlePointerUp)
          document.removeEventListener('pointercancel', handlePointerUp)
        }
      }, [isResizing, height, dispatch])

      const handlePointerDown = (e: React.PointerEvent) => {
        setIsResizing(true)
        startYRef.current = e.clientY
        startHeightRef.current = height
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }

      return (
        <>
          <div
            style={{
              height: isWebview ? '100vh' : `${height + 15}px`,
              width: '100%',
              willChange: isResizing ? 'height' : 'auto',
            }}
            className="watermark relative w-full flex flex-col"
          >
            <div
              id="chartContainer"
              ref={chartContainerRef}
              className={`block w-full h-full ${!isResizing ? 'transition-[height] duration-100 ease-out' : ''}`}
            />

            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0A0A0A] z-10">
                <Loading />
              </div>
            )}

            <div
              onPointerDown={handlePointerDown}
              className={`z-[99] w-full h-[24px] -my-2 cursor-ns-resize ${isWebview ? 'hidden' : ''} flex items-center touch-none select-none`}
              style={{ touchAction: 'none' }}
            >
              <div className="h-[2px] w-full bg-[#ECECED1F]"></div>
            </div>
          </div>
          {isResizing && !isWebview && <div className="fixed inset-0 z-[9999] bg-transparent cursor-ns-resize" />}
          {selectedTrade && (
            <PurchaseMarkDrawer
              open={isDrawerOpen}
              setOpen={setIsDrawerOpen}
              address={selectedTrade?.wallet || ''}
              token={token}
              chainId={tokenMetaData?.chainId ?? 0}
            />
          )}
        </>
      )
    },
  ),
)

export default TvChart
