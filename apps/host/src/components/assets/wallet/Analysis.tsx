import Loader from '@/components/common/Loader'
import { formatNumberShort } from '@/components/common/MoneyFormatted'
import XTooltip from '@/components/ui/XTooltip'
import { useActiveChainId, useActiveChainType } from '@/hooks/useActiveChain'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { SOL_ADDRESS } from '@/lib/blockchain'
import { formatAmount, formatPercent, getStyleRiseFall } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { useWalletContextFields } from '@/pages/assets/WalletContext'
import { setPrice } from '@/redux/modules/tokenDetail.slice'
import { getWalletBalanceWallet, getWalletTokenHoldingStatistic } from '@/services/copytrade.service'
import { getTokensPrices } from '@/services/tokens.service'
import { CurrencyUnit } from '@/types/currency'
import { ChainIds } from '@/types/enums'
import { useQuery } from '@apollo/client'
import { useQueries } from '@tanstack/react-query'
import { get } from 'lodash-es'
import chunk from 'lodash-es/chunk'
import isEqual from 'lodash-es/isEqual'
import { FC, Fragment, useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

interface TokenPrice {
  price: string
  token: string
}
type Props = {
  period: string
  data: {
    wallets: Array<{
      address: string
      avgPriceUsd: string
      balance: number
    }>
    totalRealizedPnlUsd: number
    avgPriceUsd: number
    realizedPnlUsd: number
    buyAmountUsd: number
    avgBuyAmountUsd: number
    avgDuration: string | number
    tokenAvgRealizedProfits: number
    txsBuy: string | number
    txsSell: string | number
  }
  dataUnit?: CurrencyUnit
  isLoading?: boolean
  address: string
  className?: string
  isPC?: boolean
}

type DataRenderItem = {
  id?: string
  label: React.ReactNode
  value: React.ReactNode
  className?: string
  tooltip?: string
  /**
   * order to display the item for mobile
   */
  order?: number
}

type TCacheListAddress = Record<
  string,
  {
    avgPriceUsd: string
    balance: number
    isLowLiquidity: boolean
  }
>

export const UnrealizedPnLRealtime: FC<{
  dataUnit?: CurrencyUnit
}> = ({ dataUnit }) => {
  const { address } = useParams()
  const isUSD = useMemo(() => dataUnit === 'USD', [dataUnit])
  const { prices, unrealizedPnL } = useWalletContextFields(['prices', 'unrealizedPnL'])
  const activeChainType = useActiveChainType()
  const nativeTokenPrice = useNativeTokenPrice()
  const [cacheListAddress, setCacheListAddress] = useState<TCacheListAddress | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const nonLowLiquidityTokens = useMemo(() => {
    if (cacheListAddress === null) {
      return []
    }
    return Object.keys(cacheListAddress).filter((token) => !cacheListAddress[token].isLowLiquidity)
  }, [cacheListAddress])

  const lowLiquidityTokens = useMemo(() => {
    if (cacheListAddress === null) {
      return []
    }
    return Object.keys(cacheListAddress).filter((token) => cacheListAddress[token].isLowLiquidity)
  }, [cacheListAddress])

  // let interval: NodeJS.Timeout | null = null
  useQuery(getWalletTokenHoldingStatistic, {
    variables: {
      input: {
        address,
        chain: activeChainType,
        dayDuration: 7,
      },
    },
    client: futureClient,
    // TODO: check Deprecated
    onCompleted: (data) => {
      const wallets = get(data, 'getWalletTokenHoldingStatistic.tokenHoldings', [])
      if (wallets?.length === 0) {
        setCacheListAddress({})
        return
      }

      if (wallets.length) {
        const _obj: TCacheListAddress = {}
        wallets.forEach((wallet: any) => {
          _obj[wallet.address] = {
            avgPriceUsd: get(wallet, 'avgPriceUsd', '0'),
            balance: get(wallet, 'balance', 0),
            isLowLiquidity: get(wallet, 'isLowLiquidity', false),
          }
        })
        setCacheListAddress(_obj)
      }
    },
  })

  const resultNonLowLqTokenPrices = useQueries({
    queries: chunk(nonLowLiquidityTokens, 100).map((chunk) => ({
      queryKey: ['getNonLowLqTokenPrices', nonLowLiquidityTokens, activeChainId],
      queryFn: async () => {
        const result = await futureClient.query({
          query: getTokensPrices,
          variables: {
            tokens: chunk,
            chainId: activeChainId,
          },
        })
        return result.data?.getPrices ?? []
      },
      staleTime: 5 * 1000, // 5s
      gcTime: 5 * 1000, // 5s
      refetchInterval: 5 * 1000, // 5s
    })),
  })

  const resultLowLqTokenPrices = useQueries({
    queries: chunk(lowLiquidityTokens, 100).map((chunk) => ({
      queryKey: ['getLowLqTokensPrices', lowLiquidityTokens, activeChainId],
      queryFn: async () => {
        const result = await futureClient.query({
          query: getTokensPrices,
          variables: {
            tokens: chunk,
            chainId: activeChainId,
          },
        })
        return result.data?.getPrices ?? []
      },
      staleTime: Infinity,
      gcTime: 10 * 60 * 1000, // 10 minutes
    })),
  })

  useEffect(() => {
    const lowLqPrices = getPrices(resultLowLqTokenPrices.map((res) => res.data || []) as Array<TokenPrice[]>)
    const nonLowLqPrices = getPrices(resultNonLowLqTokenPrices.map((res) => res.data || []) as Array<TokenPrice[]>)
    if (Object.keys(nonLowLqPrices).length > 0 || Object.keys(lowLqPrices).length > 0) {
      const mergedPrices: Record<string, string> = {
        ...nonLowLqPrices,
        ...lowLqPrices,
      }
      if (!isEqual(prices.get, mergedPrices)) {
        prices.set(mergedPrices)
      }
    }
  }, [resultLowLqTokenPrices, resultNonLowLqTokenPrices])

  const getPrices = (chunks: Array<TokenPrice[]>) => {
    const prices: Record<string, string> = {}
    chunks.forEach((chunk: TokenPrice[]) => {
      chunk.forEach((tokenPrice: TokenPrice) => {
        prices[tokenPrice.token] = tokenPrice.price
      })
    })
    return prices
  }

  useEffect(() => {
    if (cacheListAddress === null) {
      return
    }
    if (Object.keys(cacheListAddress).length === 0) {
      setPrice(0)
      unrealizedPnL.set(0)
      setIsLoading(false)
      return
    }
    if (Object.keys(cacheListAddress).length > 0) {
      const _result = Object.keys(cacheListAddress).reduce((acc, address) => {
        const _current = get(cacheListAddress, address, {
          avgPriceUsd: '0',
          balance: 0,
          isLowLiquidity: false,
        })
        //ignore SOL and if isLowLiquidity is true
        if (
          address === SOL_ADDRESS ||
          get(cacheListAddress, address as keyof TCacheListAddress, {
            isLowLiquidity: false,
          }).isLowLiquidity
        )
          return acc
        //if avgPriceUsd is 0, return 0
        if (parseFloat(_current.avgPriceUsd) === 0) return acc
        return acc + (parseFloat(get(prices.get, address, '0')) - parseFloat(_current.avgPriceUsd)) * _current.balance
      }, 0)
      unrealizedPnL.set(_result)
      setIsLoading(false)
    }
  }, [prices.get, cacheListAddress])
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : isUSD ? (
        formatAmount(unrealizedPnL.get as number, {
          showCurrency: true,
          showSign: true,
          roundMode: 'floor',
        })
      ) : (
        formatAmount((unrealizedPnL.get as number) / nativeTokenPrice, {
          unit: dataUnit,
          showSign: true,
          roundMode: 'floor',
        })
      )}
    </>
  )
}

