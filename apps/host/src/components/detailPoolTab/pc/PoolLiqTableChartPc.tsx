import { DexScreenPoolDto } from '@/@generated/gql/graphql-core.ts'
import { TokenPoolInfo } from '@/@generated/gql/graphql-future.ts'
import { formatAmount, formatVolume } from '@/lib/format'
import { ChainIds } from '@/types/enums.ts'
import { getDex, getDexLogo } from '@/utils/lauchpad.ts'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { useTokenPools } from '@hooks/useTokenPools.ts'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

type PoolLiqTableChartPcProps = {
  token: string
  chainId: ChainIds
}

const PoolLiqTableChartPc = (props: PoolLiqTableChartPcProps) => {
  const { token, chainId } = props
  const { t } = useTranslation()
  const { data: tokenPools, hasNextPage, isFetchingNextPage, fetchNextPage } = useTokenPools(token, chainId)
  const activeChainId = useActiveChainId()

  const poolColumns: ColumnDef<TokenPoolInfo>[] = [
    {
      accessorKey: 'index',
      header: () => <div className="text-white/70 text-[11px] font-light leading-[1] min-w-[16px]">#</div>,
      cell: ({ row }) => (
        <div className="text-white/70 text-[11px] font-light leading-[1] min-w-[16px]">{Number(row?.index) + 1}</div>
      ),
    },
    {
      accessorKey: 'token',
      header: () => (
        <div className="text-[11px] leading-[1] font-normal text-[#FFFFFF]/50 min-w-[120px]">
          {t('liquidityChart.fundPool')}
        </div>
      ),
      cell: ({ row }) => {
        const poolTransaction = row?.original as DexScreenPoolDto
        const dex = poolTransaction?.dex ?? ''
        const dexIcon = getDexLogo(dex)
        const baseSymbol = poolTransaction.baseSymbol ?? '--'
        const quoteSymbol = poolTransaction?.quoteSymbol ?? '--'
        const dexInfo = dex ? getDex(dex) : null

        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            {dexIcon && <img src={dexIcon} className="w-5 h-5 rounded-full" alt="token" />}
            {row.original.dex ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <LaunchPlatformIcon
                      value={row.original.dex}
                      className={'rounded-full !size-4 !pointer-event-auto'}
                      chainId={activeChainId}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#191919] text-white">{row.original.dex}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="w-4 h-4"></div>
            )}
            <div className="flex flex-col gap-1.5">
              <span className={'flex items-center text-white text-[12px] font-normal leading-[1]'}>
                <span>{quoteSymbol}</span>
                <span>/</span>
                <span>{baseSymbol}</span>
              </span>
              <span className="flex items-center text-white/70 text-[11px] font-light leading-[1]">
                <span>{dexInfo?.label ?? dex}</span>
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'totalLiquidity',
      header: () => (
        <div className="text-[11px] leading-3 tracking-[0.28px] font-normal text-[#FFFFFF]/50 min-w-[70px] w-fit">
          {t('liquidityChart.totalLiquidity')}
        </div>
      ),
      cell: ({ row }) => {
        const poolTransaction = row?.original as DexScreenPoolDto
        const totalLiquidity = poolTransaction?.usdLiquidity ?? '--'

        return (
          <div className="flex flex-col justify-center gap-2 min-w-[70px]">
            <span className="text-white text-[12px] font-normal leading-[1]">
              {formatVolume(totalLiquidity, {
                showCurrency: true,
              })}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'liquidity',
      header: () => (
        <div className="text-[11px] leading-3 tracking-[0.28px] font-normal text-[#FFFFFF]/50 min-w-[100px] flex items-center justify-end">
          {t('liquidityChart.quantity')}
        </div>
      ),
      cell: ({ row }) => {
        const poolTransaction = row?.original as DexScreenPoolDto
        const baseSymbol = poolTransaction?.baseSymbol ?? '--'
        const quoteSymbol = poolTransaction?.quoteSymbol ?? '--'
        const baseLiquidity = poolTransaction?.baseTokenLiquidity ?? '--'
        const quoteLiquidity = poolTransaction?.quoteLiquidity ?? '--'

        return (
          <div className="flex flex-col gap-1.5 min-w-[100px]">
            <div className="flex items-center justify-end gap-0.5">
              <span className="text-[12px] leading-[1] text-white font-light">{formatAmount(quoteLiquidity)}</span>
              <span className="text-[12px] leading-[1] text-white/50 font-light">{quoteSymbol}</span>
            </div>
            <div className="flex items-center justify-end gap-0.5">
              <span className="text-[12px] leading-[1] text-white font-light">{formatAmount(baseLiquidity)}</span>
              <span className="text-[12px] leading-[1] text-white/50 font-light">{baseSymbol}</span>
            </div>
          </div>
        )
      },
    },
  ]

  const loadMorePools = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(console.error)
    }
  }

  return (
    <>
      <DataTableInfiniteScroll
        columns={poolColumns}
        data={tokenPools || []}
        isLoading={false}
        hasMore={hasNextPage}
        fetchMore={loadMorePools}
        tableProps={{
          isStickyHeader: true,
          containerClassName: 'border-0 select-none max-h-[300px]',
          tableHeaderRowClassName: '!border-0 whitespace-nowrap bg-background',
          tableHeaderClassName: 'border-0 text-[#FFFFFF80] text-[11px] z-10 leading-3 app-font-medium',
          tableHeadClassName: 'pl-0 pr-2',
          tableCellClassName: 'pl-0 pr-2',
          tableBodyRowClassName: 'border-b-[0.5px] border-[#ECECED08]',
        }}
      />
    </>
  )
}

export default PoolLiqTableChartPc
