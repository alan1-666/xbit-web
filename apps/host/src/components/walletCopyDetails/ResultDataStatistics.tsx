import Loader from '@/components/common/Loader'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { useTokensPriceChunk, XGetTokensPrice } from '@/hooks/useTokenPrice'
import { formatAmount, formatPercent, formatVolume, getStyleRiseFall } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { totalListKeysInArray } from '@/utils/array'
import { isNumber } from '@/utils/helpers'
import { formatToTimeAgoI18n, getTimeAgo } from '@/utils/time'
import { get } from 'lodash-es'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/skeleton'

type IProps = {
  data: Record<
    'totalProfitInUsd' | 'totalSellWithProfit' | 'totalBuy' | 'totalSell' | 'remainingAmount' | 'avgCostPriceInUsd',
    string | number
  >[]
  listAddress: string[]
  createdAt: string
  loading?: boolean
  isPC?: boolean
}

type DataStatisticsItem = {
  key: string
  label: string
  value: string | ReactNode
  status: 'neutral' | 'profit' | 'loss'
  bg: string
}

export default function ResultDataStatistics(props: IProps) {
  const { t } = useTranslation()
  const { data, loading = false, listAddress, createdAt, isPC = false } = props
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const nativeTokenPrice = useNativeTokenPrice()
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [dataStatistics, setDataStatistics] = useState<any[]>([])
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const isUSD = useMemo(() => dataUnit === 'USD', [dataUnit])
  const displayUnit = useMemo(() => {
    return dataUnit === 'USD' ? '$' : dataUnit
  }, [dataUnit])

  const [loadingUnrealized, setLoadingUnrealized] = useState(true)

  useEffect(() => {
    //recursive
    const interval = setInterval(async () => {
      if (listAddress.length) {
        const _objPrices: Record<string, number> = {}
        if (listAddress.length > 100) {
          const queries = await useTokensPriceChunk({
            tokens: listAddress,
            chainId: activeChainId,
          })
          queries.map((q: any) => {
            const _data = get(q, 'data', [])
            if (_data.length) {
              _data.forEach((p: any) => {
                _objPrices[p.token] = get(p, 'price', '0')
              })
            }
          })
        } else {
          const _res = await XGetTokensPrice(listAddress, activeChainId)
          const _data = get(_res, 'data', [])
          if (_data.length) {
            _data.forEach((p: any) => {
              _objPrices[p.token] = get(p, 'price', '0')
            })
          }
        }
        setPrices(_objPrices)
      }
      setLoadingUnrealized(false)
    }, 3000) // 3s
    return () => {
      clearInterval(interval)
    }
  }, [listAddress])
  useEffect(() => {
    const _dataStatistics: DataStatisticsItem[] = [
      {
        key: 'totalProfit',
        label: t('walletCopy.totalProfit'),
        value: '0',
        bg: 'bg1.svg',
        status: 'profit',
      },
      {
        key: 'realizedProfit',
        label: t('walletCopy.realizedProfit'),
        value: '0',
        bg: 'bg2.svg',
        status: 'loss',
      },
      {
        key: 'unrealizedProfit',
        label: t('walletCopy.unrealizedProfit'),
        value: '0',
        bg: 'bg1.svg',
        status: 'profit',
      },
      {
        key: 'buySellCount',
        label: t('walletCopy.buySellCount'),
        value: '0/0',
        bg: 'bg3.svg',
        status: 'neutral',
      },
      {
        key: 'duration',
        label: t('walletCopy.duration'),
        value: '0d',
        bg: 'bg3.svg',
        status: 'neutral',
      },
      {
        key: 'winRate',
        label: t('walletCopy.winRate'),
        value: '0%',
        bg: 'bg3.svg',
        status: 'neutral',
      },
    ]
    const _data = data.map((item) => {
      const _key = get(item, 'baseAddress', '')
      const price = get(prices, _key, 0)
      return {
        ...item,
        unrealized: loadingUnrealized
          ? 0
          : (price - parseFloat(`${item.avgCostPriceInUsd}`)) * parseFloat(`${item.remainingAmount}`),
        price,
      }
    })
    const _total = totalListKeysInArray(_data, [
      'totalProfitInUsd',
      'totalSellWithProfit',
      'totalBuy',
      'totalSell',
      'remainingAmount',
      'avgCostPriceInUsd',
      'unrealized',
    ])

    /**
     * gia hiên tại - giá trung bình * sl hiện tại
     * baseAddress - avgCostPriceInUsd * remainingAmount
     */
    try {
      const totalProfitInUsd = parseFloat(`${get(_total, 'totalProfitInUsd', 0)}`)
      const unrealized = parseFloat(`${get(_total, 'unrealized', 0)}`)
      const totalSellWithProfit = parseFloat(`${get(_total, 'totalSellWithProfit', 0)}`)
      const totalSell = parseFloat(`${get(_total, 'totalSell', 0)}`)
      const totalBuy = get(_total, 'totalBuy', 0)
      const totalSellCount = get(_total, 'totalSell', 0)

      _dataStatistics[0].value = `${totalProfitInUsd + unrealized}`
      _dataStatistics[1].value = `${totalProfitInUsd}`
      _dataStatistics[2].value = `${unrealized}`
      // _dataStatistics[3].value = `${totalBuy}/${totalSellCount}`
      _dataStatistics[3].value = isPC ? (
        <div className="flex items-center gap-1">
          <span className="text-rise">{totalBuy}</span> / <span className="text-fall">{totalSellCount}</span>
        </div>
      ) : (
        `${totalBuy}/${totalSellCount}`
      )
      _dataStatistics[4].value = isPC ? (
        <div className="flex items-center gap-1">
          <span className="text-neutral">{formatToTimeAgoI18n(createdAt)}</span>
        </div>
      ) : (
        `${formatToTimeAgoI18n(createdAt)}`
      )
      _dataStatistics[5].value = isPC ? (
        <div className="flex items-center gap-1">
          <span className="text-neutral">
            {totalSell > 0 ? formatPercent((totalSellWithProfit / totalSell) * 100) : '0%'}
          </span>
        </div>
      ) : totalSell > 0 ? (
        formatPercent((totalSellWithProfit / totalSell) * 100)
      ) : (
        '0%'
      )
    } catch (e) {
      _dataStatistics[0].value = '0'
      _dataStatistics[1].value = '0'
      _dataStatistics[2].value = '0'
      _dataStatistics[3].value = '0/0'
      _dataStatistics[4].value = '0d'
      _dataStatistics[5].value = '0%'
    }
    setDataStatistics(_dataStatistics)
  }, [data, prices, loadingUnrealized])
  return (
    <div
      className={cn(isPC ? 'flex gap-0 mb-[15px] bg-[#101114] rounded-[6px]' : 'grid grid-cols-3 gap-2 mb-4 mt-[9px]')}
    >
      {dataStatistics.map((item) => {
        const { key, label, value, status } = item
        const background =
          status === 'neutral' ? 'bg3.svg' : Number(value.replace('$', '')) >= 0 ? 'bg1.svg' : 'bg2.svg'
        return (
          <div
            key={key}
            className={cn(
              'relative rounded-[6px] overflow-clip p-4 flex flex-col items-center justify-center aspect-[113/64]',
              isPC ? 'flex-1' : '',
            )}
          >
            {loading ? (
              <Skeleton
                className="absolute inset-0 w-full h-full rounded-[6px]"
                style={{ background: 'linear-gradient(90deg, #141414 0%, #232329 100%)' }}
              />
            ) : (
              <>
                {!isPC && (
                  <img
                    src={`/images/walletCopy/${background}`}
                    className="object-cover absolute inset-0 w-full h-full"
                    alt=""
                  />
                )}
                <div
                  className={cn(
                    'z-20 mt-[0px]',
                    isPC ? 'text-[#79778C] text-[14px] mb-[12px]' : 'text-[12px] text-[#FFFFFF] mb-[8px]',
                  )}
                >
                  {label}
                </div>
                <div
                  className={cn(
                    'z-20 mt-[-1px] font-semibold',
                    isPC ? 'text-[18px]' : 'text-[12px]',
                    isPC ? 'text-white' : status === 'neutral' && 'text-impartal',
                    isNumber(parseFloat(value as string)) ? getStyleRiseFall(Number(value.replace('$', ''))) : '',
                  )}
                >
                  {status === 'neutral' ? (
                    value
                  ) : (
                    <>
                      {key == 'unrealizedProfit' && loadingUnrealized ? (
                        <Loader />
                      ) : isUSD ? (
                        formatVolume(value, {
                          showCurrency: true,
                          roundMode: 'floor',
                        })
                      ) : (
                        formatAmount(Number(value) / nativeTokenPrice, {
                          roundMode: 'floor',
                          unit: displayUnit,
                        })
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
