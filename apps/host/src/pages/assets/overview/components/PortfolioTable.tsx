import { APP_PATH, ARB_NATIVE_TOKENS, BSC_NATIVE_TOKENS, ETH_NATIVE_TOKENS, SOL_NATIVE_TOKENS, MON_NATIVE_TOKENS } from '@/lib/constant.ts'
import { formatPercent } from '@/lib/format'
import { cn, getPath } from '@/lib/utils.ts'
import { ChainIds } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding'
import { BLOCKCHAIN_NAMES, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconNodeAgentUpArrow } from '@components/icon/IconNodeAgent.tsx'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { MemeTokenBalanceCell } from '@pages/assets/overview/components/MemeTokenBalanceCell.tsx'
import { MemeTokenPriceCell } from '@pages/assets/overview/components/MemeTokenPriceCell.tsx'
import { NativeTokenBalanceCell } from '@pages/assets/overview/components/NativeTokenBalanceCell.tsx'
import { NativeTokenIcon } from '@pages/assets/overview/components/NativeTokenIcon.tsx'
import { NativeTokenPriceCell } from '@pages/assets/overview/components/NativeTokenPriceCell.tsx'
import { useNativeTokenPrice } from '@pages/assets/overview/hooks/useNativeTokenPrice.ts'
import { DataTable } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/VirtualizedDataTable.tsx'
import { createContext, useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const checkIsNativeToken = (chainId: ChainIds, tokenAddress: string) => {
  if (chainId === ChainIds.Solana) {
    return SOL_NATIVE_TOKENS.includes(tokenAddress)
  }
  if (chainId === ChainIds.Ethereum) {
    return ETH_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
  if (chainId === ChainIds.Arbitrum) {
    return ARB_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
  if (chainId === ChainIds.Bsc) {
    return BSC_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
  if (chainId === ChainIds.Mon) {
    return MON_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
}

const columns: ColumnDefWithMeta<PortfolioDTO>[] = [
  {
    id: 'token',
    header: () => <Trans i18nKey="assets.overview.portfolio.token" />,
    meta: { style: { flex: 1 } },
    cell: ({ row }) => {
      const token = row.original
      const chainId = token.chainId ? (+token.chainId as ChainIds) : ChainIds.Solana
      const chain = chainId ? BLOCKCHAIN_NAMES[chainId] : '--'
      const isNativeToken = checkIsNativeToken(chainId, token.token)
      return (
        <div className="flex items-center gap-2.5">
          {isNativeToken ? (
            <NativeTokenIcon
              address={token.token}
              chainId={token.chainId}
              fallbackUrl={
                token.symbol === 'USDC'
                  ? '/images/icons/chains/ic-usdc.svg'
                  : (token.logoUrl ?? getBlockChainLogo(chainId, token.token))
              }
            />
          ) : (
            <ChainCurrencyIcon
              currencyIcon={token.logoUrl ?? getBlockChainLogo(chainId, token.token)}
              name={token.symbol}
              chainIcon={getBlockchainLogo2(chainId)}
            />
          )}
          <div className="">
            <div className="text-white text-[calc(14rem/16)] font-[380] flex items-center gap-1">
              {token.symbol}
              {token.isXStock && <IconXStock />}
            </div>
            <div className="text-[#6C6A74] text-[calc(12rem/16)] font-[330]">{chain}</div>
          </div>
        </div>
      )
    },
  },
  {
    id: 'price',
    header: () => <Trans i18nKey="assets.overview.portfolio.price" />,
    meta: { style: { flex: 1 } },
    cell: ({ row }) => {
      const token = row.original
      const isNativeToken = checkIsNativeToken(token.chainId, token.token)
      if (isNativeToken) {
        return <NativeTokenPriceCell token={token} />
      } else {
        return <MemeTokenPriceCell token={token} />
      }
    },
  },
  {
    id: 'balance',
    header: () => <Trans i18nKey="assets.overview.portfolio.balance" />,
    meta: { style: { flex: 1 } },
    cell: ({ row }) => {
      const token = row.original
      const isNativeToken = checkIsNativeToken(token.chainId, token.token)
      if (isNativeToken) {
        return <NativeTokenBalanceCell token={token} />
      } else {
        return <MemeTokenBalanceCell token={token} />
      }
    },
  },
  {
    id: 'ratio',
    header: () => {
      const { sort, setSort } = useContext(PortfolioTableContext)
      return (
        <div className="flex items-center gap-1">
          <Trans i18nKey="assets.overview.portfolio.ratio" />
          <IconNodeAgentUpArrow
            className={cn('size-5 cursor-pointer transition', sort === 'asc' ? 'rotate-0' : 'rotate-180')}
            onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
          />
        </div>
      )
    },
    minSize: 200,
    cell: ({ row }) => {
      const token = row.original
      const { totalBalance } = useContext(PortfolioTableContext)
      const isNativeToken = checkIsNativeToken(token.chainId, token.token)
      const isLowLiquidity = token.lowLiquidity ?? false
      const { t } = useTranslation()
      const nativeTokenPrice = useNativeTokenPrice(token.token, token.chainId, token.price || 0)
      const ratio = useMemo(() => {
        if (isLowLiquidity && !isNativeToken) return 0
        if (isNativeToken) {
          const balance = token.totalBaseAmount * nativeTokenPrice
          if (totalBalance && totalBalance > 0) {
            const ratio = (balance / totalBalance) * 100
            return ratio > 100 ? 100 : ratio
          }
        }
        if (totalBalance && totalBalance > 0) {
          const ratio = (token.totalUsdValue / totalBalance) * 100
          return ratio > 100 ? 100 : ratio
        }
        return 0
      }, [token, totalBalance, isLowLiquidity, isNativeToken])
      return (
        <div className="flex items-center">
          <div className="w-[100px] rounded-full bg-[#79778C29] h-1.5">
            <div className="h-full bg-[#21E09D] rounded-full" style={{ width: `${ratio || 0}%` }} />
          </div>
          <div className="ml-2 text-[calc(14rem/16)] text-[#21E09D] font-semibold">{formatPercent(ratio)}</div>
          {isLowLiquidity && !isNativeToken && (
            <SimpleTooltip content={t('assets.overview.lowLiquidityTokenWarning')}>
              <IconWarning className="size-4 ml-2" />
            </SimpleTooltip>
          )}
        </div>
      )
    },
  },
]

export interface PortfolioTableProps {
  data: PortfolioDTO[]
  isLoading: boolean
  onLoadMore?: () => void
  totalBalance?: number
}

interface PortfolioTableContextState {
  totalBalance: number
  sort: 'asc' | 'desc'
  setSort: (value: 'asc' | 'desc') => void
}

const PortfolioTableContext = createContext<PortfolioTableContextState>({
  totalBalance: 0,
  sort: 'desc' as 'asc' | 'desc',
  setSort: () => {},
})

export const PortfolioTable = (props: PortfolioTableProps) => {
  const { data, isLoading, onLoadMore, totalBalance } = props
  const navigate = useNavigate()
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')

  const handleRowClick = (row: PortfolioDTO) => {
    // Check if token is native
    const { chainId, token } = row
    if (!chainId || !token) return
    const isNativeToken = checkIsNativeToken(+chainId as ChainIds, token)
    if (isNativeToken) return
    const chainType =
      chainId === ChainIds.Ethereum
        ? 'arb'
        : chainId === ChainIds.Arbitrum
          ? 'arb'
          : chainId === ChainIds.Bsc
            ? 'bsc'
            : 'sol'
    const path = row.isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
    navigate(
      getPath(path, {
        chain: chainType,
        address: row.token,
      }),
      { state: { symbol: row.symbol } },
    )
  }

  const contextValue = useMemo(
    () => ({
      totalBalance: totalBalance || 0,
      sort,
      setSort,
    }),
    [totalBalance, sort, setSort],
  )

  const sortedData = useMemo(() => {
    if (sort === 'asc') {
      return [...data].reverse()
    }
    return data
  }, [data, sort])

  return (
    <PortfolioTableContext.Provider value={contextValue}>
      <div>
        <TooltipProvider>
          <DataTable
            data={sortedData}
            columns={columns}
            className="max-h-[683px] overflow-y-scroll no-scrollbar"
            headerClassName="sticky top-0 bg-[#141418] z-[5]"
            headerRowClassName="sticky top-0 bg-[#141418] z-[5] px-3.5"
            rowClassName="px-3"
            isLoading={isLoading}
            rowHeight={62}
            onRowClick={handleRowClick}
            onLoadMore={onLoadMore}
          />
        </TooltipProvider>
      </div>
    </PortfolioTableContext.Provider>
  )
}
