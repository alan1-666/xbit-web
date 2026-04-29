import { DexScreenPoolDto, TransactionDto } from '@/@generated/gql/graphql-core.ts'
import { TokenPoolInfo } from '@/@generated/gql/graphql-future.ts'
import { formatAmount, formatVolume } from '@/lib/format'
import { ChainIds } from '@/types/enums.ts'
import { getDex, getDexLogo } from '@/utils/lauchpad.ts'
import { Loading } from '@components/common/Loading.tsx'
import useGetLiquidityPool from '@hooks/useGetLiquidityPool.ts'
import { useHourlyTrigger } from '@hooks/useHourlyTrigger.ts'
import { useTokenPools } from '@hooks/useTokenPools.ts'
import { ColumnDef } from '@tanstack/react-table'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AppDrawer from '../common/AppDrawer'
import { DataTableInfiniteScroll } from '../ui/XTableInfiniteScroll'
import LiquidityChart from './LiquidityChart'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'

interface LiquidityChartDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  liquidity?: number
  numberOfPools?: number
  transactions: TransactionDto[]
  token: string
  chainId: ChainIds
}

const LiquidityChartDrawer: React.FC<LiquidityChartDrawerProps> = ({
  isOpen,
  onOpenChange,
  liquidity: _liquidity = 0,
  numberOfPools: _numberOfPools = 0,
  transactions: _transactions,
  token,
  chainId,
}) => {
  const { t } = useTranslation()
  const activeChainId = useActiveChainId()
  const { data, refetch } = useGetLiquidityPool({ pageSize: 48, page: 1, token, chainId })
  const { data: tokenPools, hasNextPage, isFetchingNextPage, fetchNextPage } = useTokenPools(token, chainId)

  useHourlyTrigger(() => {
    refetch().catch(console.error)
  })

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
            {row.original.dex ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <LaunchPlatformIcon
                      value={row.original.dex}
                      className={'rounded-full !size-5 !pointer-event-auto'}
                      chainId={activeChainId}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#191919] text-white">{row.original.dex}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="w-5 h-5"></div>
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

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMorePools = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(console.error)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePools()
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    )
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [loadMoreRef.current])

  return (
    <AppDrawer
      open={isOpen}
      setOpen={(value) => {
        if (typeof value === 'function') {
          onOpenChange(value(isOpen))
        } else {
          onOpenChange(value)
        }
      }}
      title={t('liquidityChart.totalLiquidity')}
      maxHeight="85vh"
      drawerClassName="!bg-none !bg-[#232329] border-[#2A2D33]"
      drawerContentClassName="relative"
      drawerContent={
        <div>
          <LiquidityChart data={data?.getLiquidityChart ?? []} />

          <div className="mt-3">
            <h4 className="text-white text-lg font-light mb-4">{t('liquidityChart.fundPool')}</h4>
            <DataTableInfiniteScroll
              columns={poolColumns}
              data={tokenPools || []}
              isLoading={false}
              hasMore={hasNextPage}
              tableProps={{
                isStickyHeader: true,
                containerClassName: 'border-0 select-none',
                tableHeaderRowClassName: '!border-0 whitespace-nowrap !bg-[#232329]',
                tableHeaderClassName: 'border-0 text-[#FFFFFF80] text-[11px] z-10 leading-3 app-font-medium',
                tableHeadClassName: 'pl-0 pr-2',
                tableCellClassName: 'pl-0 pr-2',
                tableBodyRowClassName: 'border-b-[0.5px] border-[#ECECED08]',
              }}
            />
            <div ref={loadMoreRef} className="h-[1px]" />
            {hasNextPage && (
              <div className="flex items-center justify-center h-10">
                <Loading />
              </div>
            )}
          </div>
        </div>
      }
    />
  )
}

export default LiquidityChartDrawer
