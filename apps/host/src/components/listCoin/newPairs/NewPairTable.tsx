import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@pages/home/data-table.tsx'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { useSubscription } from '@/lib/mqtt'
import { formatAddressWallet } from '@/lib/string.ts'
import { getPairsQuery } from '@services/pairs.service.ts'
import { formatMoney, formatPrice, formatSmallNumber, getBlockChainLogo } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import CopyBtn from '@components/common/CopyBtn.tsx'
import { useEffect, useRef, useState } from 'react'
import useTimeAgoGlobal from '@hooks/useTimeAgoGlobal.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Maybe, PairDto, TokenWithStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { f } from 'fintech-number'
import { APP_PATH } from '@/lib/constant'

const AgeCountdown = ({ createdTime }: { createdTime?: number }) => {
  const timeAgo = useTimeAgoGlobal(createdTime)

  return <div>{timeAgo}</div>
}

// const percentageChange = (oldValue?: number, newValue?: number) => {
//   if (!oldValue || !newValue || oldValue === 0) return '--'
//
//   const result = (((newValue - oldValue) / oldValue) * 100)
//
//   return result === 0 ? result.toFixed(2) + '%' : result > 0 ? '+' + result.toFixed(2) + '%' : result.toFixed(2) + '%'
// }

const formatPercent = (value?: number) => {
  if (!value) return <div className="text-[#5c6068]">0%</div>

  return <div className={value < 0 ? 'text-[#f094a4]' : 'text-[#afdfb6]'}>{value.toFixed(2)}%</div>
}

