import { Token } from '@/@generated/gql/graphql-future.ts'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { APP_PATH, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import { formatAmount, formatVolume } from '@/lib/format'
import { formatMarketValue } from '@/lib/format.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { ChainIds, TransactionType } from '@/types/enums.ts'
import { SmartMoneyTradeHistories } from '@/types/tokenDetail.ts'
import { getFirstAndLastFiveChars } from '@/utils/helpers.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { useGetSmartMonetTradeHistories } from '@hooks/useGetSmartMonetTradeHistories.ts'
import { DataTable } from '@pages/home/data-table.tsx'
import { ColumnDef, Row } from '@tanstack/react-table'
import dayjs from 'dayjs'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { handleRenderChainIcon } from '../monitoring/pc/QuantityRealTimeColumn'
import { Button } from '../ui/button'
import { NAVIGATIONS } from '@/lib/navigations'

interface TxListProps {
  token: Token
  chainId?: ChainIds
  open: boolean
}

interface NormalHeadProps {
  tKey: string
  children?: ReactNode
  onClick?: () => void
}

const NormalHead = (props: NormalHeadProps) => {
  const { tKey, children, onClick } = props
  const { t } = useTranslation()
  return (
    <div className="text-[calc(11rem/16)] flex items-center text-[#FFFFFF80] cursor-pointer w-max" onClick={onClick}>
      {children ?? t('detail.tokenDetail.' + tKey)}
    </div>
  )
}

const handleTextColor = (type: string) => {
  switch (type) {
    case TransactionType.Buy:
    case TransactionType.AddLiquidity:
    case 'Buy':
      return 'text-rise'
    case TransactionType.Sell:
    case TransactionType.RemoveLiquidity:
    case 'Sell':
      return 'text-fall'
    default:
      return 'text-white'
  }
}

const typeChainMap: Record<number, ChainType> = {
  [ChainIds.Solana]: ChainType.Solana,
  [ChainIds.Ethereum]: ChainType.Evm,
  [ChainIds.Bsc]: ChainType.Bsc,
  [ChainIds.Mon]: ChainType.Mon,
}

interface TxListContextType {
  isNative: boolean
  setIsNative: (value: boolean | ((prev: boolean) => boolean)) => void
}

const TxListContext = React.createContext<TxListContextType>({
  isNative: false,
  setIsNative: () => {},
})

const AmountHeader = () => {
  const { t } = useTranslation()
  const { setIsNative } = React.useContext(TxListContext)

  const handleChangeCurrency = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsNative((prev) => !prev)
  }

  return (
    <div
      className="text-[calc(11rem/16)] flex items-center text-[#FFFFFF80] cursor-pointer w-max"
      onClick={handleChangeCurrency}
    >
      {t('detail.tokenDetail.transactionAmount')}
      <Button
        size="xs"
        className="rounded-[6px] bg-transparent text-muted-foreground py-0 px-1 flex gap-1 items-center hover:bg-[#2A2839]"
      >
        <img src="/images/orderBook/icon-refund.svg" className="w-[14px] h-[14px] cursor-pointer" alt="icon refund" />
      </Button>
    </div>
  )
}

const AmountCell = ({ row }: { row: Row<SmartMoneyTradeHistories> }) => {
  const { isNative } = React.useContext(TxListContext)
  const activeChainType = useActiveChainType()
  const { type, nativeAmount } = row.original
  const usdAmount = Number(row.original.usdAmount)

  return (
    <span className={cn(handleTextColor(type), 'flex items-center gap-1')}>
      {isNative ? handleRenderChainIcon(activeChainType) : null}
      {isNative ? formatAmount(nativeAmount) : formatVolume(usdAmount, { showCurrency: true })}
    </span>
  )
}


