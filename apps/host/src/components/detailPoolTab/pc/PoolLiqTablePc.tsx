import { DexScreenPoolDto } from '@/@generated/gql/graphql-core.ts'
import { TokenPoolInfo } from '@/@generated/gql/graphql-future.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS } from '@/lib/constant.ts'
import { formatAmount, formatVolume } from '@/lib/format'
import { getDex, getDexLogo } from '@/utils/lauchpad.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { Loading } from '@components/common/Loading.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { useTokenPools } from '@hooks/useTokenPools.ts'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { isValidEvmAddress, isValidSolAddress } from '@/lib/blockchain.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { useActiveChainId } from '@/hooks/useActiveChain'

type PoolLiqTablePcProps = {
  token: string
  chainId: number
}

const PoolLiqTablePc = (props: PoolLiqTablePcProps) => {
  const { t } = useTranslation()
  const activeChainId = useActiveChainId()

  const { token, chainId } = props
  const { data: tokenPools, hasNextPage, isFetchingNextPage, fetchNextPage, isFetching } = useTokenPools(token, chainId)
  const isAddress = (address: string) => isValidSolAddress(address) || isValidEvmAddress(address)

  const poolColumns: ColumnDef<TokenPoolInfo>[] = [
    {
      accessorKey: 'token',
      header: () => (
        <div className="min-w-[120px] text-[11px] leading-[1] font-normal text-[#FFFFFF]/50">
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

        const isDexAddress = isAddress(dex)
        const dexLabel = isDexAddress ? formatAddressWallet(dex) : (dexInfo?.label ?? dex)

        return (
          <div className="flex min-w-[120px] items-center gap-2">
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
            ) : <div className="w-5 h-5"></div>}

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center text-[14px] leading-[1] font-normal text-white">
                <span>{baseSymbol}</span>
                <span>/</span>
                <span>{quoteSymbol}</span>
              </span>

              <span className="flex items-center text-[12px] leading-[1] font-light text-white/70">
                <span>{dexLabel}</span>
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'totalLiquidity',
      header: () => (
        <div className="w-fit min-w-[70px] text-[11px] leading-3 font-normal tracking-[0.28px] text-[#FFFFFF]/50">
          {t('liquidityChart.totalLiquidity')}
        </div>
      ),
      cell: ({ row }) => {
        const poolTransaction = row?.original as DexScreenPoolDto
        const totalLiquidity = poolTransaction?.usdLiquidity ?? '--'

        return (
          <div className="flex min-w-[70px] flex-col justify-center gap-2">
            <span className="text-[14px] leading-[1] font-normal text-white">
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
        <div className="flex min-w-[100px] items-center justify-end text-[11px] leading-3 font-normal tracking-[0.28px] text-[#FFFFFF]/50">
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
          <div className="flex min-w-[100px] flex-col gap-1.5">
            <div className="flex items-center justify-end gap-0.5">
              <span className="text-[14px] leading-[1] font-light text-white">{formatAmount(quoteLiquidity)}</span>
              <span className="text-[13px] leading-[1] font-light text-white/50">{quoteSymbol}</span>
            </div>
            <div className="flex items-center justify-end gap-0.5">
              <span className="text-[14px] leading-[1] font-light text-white">{formatAmount(baseLiquidity)}</span>
              <span className="text-[13px] leading-[1] font-light text-white/50">{baseSymbol}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'address',
      header: () => (
        <div className="flex min-w-[100px] items-center justify-end text-[11px] leading-3 font-normal tracking-[0.28px] text-[#FFFFFF]/50">
          {t('detail.pool.poolAddress')}
        </div>
      ),
      cell: ({ row }) => {
        const poolTransaction = row?.original as DexScreenPoolDto
        const address = poolTransaction?.address ?? '--'
        const shortAddress = address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''

        return (
          <div className="flex min-w-[120px] items-center justify-end gap-1 text-white">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${CHAIN_EXPLORER_ADDRESS_URLS[chainId]}/${address}`} // Use CHAIN_EXPLORER_ADDRESS_URLS here
              className="truncate text-end text-[14px] leading-[1] underline underline-offset-1"
            >
              {shortAddress}
            </a>
            <CopyButton icon="/images/icons/ic-copy2.svg" text={address} className="size-4" />
          </div>
        )
      },
    },
    {
      accessorKey: 'creator',
      header: () => (
        <div className="flex min-w-[100px] items-center justify-end text-[11px] leading-3 font-normal tracking-[0.28px] text-[#FFFFFF]/50">
          {t('detail.pool.creator')}
        </div>
      ),
      cell: ({ row }) => {
        const poolTransaction = row?.original as TokenPoolInfo
        const creator = poolTransaction?.creator ?? ''
        const shortAddress = creator ? `${creator.slice(0, 5)}...${creator.slice(-5)}` : '--'
        const createdTime = poolTransaction?.createdTime
          ? dayjs(poolTransaction?.createdTime * 1000).format('YYYY-MM-DD HH:mm')
          : poolTransaction?.createdAt
            ? dayjs(poolTransaction?.createdAt).format('YYYY-MM-DD HH:mm')
            : '--'

        if (createdTime === '--' && creator === '') {
          return <div className="min-w-[120px] text-end text-[13px] leading-[1] text-white">--</div>
        }

        return (
          <div className="min-w-[120px] text-[13px] leading-[1] text-white">
            <div className="flex items-center justify-end gap-1">
              {shortAddress === '--' ? (
                <div className="min-w-[120px] text-end text-[13px] leading-[1] text-white">--</div>
              ) : (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${CHAIN_EXPLORER_ADDRESS_URLS[chainId]}/${creator}`}
                  className="truncated text-end text-[14px] leading-[1]"
                >
                  {shortAddress}
                </a>
              )}
              {creator && <CopyButton icon="/images/icons/ic-copy2.svg" text={creator} className="size-4" />}
            </div>
            <div className="mt-1.5 flex items-center justify-end gap-1 text-[#FFFFFF80]">{createdTime}</div>
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
    <div className="mt-6 h-full">
      <DataTableInfiniteScroll
        columns={poolColumns}
        data={tokenPools || []}
        isLoading={false}
        hasMore={hasNextPage}
        fetchMore={loadMorePools}
        tableProps={{
          isStickyHeader: true,
          containerClassName: 'border-0 select-none max-h-[calc(100vh-375px)]',
          tableHeaderRowClassName: '!border-0 whitespace-nowrap !bg-[#121214]',
          tableHeaderClassName: 'border-0 text-[#FFFFFF80] text-[11px] z-10 leading-3 app-font-medium',
          tableHeadClassName: 'pl-0 pr-2 first:pl-4 last:pr-4',
          tableCellClassName: 'pl-0 pr-2 first:pl-4 last:pr-4',
          tableBodyRowClassName: 'even:bg-[#ECECED0A]',
        }}
      />
      <div ref={loadMoreRef} className="h-[1px]" />
      {isFetching && hasNextPage && (
        <div className="flex h-10 items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  )
}

export default PoolLiqTablePc