let columns: ColumnDef<PairDto>[] = [
  {
    header: 'Token',
    cell: ({ row }) => {
      const chain: ChainIds = row.original?.chain as unknown as ChainIds
      const token0Info = row.original?.token0Info
      const token1Info = row.original?.token1Info

      if (!token0Info) {
        console.log('token0Info null', { pairAddress: row.original?.address })
      }
      if (!token1Info) {
        console.log('token1Info null', { pairAddress: row.original?.address })
      }

      const baseTokens: Record<number, Maybe<TokenWithStatisticDto> | undefined> = {
        0: token0Info,
        1: token1Info,
      }

      const baseToken = baseTokens[row.original?.baseToken ?? 0]
      const address = baseToken?.address
      const name = baseToken?.symbol
      const logoUrl = getBlockChainLogo(chain, baseToken?.address ?? '')

      if (!name) return null

      return (
        <div className="flex items-center gap-[5px] min-w-[150px]">
          <img
            src={logoUrl}
            className="w-[32px] h-[32px] rounded-full"
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/logo-pair-fallback.webp'
              e.currentTarget.onerror = null
            }}
          />
          <div>
            <div>{name}</div>
            <div className="flex items-center gap-[10px]">
              {formatAddressWallet(address)} <CopyBtn text={address} />
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'chain',
    header: 'Chain',
    cell: ({ row }) => {
      return ChainIds[Number(row.original?.chain)]
    },
  },
  {
    header: 'Age',
    cell: ({ row }) => {
      const createdTime = row.original?.createdTime

      return <AgeCountdown createdTime={createdTime ?? undefined} />
    },
  },
  {
    header: 'Liq/Initial',
    cell: ({ row }) => {
      const liquidityValue = row.original?.tokenInfo?.liquidity
      const liquidityShow = liquidityValue ? formatSmallNumber(liquidityValue, false, 4) : '0'
      const initialValue = row.original?.tokenInfo?.initLiquidity
      const initialShow = initialValue ? formatSmallNumber(initialValue, false, 4) : '0'

      return (
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: `${liquidityShow}/${initialShow}`,
            }}
          />
          {/*<div>{percentageChange(initialValue, liquidityValue)}</div>*/}
        </div>
      )
    },
  },
  {
    header: 'MC',
    cell: ({ row }) => {
      const marketCap = row.original?.tokenInfo?.marketcap ? formatMoney(row.original?.tokenInfo?.marketcap) : '--'
      return <div>{marketCap}</div>
    },
  },
  {
    header: 'Holders',
    cell: ({ row }) => {
      const holders = row.original?.tokenInfo?.holders ?? '--'
      return <div>{holders}</div>
    },
  },
  {
    header: '1m TXs',
    cell: ({ row }) => {
      const buy = row.original?.tokenInfo?.buyTxs1h ?? 0
      const sell = row.original?.tokenInfo?.sellTxs1h ?? 0
      const totalValue = buy + sell
      const total = !isNaN(totalValue) ? totalValue : 0
      return (
        <div>
          <div>{total}</div>
          <div className="text-[12px]">
            <span className="text-[#AFDFB6]">{buy ?? '--'}</span>/<span className="text-[#F094A4]">{sell ?? '--'}</span>
          </div>
        </div>
      )
    },
  },
  {
    header: '1m Vol',
    cell: ({ row }) => {
      const value = formatMoney(row.original?.tokenInfo?.volume1h, 2)
      return <div>{value}</div>
    },
  },
  {
    header: 'Price',
    cell: ({ row }) => {
      const price = formatPrice(row.original?.tokenInfo?.price ?? undefined)
      return <div dangerouslySetInnerHTML={{ __html: price }} />
    },
  },
  {
    header: '1m%',
    cell: ({ row }) => {
      const value = Number(row.original?.tokenInfo?.price1mChange)
      return <div>{formatPercent(value)}</div>
    },
  },
  {
    header: '5m%',
    cell: ({ row }) => {
      const value = Number(row.original?.tokenInfo?.price5mChange)
      return <div>{formatPercent(value)}</div>
    },
  },
  {
    header: '1h%',
    cell: ({ row }) => {
      const value = Number(row.original?.tokenInfo?.price1hChange)
      return <div>{formatPercent(value)}</div>
    },
  },
  {
    header: 'Degen Audit',
    cell: ({ row }) => {
      const noMint = row.original?.tokenInfo?.mintDisable ? 'Yes' : 'No'
      const blackList = row.original?.tokenInfo?.isBlacklisted ? 'Yes' : 'No'
      const burntRatio = row.original?.tokenInfo?.burnRatio
      const burnt = burntRatio && burntRatio > 0 ? 'Yes' : 'No'
      const top10HolderRate = row.original?.tokenInfo?.top10HolderRate
      const top10 = top10HolderRate ? f(top10HolderRate * 100, { decimal: 2 }) + '%' : '--'
      const insidersNum = row.original?.tokenInfo?.ratTraderAmountRate
      const insiders = insidersNum ? insidersNum + '%' : '--'

      return (
        <div className="flex items-end gap-[10px] text-nowrap">
          <div>
            <div className={cn('mb-[5px]', noMint === 'Yes' ? 'text-[#afdfb6]' : 'text-[#f094a4]')}>{noMint}</div>
            <div className="text-[#5c6068]">NoMint</div>
          </div>
          <div>
            <div className={cn('mb-[5px]', blackList === 'No' ? 'text-[#afdfb6]' : 'text-[#f094a4]')}>{blackList}</div>
            <div className="text-[#5c6068]">Blacklist</div>
          </div>
          <div>
            <div className={cn('mb-[5px]', burnt === 'Yes' ? 'text-[#afdfb6]' : 'text-[#f094a4]')}>{burnt}</div>
            <div className="text-[#5c6068]">Burnt</div>
          </div>
          <div>
            <div
              className={cn('mb-[5px]', top10HolderRate && top10HolderRate > 0 ? 'text-[#afdfb6]' : 'text-[#f094a4]')}
            >
              {top10}
            </div>
            <div className="text-[#5c6068]">Top 10</div>
          </div>
          <div>
            <div className={cn('mb-[5px]', insidersNum && insidersNum > 0 ? 'text-[#afdfb6]' : 'text-[#f094a4]')}>
              {insiders}
            </div>
            <div className="text-[#5c6068]">Insiders</div>
          </div>
        </div>
      )
    },
  },
  {
    header: 'DEV',
    cell: ({ row }) => {
      const value = '--'
      return <div>{value}</div>
    },
  },
]