const transactionInSixHoursColumns: ColumnDef<SmartMoneyTradeHistories>[] = [
  {
    accessorKey: 'timeWalletAddress',
    header: () => <NormalHead tKey="timeWalletAddress" />,
    cell: (props) => {
      const { timestamp, address } = props.row.original

      return (
        <div className="flex flex-col gap-2 text-[calc(1rem*(12/16))] leading-3">
          <span className="text-[#FFFFFFB2]">{dayjs(timestamp).format('YYYY/MM/DD HH:mm:ss')}</span>
          <div className="flex gap-1 items-center">
            <Link
              to={NAVIGATIONS.memeWalletDetail(address)}
              className="hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {getFirstAndLastFiveChars(address)}
            </Link>
            <CopyButton
              icon="/images/icons/icon-copy.webp"
              className="w-[10px] min-w-[10px] h-[10px]"
              text={address}
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'usdAmount',
    header: () => <AmountHeader />,
    cell: (props) => <AmountCell row={props.row} />,
  },
  {
    accessorKey: 'holdingRatio',
    header: () => <NormalHead tKey="holdingRatio" />,
    cell: (props) => {
      const { token, amount } = props.row.original
      const ratio = token?.totalSupply !== 0 ? (Number(amount) * 100) / Number(token?.totalSupply) : Infinity
      return <span>{isFinite(ratio) ? `${ratio < 0.01 ? '<0.01' : fShortenNumber(ratio, 2)}%` : '--'}</span>
    },
  },
  {
    accessorKey: 'marketValue',
    header: () => <NormalHead tKey="marketValueSpecial" />,
    cell: (props) => {
      const { token, usdPrice } = props.row.original
      const marketValue = Number(token?.totalSupply) * Number(usdPrice)
      return <span>{formatMarketValue(marketValue, '$')}</span>
    },
  },
]

const TxListProvider = ({ children }: { children: ReactNode }) => {
  const [isNative, setIsNative] = useState<boolean>(false)
  const value = useMemo(() => ({ isNative, setIsNative }), [isNative])

  return <TxListContext.Provider value={value}>{children}</TxListContext.Provider>
}

const TxListTable = (props: {
  data: SmartMoneyTradeHistories[]
  open: boolean
  handleScroll: () => void
  chainId: ChainIds
}) => {
  const { data, open, handleScroll, chainId } = props

  const getSolscanUrl = useCallback((txHash: string, chainId: ChainIds) => {
    const baseUrls = CHAIN_EXPLORER_TX_URLS[chainId]
    return `${baseUrls}/${txHash}`
  }, [])

  return (
    <div
      className={cn(
        'bg-[#0F0F0F] overflow-auto transition-all relative duration-300 rounded-b-[6px]',
        open ? 'max-h-[522px]' : 'max-h-0',
      )}
      onScroll={handleScroll}
    >
      <DataTable
        columns={transactionInSixHoursColumns}
        data={data}
        isStickyHeader
        onRowClick={(e) => {
          const solscanUrl = getSolscanUrl(e?.transactionHash, chainId)
          window.open(solscanUrl, '_blank', 'noopener,noreferrer')
        }}
        onBottomReached={handleScroll}
        containerClassName="overflow-auto no-scrollbar border-hidden max-h-[522px]"
        tableHeadClassName="text-[calc(11rem/16)] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer bg-[#111]"
        tableCellClassName="text-[calc(13rem/16)] leading-[0.75rem] font-medium break-keep cursor-pointer"
        tableHeaderClassName="border-hidden"
        tableBodyRowClassName="border-hidden hover:bg-[#79778C29]"
      />
    </div>
  )
}

const TxList = (props: TxListProps) => {
  const { token, chainId = ChainIds.Solana, open } = props

  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [txList, setTxList] = useState<SmartMoneyTradeHistories[]>([])

  const { data, loading } = useGetSmartMonetTradeHistories({
    skipCondition: !token?.address || !open,
    limit: LIMIT_PER_PAGE,
    page: page,
    token: {
      chain: typeChainMap[chainId],
      address: token?.address,
    },
  })

  const handleScroll = () => {
    setPage((prevPage) => (hasMore && !loading ? prevPage + 1 : prevPage))
  }

  useEffect(() => {
    if (data && data?.getSmartMoneyTradeHistories) {
      if (page === 1) {
        setTxList(data?.getSmartMoneyTradeHistories)
      } else {
        setTxList((prev) => [...prev, ...data.getSmartMoneyTradeHistories])
      }
      setHasMore(data?.getSmartMoneyTradeHistories?.length === LIMIT_PER_PAGE)
    }
  }, [data, page])

  if (txList.length === 0) return null

  return (
    <TxListProvider>
      <TxListTable data={txList} open={open} handleScroll={handleScroll} chainId={chainId} />
    </TxListProvider>
  )
}

export default TxList
