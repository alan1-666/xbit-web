import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@pages/home/data-table.tsx'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { formatPrice, formatSmallNumber, getBlockChainLogo } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import CopyBtn from '@components/common/CopyBtn.tsx'
import { useEffect, useRef, useState } from 'react'
import useTimeAgoGlobal from '@hooks/useTimeAgoGlobal.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { OrderDto } from '@/@generated/gql/graphql-core.ts'
import { f } from 'fintech-number'
import { getNetworkFeeQuery, getOrdersHistoryQuery } from '@/services/order.service'
import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { ChainType } from '@/@generated/gql/graphql-user'
import { APP_PATH } from '@/lib/constant'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'

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

let columns: ColumnDef<OrderDto>[] = [
  {
    header: '币种/时间',
    cell: ({ row }) => {
      const chain: ChainIds = row.original?.chainId as unknown as ChainIds
      const createdAt = row.original?.createdAt

      const name = row.original?.baseSymbol
      const logoUrl = getBlockChainLogo(chain, '')

      return (
        <div className="flex items-center gap-[5px] min-w-[200px]">
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
              <div>{dayjs(createdAt).format('YYYY-MM-DD')}</div>
              <div>{dayjs(createdAt).format('HH:mm')}</div>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    // accessorKey: 'chain', 2
    header: '方向',
    cell: ({ row }) => {
      return (
        <div>
          {row.original?.transactionType === 'Buy' ? (
            <span className="text-[#00FFB4]">买入</span>
          ) : (
            <span className="text-[#AB57FF]">卖出</span>
          )}
        </div>
      )
    },
  },
  {
    header: '成交额',
    cell: ({ row }) => {
      const createdTime = row.original?.createdTime

      return <AgeCountdown createdTime={createdTime ?? undefined} />
    },
  },
  {
    header: '盈亏',
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
    header: '成交价',
    cell: ({ row }) => {
      const openPrice = row.original?.openPrice
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: `${formatPrice(Number(openPrice))}`,
          }}
        />
      )
    },
  },
  {
    header: '成交量',
    cell: ({ row }) => {
      const baseAmount = row.original?.baseAmount ?? '--'
      return <div>{baseAmount}</div>
    },
  },
  {
    header: 'Gas费',
    cell: ({ row }) => {
      return <div>--</div>
    },
  },
  {
    header: '滑点损失',
    cell: ({ row }) => {
      const value = row.original?.slippage ?? '--'
      return <div>{value}</div>
    },
  },
  {
    header: '防夹费(MEV)',
    cell: ({ row }) => {
      const value = row.original?.mevProtect ?? '--'
      return <div>{value}</div>
    },
  },
  {
    id: 'priorityFee',
    header: '优先费',
    cell: ({ row }) => {
      const value = row.original?.priorityFeePrice ?? '--'
      return <div>{value}</div>
    },
  },
  {
    header: 'Pump(内盘1%)',
    cell: ({ row }) => {
      const value = '--'
      return <div>{value}</div>
    },
  },
  {
    header: 'XBIT费(1%)',
    cell: ({ row }) => {
      const value = '--'
      return <div>{value}</div>
    },
  },
  {
    header: '交易哈希',
    cell: ({ row }) => {
      const value = row.original?.txId
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

const TransactionHistoryDemo = ({ tableContainerClassName }: NewPairTableProps) => {
  const [pairsData, setPairsData] = useState<OrderDto[]>([])
  // const pairIdsRef = useRef<string[]>([])
  const refetchTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  //   const { message } = useSubscription(['public/pairs/new'])
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const [params] = useSearchParams()
  const isDebug = params.get('debug') === '1'
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)
  const address = activeWallet?.walletAddress
  const { data: networkFeeData } = useQuery(getNetworkFeeQuery, {
    variables: {
      input: { chain: activeChain === TYPE_CHAIN?.ETH ? ChainType.Evm : ChainType.Solana },
    },
    // skip: !orderSettingOpen,
  })

  const maxcomputeUnit = networkFeeData?.getNetworkFee?.solana?.maxComputeUnits

  if (maxcomputeUnit) {
    console.log({ maxcomputeUnit })
    columns = columns.map((column) => {
      if (column.id === 'priorityFee') {
        return {
          ...column,
          cell: ({ row }) => {
            const value = row.original?.priorityFeePrice ? Number(row.original?.priorityFeePrice) : 0
            const fee = f((value * maxcomputeUnit) / Math.pow(10, 15), { decimal: 6 })
            return <div>{fee}</div>
          },
        }
      }
      return column
    })
  }

  console.log({ networkFeeData })
  useEffect(() => {
    console.log({ pairsData })
  }, [pairsData])

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
      userAddress: address,
    }

    const pairsListResponse = await gqlClient.query({
      query: getOrdersHistoryQuery,
      variables: {
        input: queryInput,
      },
    })

    const pairsData = pairsListResponse?.data?.orderHistory ?? []
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
      }, 5000)
    }

    return () => {
      isMounted = false
      clearInterval(refetchTimerRef.current)
    }
  }, [activeChain])

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        data={pairsData.slice(0, 50)}
        isStickyHeader
        // isStickyFirstColumn
        stickyBg="rgb(23,24,27)"
        containerClassName={cn('max-h-[60vh] mb-[50px]', tableContainerClassName)}
        tableClassName="bg-[rgb(69, 72, 82)]"
        tableHeaderClassName="bg-[rgb(23,24,27)]"
        tableHeaderRowClassName="border-b-[1px] border-b-[rgb(38,40,44)] text-[12px] text-[rgb(92,96,104)] sticky top-0"
        tableHeadClassName="app-font-light px-[7px] py-[3px] items-center justify-center min-w-[80px]"
        tableBodyClassName="min-h-[500px] h-[500px]"
        tableBodyRowClassName="cursor-pointer group"
        tableCellClassName="group-hover:!bg-[#27272a]"
        onRowClick={(address?: string) =>
          navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: address!, chain: activeChain }))
        }
      />
    </div>
  )
}

export default TransactionHistoryDemo
