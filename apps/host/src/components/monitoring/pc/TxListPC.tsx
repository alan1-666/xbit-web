import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { useSmartMonetTradeHistories } from '@hooks/useGetSmartMonetTradeHistories.ts'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
import { ChainIds, TransactionType } from '@/types/enums.ts'
import { cn } from '@/lib/utils.ts'
import { DataTable } from '@pages/home/data-table.tsx'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { getFirstAndLastFiveChars } from '@/utils/helpers.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { formatMarketValue } from '@/lib/format.ts'
import { useTranslation } from 'react-i18next'
import { SmartMoneyTradeHistoryResp, Token } from '@/@generated/gql/graphql-future.ts'
import { APP_PATH, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import FormatedValue from '@components/common/FormatedValue.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { IconSolana } from '@components/icon/IconSolana.tsx'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { Link } from 'react-router-dom'
import { formatPrice, formatAmount, formatVolume, formatPercent, formatBalance } from '@/lib/format'

interface TxListProps {
  token: Token
  chainId?: ChainIds
  open: boolean
}

interface NormalHeadProps {
  tKey: string
  children?: ReactNode
  onClick?: () => void
  className?: string
}

interface TxListContextState {
  unit: 'usd' | 'native'
  toggleUnitSwitcher: () => void
}

const TxListContext = createContext<TxListContextState>({
  unit: 'usd',
  toggleUnitSwitcher: () => {},
})

const NormalHead = (props: NormalHeadProps) => {
  const { tKey, children, onClick, className } = props
  const { t } = useTranslation()
  return (
    <div
      className={cn('text-[calc(11rem/16)] flex items-center text-[#FFFFFF80] cursor-pointer w-max', className)}
      onClick={onClick}
    >
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

const getSolscanUrl = (txHash: string, chainId: ChainIds) => {
  const baseUrls = CHAIN_EXPLORER_TX_URLS[chainId]
  return `${baseUrls}/${txHash}`
}
const TxList = (props: TxListProps) => {
  const { token, chainId = ChainIds.Solana, open } = props

  const [unit, setUnit] = useState<'usd' | 'native'>('usd')

  const contextValue = useMemo(() => {
    return {
      unit,
      toggleUnitSwitcher: () => setUnit((prev) => (prev === 'usd' ? 'native' : 'usd')),
    }
  }, [unit])

  const handleRenderIcon = () => {
    switch (chainId) {
      case ChainIds.Bsc:
        return <img src="/images/icons/ic-bsc.png" alt="icon bsc" className="w-3 h-3" />
      case ChainIds.Solana:
        return <IconSolana />
      case ChainIds.Mon:
        return <img src="/images/icons/chains/ic-monad.svg" alt="icon mon" className="w-3 h-3" />   
      default:
        return <IconSolana />
    }
  }

  const {
    data,
    isLoading: loading,
    loadMore,
  } = useSmartMonetTradeHistories({
    enabled: !token?.address || !open,
    token: {
      chain: typeChainMap[chainId] || ChainType.Solana,
      address: token?.address,
    },
  })

  const transactionInSixHoursColumns: ColumnDef<SmartMoneyTradeHistoryResp, any>[] = [
    {
      accessorKey: 'timeWalletAddress',
      header: () => <NormalHead tKey="timeWalletAddress" />,
      cell: (props) => {
        const { timestamp, address, avatar, name } = props.row.original
        const targetUrl = `${APP_PATH.MEME_WALLET}/${address}`

        return (
          <div className="flex flex-col gap-2 text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]">
            <span className="text-white/50 font-normal">{dayjs(timestamp).format('MM/DD HH:mm')}</span>
            <div className="flex gap-1 items-center">
              <ChainCurrencyIcon
                currencyIcon={avatar}
                avatarClassName="flex items-center justify-center size-3.5 rounded-full m-0"
                avatarImageClassName="w-full h-full"
                fallbackImageEnable
                fallbackNFT={address}
              />
              <Link
                to={targetUrl}
                target="_blank"
                className="hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(targetUrl, '_blank')
                }}
              >
                {name ? listCoinHelper.formatWalletNameWithEllipsis(name) : getFirstAndLastFiveChars(address)}
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
      header: () => {
        const { toggleUnitSwitcher } = useContext(TxListContext)
        const { t } = useTranslation()
        return (
          <div className="flex items-center gap-0.5">
            <NormalHead tKey="transactionAmount" />
            <SimpleTooltip content={t('monitoring.tooltip.switchUnit')}>
              <img
                src="/images/orderBook/icon-refund.svg"
                className="size-3.5 cursor-pointer"
                alt=""
                onClick={() => toggleUnitSwitcher()}
              />
            </SimpleTooltip>
          </div>
        )
      },
      cell: (props) => {
        const { type, nativeAmount } = props.row.original
        const usdAmount = Number(props.getValue())
        const { unit } = useContext(TxListContext)

        return (
          <div className={cn(handleTextColor(type), 'flex items-center gap-1')}>
            {unit === 'native' && handleRenderIcon()}
            {formatVolume(unit === 'usd' ? usdAmount : nativeAmount, {
              showCurrency: unit === 'usd' ? true : false,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'holdingRatio',
      header: () => <NormalHead tKey="holdingRatio" />,
      cell: (props) => {
        const { token, amount } = props.row.original
        const ratio = token?.totalSupply !== 0 ? (Number(amount) * 100) / Number(token?.totalSupply) : Infinity
        if (ratio < 0.01) return <span className="!text-[13px]">{'<' + '0.01%'}</span>
        return (
          <>
            <span className={'!text-[13px]'}>
              {formatPercent(ratio, {
                showSmallAsAngleBracket: true,
              })}
            </span>
          </>
        )
      },
    },
    {
      accessorKey: 'marketValue',
      header: () => <NormalHead tKey="marketValueSpecial" className="justify-end w-full" />,
      cell: (props) => {
        const { token, usdPrice } = props.row.original
        const marketValue = Number(token?.totalSupply) * Number(usdPrice)
        return (
          <>
            <span>{formatVolume(marketValue)}</span>
          </>
        )
      },
    },
  ]

  const txList = useMemo(() => {
    if (!data?.pages) return []
    const list = data.pages.flat()
    return list ? list : []
  }, [data])

  const handleScroll = () => {
    loadMore()
  }

  return (
    <TxListContext.Provider value={contextValue}>
      <TooltipProvider>
        <div
          className={cn(
            'bg-[#232329] overflow-auto transition-all relative duration-300 rounded-b-[6px]',
            open ? 'max-h-[522px]' : 'max-h-0',
          )}
          onScroll={handleScroll}
        >
          <DataTable
            columns={transactionInSixHoursColumns}
            data={txList}
            isStickyHeader
            onRowClick={(e) => {
              const solscanUrl = getSolscanUrl(e?.transactionHash, chainId)
              window.open(solscanUrl, '_blank', 'noopener,noreferrer')
            }}
            isLoading={loading}
            onBottomReached={handleScroll}
            containerClassName="overflow-auto no-scrollbar border-hidden max-h-[400px]"
            tableHeadClassName="text-[calc(11rem/16)] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer bg-[#232329] rounded-none last:text-right"
            tableCellClassName="text-[calc(13rem/16)] leading-[0.75rem] font-medium break-keep cursor-pointer last:text-right"
            tableHeaderClassName="border-hidden"
            tableBodyRowClassName="border-hidden bg-[#232329] even:bg-[#ECECED]/4 hover:bg-[#ECECED]/10"
          />
        </div>
      </TooltipProvider>
    </TxListContext.Provider>
  )
}

export default TxList