const chainMap: Record<string, string> = {
  sol: ChainIds.Solana.toString(),
  eth: ChainIds.Ethereum.toString(),
}

type NewPairTableProps = {
  tableContainerClassName?: string
}

const NewPairTable = ({ tableContainerClassName }: NewPairTableProps) => {
  const [pairsData, setPairsData] = useState<PairDto[]>([])
  // const pairIdsRef = useRef<string[]>([])
  const refetchTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const { message } = useSubscription(['public/pairs/new'])
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const [params] = useSearchParams()
  const isDebug = params.get('debug') === '1'
  const navigate = useNavigate()

  if (isDebug && columns[2].header !== 'Created time') {
    columns = [
      ...columns.slice(0, 2),
      {
        accessorKey: 'createdTime',
        header: 'Created time',
        cell: ({ row }) => {
          const createdTime = row.original?.createdTime ?? ''

          return (
            <div className="flex items-center gap-[5px]">
              <span>{createdTime}</span>
              <CopyBtn text={createdTime.toString()} />
            </div>
          )
        },
      },
      ...columns.slice(2),
    ]
  }

  const fetchData = async (input?: Record<string, any>) => {
    const queryInput = input ?? {
      page: 1,
      limit: 50,
      chain: chainMap[activeChain],
    }

    const pairsListResponse = await gqlClient.query({
      query: getPairsQuery,
      variables: {
        input: queryInput,
      },
    })

    const pairsData = pairsListResponse?.data?.getPairs?.data ?? []
    setPairsData(pairsData)
  }

  // useEffect(() => {
  //   pairIdsRef.current = pairsData.slice(0, 50).map((pair: Pair) => pair?.id)
  // }, [pairsData])

  useEffect(() => {
    let isMounted = true
    // let refetchTimer: ReturnType<typeof setInterval>
    if (isMounted) {
      fetchData()
      refetchTimerRef.current = setInterval(() => {
        fetchData()
      }, 3000)
    }

    return () => {
      isMounted = false
      clearInterval(refetchTimerRef.current)
    }
  }, [activeChain])

  useEffect(() => {
    const mqttMessage = message?.message
    if (!mqttMessage) return

    try {
      const data = JSON.parse(mqttMessage.toString() || '')
      const selectedChain = chainMap[activeChain]
      if (data?.chain !== selectedChain) return

      const newData = [...pairsData]
      // newData.pop()
      newData.unshift(data)
      newData.slice(0, 50)
      const uniqueNewData = [...new Set(newData.map((item) => JSON.stringify(item)))]
        .map((item) => JSON.parse(item))
        .sort((a, b) => b.createdTime - a.createdTime)
      setPairsData(uniqueNewData)
    } catch (error) {
      console.warn('new pairs subscription error: ', error)
    }
  }, [message])

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        data={pairsData.slice(0, 50)}
        isStickyHeader
        isStickyFirstColumn
        stickyBg="rgb(23,24,27)"
        containerClassName={cn('max-h-[60vh]', tableContainerClassName)}
        tableClassName="bg-[rgb(23,24,27)]"
        tableHeaderClassName="bg-[rgb(23,24,27)]"
        tableHeaderRowClassName="border-b-[1px] border-b-[rgb(38,40,44)] text-[12px] text-[rgb(92,96,104)] sticky top-0"
        tableHeadClassName="app-font-light px-[7px] py-[3px] items-center justify-center min-w-[80px]"
        tableBodyClassName="min-h-[500px] h-[500px]"
        tableBodyRowClassName="cursor-pointer group"
        tableCellClassName="group-hover:!bg-[#27272a]"
        onRowClick={(address?: string) =>
          navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address, chain: ChainIds[activeChain] }))
        }
      />
    </div>
  )
}

export default NewPairTable