const BalanceSOL: FC<{
  dataUnit: CurrencyUnit
}> = ({ dataUnit }) => {
  const { address } = useParams()
  const activeChainType = useActiveChainType()
  const { data, loading } = useQuery(getWalletBalanceWallet, {
    variables: { input: { chain: activeChainType, address: address } },
    client: futureClient,
  })
  const nativeTokenPrice = useNativeTokenPrice()
  const isUSD = dataUnit === 'USD'
  const balance = get(data, 'getWalletBalance', 0)
  return (
    <>
      {loading ? (
        <Loader />
      ) : isUSD ? (
        formatAmount(balance * nativeTokenPrice, {
          showCurrency: true,
          roundMode: 'floor',
        })
      ) : (
        formatAmount(balance, {
          unit: dataUnit,
          roundMode: 'floor',
        })
      )}
    </>
  )
}

const Analysis = ({ period, data, dataUnit = 'USD', isLoading, className, isPC = false }: Props) => {
  const { t } = useTranslation()
  const {
    totalRealizedPnlUsd,
    realizedPnlUsd,
    buyAmountUsd,
    avgBuyAmountUsd,
    avgDuration,
    tokenAvgRealizedProfits,
    txsBuy,
    txsSell,
  } = data
  const isUSD = dataUnit === 'USD'
  const nativeTokenPrice = useNativeTokenPrice()
  const { unrealizedPnL } = useWalletContextFields(['unrealizedPnL'])
  const _dataRender: DataRenderItem[] = [
    {
      id: useId(),
      label: t('walletDetail.totalPnL'),
      value: (
        <div className={cn('flex flex-wrap gap-x-[8px] items-end', isPC ? 'items-end' : 'items-end')}>
          <span className={cn(isPC ? 'text-[20px]' : 'text-[14px]')}>
            {isUSD
              ? formatAmount(realizedPnlUsd + (unrealizedPnL.get as number), {
                  showCurrency: true,
                  roundMode: 'floor',
                  showSign: true,
                })
              : formatAmount((realizedPnlUsd + (unrealizedPnL.get as number)) / nativeTokenPrice, {
                  unit: dataUnit,
                  roundMode: 'floor',
                  showSign: true,
                })}
          </span>
          <span className="inline-block">
            {`(${formatPercent(((realizedPnlUsd + (unrealizedPnL.get as number)) / buyAmountUsd) * 100, {
              showSign: true,
            })})`}
          </span>
        </div>
      ),
      className: cn(
        'font-medium text-[14px] leading-none mt-2 break-all',
        getStyleRiseFall(Number(realizedPnlUsd + (unrealizedPnL.get as number))),
      ),
      order: 1,
    },
    {
      id: useId(),
      label: t('walletDetail.analysis.balance', { period }),
      value: <BalanceSOL dataUnit={dataUnit} />,
      order: 8,
    },
    {
      id: useId(),
      label: t('walletDetail.unrealizedPnL'),
      value: <UnrealizedPnLRealtime dataUnit={dataUnit} />,
      order: 2,
    },
    {
      id: useId(),
      label: t('walletDetail.analysis.txs', { period }),
      value: (
        <Fragment>
          <span className="text-rise">
            {formatNumberShort(txsBuy, {
              defaultValue: '0',
            })}
          </span>{' '}
          /{' '}
          <span className="text-fall">
            {' '}
            {formatNumberShort(txsSell, {
              defaultValue: '0',
            })}
          </span>
        </Fragment>
      ),
      className: 'mt-2',
      order: 7,
    },
    {
      id: useId(),
      label: t('walletDetail.analysis.avgDuration', { period }),
      value: avgDuration,
      order: 3,
    },
    {
      id: useId(),
      label: t('walletDetail.analysis.tokenAvgCost', { period }),
      value: isUSD
        ? formatAmount(avgBuyAmountUsd, {
            showCurrency: true,
          })
        : formatAmount(avgBuyAmountUsd / nativeTokenPrice, {
            unit: dataUnit,
          }),
      tooltip: t('walletDetail.tooltip.tokenAvgCost'),
      order: 5,
    },
    {
      id: useId(),
      label: t('walletDetail.analysis.totalCost', { period }),
      value: isUSD
        ? formatAmount(buyAmountUsd, {
            showCurrency: true,
          })
        : formatAmount(buyAmountUsd / nativeTokenPrice, {
            unit: dataUnit,
          }),
      tooltip: t('walletDetail.tooltip.totalCost'),
      order: 4,
    },
    {
      id: useId(),
      label: t('walletDetail.analysis.tokenAvgRealizedProfits', { period }),
      value: isUSD
        ? formatAmount(tokenAvgRealizedProfits, {
            showCurrency: true,
            roundMode: 'floor',
          })
        : formatAmount(tokenAvgRealizedProfits / nativeTokenPrice, {
            unit: dataUnit,
            roundMode: 'floor',
          }),
      className: cn(getStyleRiseFall(Number(tokenAvgRealizedProfits))),
      tooltip: t('walletDetail.tooltip.tokenAvgRealizedProfits'),
      order: 6,
    },
  ]
  return (
    <div className={cn('grid gap-2 h-auto grid-rows-2', isPC ? 'grid-cols-4' : 'grid-cols-2', className)}>
      <Fragment>
        {_dataRender.map((item, index) => (
          <div key={item.id} style={{ order: isPC ? index : item.order }}>
            <div className={cn('px-[14px] py-3 rounded-[8px] h-full', isPC ? 'bg-[#101114]' : 'bg-[#d3d3d314]')}>
              <div
                className={cn(
                  'text-[#79778C] leading-none flex items-start',
                  isPC ? 'text-[14px] mb-[10px]' : 'text-[13px] mb-[8px]',
                )}
              >
                {item.label}
                {item?.tooltip && <XTooltip description={item.tooltip} title={item.label} />}
              </div>
              <div
                className={cn(
                  'font-medium text-white leading-none',
                  isPC ? 'text-[16px]' : 'text-[14px]',
                  item.className,
                )}
              >
                {isLoading ? <Loader /> : item.value}
              </div>
            </div>
          </div>
        ))}
      </Fragment>
    </div>
  )
}

export default Analysis
