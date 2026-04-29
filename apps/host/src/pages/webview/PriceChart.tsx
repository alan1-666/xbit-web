import TvChart from '@/components/chart/TvChart'
import { APP_PATH } from '@/lib/constant'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChainIds } from '@/types/enums.ts'

// token:
// period:
// 1S, 30S, 1, 5, 15, 30, 60, 240, 1D, 1W
// chartType:
// 0: Bars
// 1: Candles
// 2: Line
// 3: Area
// 8: Heikin Ashi
// 9: Hollow candles

const DEFAULT_PERIOD = '1'
const DEFAULT_CANDLE_TYPE = 1
const DEFAULT_OLHC_TYPE = 'price'
const DEFAUTL_CHART_COLOR = 'normal'

const PriceChart = () => {
  const tvChartRef = useRef(null)
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [chainId, setChainId] = useState<string | number>(
    params?.chainId || searchParams.get('chainId') || ChainIds.Solana,
  )
  const [token, setToken] = useState<string>(params?.address || searchParams.get('token') || '')
  const [symbol, setSymbol] = useState<string>(params?.symbol || searchParams.get('symbol') || '')
  const [lang, setLang] = useState<string>(searchParams.get('lang') || 'en')
  const [period, setPeriod] = useState<string>(searchParams.get('period') || DEFAULT_PERIOD)
  const [chartType, setChartType] = useState<number>(
    searchParams.get('chartType') ? Number(searchParams.get('chartType')) : DEFAULT_CANDLE_TYPE,
  )
  const [typeOHLC, setTypeOHLC] = useState<'price' | 'marketCap'>(
    searchParams.get('typeOHLC') === 'marketCap' ? 'marketCap' : DEFAULT_OLHC_TYPE,
  )
  const [chartColor, setChartColor] = useState<string>(searchParams.get('chartColor') || DEFAUTL_CHART_COLOR)
  const [onIndictorClick, setOnIndictorClick] = useState<boolean>(false)
  const [onSettingClick, setOnSettingClick] = useState<boolean>(false)

  useEffect(() => {
    const newAddress = params?.address || searchParams.get('token') || ''
    if (newAddress !== token) {
      setToken(newAddress)
    }
    setLang(searchParams.get('lang') || 'en')
  }, [params, searchParams])

  window.addEventListener('message', (event: MessageEvent) => {
    const data = event?.data
    if (data && data.token) {
      setChainId(data?.chainId || chainId)
      setToken(data?.token)
      setSymbol(data?.symbol || '')
      setPeriod(data?.period || period)
      setChartType(data?.chartType !== undefined ? Number(data?.chartType) : chartType)
      setTypeOHLC(data?.typeOHLC || typeOHLC)
      setChartColor(data?.chartColor || chartColor)
      setOnIndictorClick(data?.onIndictorClick || false)
      setOnSettingClick(data?.onSettingClick || false)
      setLang(data?.lang || lang)
    }
  })

  useEffect(() => {
    navigate(
      `${APP_PATH.WEBVIEW_PRICE_CHART_2}?token=${token}&chainId=${chainId}&symbol=${symbol}&period=${period}&chartType=${chartType}&typeOHLC=${typeOHLC}&chartColor=${chartColor}&lang=${lang}`,
    )
  }, [token, symbol, chainId, lang, period, chartType, typeOHLC, chartColor])

  useEffect(() => {
    if (onIndictorClick) {
      tvChartRef?.current?.tvIndictor()
      setOnIndictorClick(false)
    }
    return () => {
      setOnIndictorClick(false)
    }
  }, [onIndictorClick])

  useEffect(() => {
    if (onSettingClick) {
      tvChartRef?.current?.tvSetting()
      setOnSettingClick(false)
    }
    return () => {
      setOnSettingClick(false)
    }
  }, [onSettingClick])

  return (
    <div className="relative h-screen">
      <TvChart
        ref={tvChartRef}
        token={token}
        chainId={chainId}
        symbol={symbol}
        period={period}
        chartType={chartType}
        typeOHLC={typeOHLC}
        chartColor={chartColor}
        lang={lang}
        isWebview
      />
    </div>
  )
}

export default PriceChart
