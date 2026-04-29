import { TokenCreatedByDevDataDto } from '@/@generated/gql/graphql-meme2.ts'
import { ColumnDefWithMeta, DataTable, DataTableProps } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { Trans, useTranslation } from 'react-i18next'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import dayjs from 'dayjs'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { TokenAvatar } from '@components/discover/cards/TokenAvatar.tsx'
import { APP_PATH, CHAIN_IMAGE_URLS, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { Link } from 'react-router-dom'
import { cn, getPath } from '@/lib/utils.ts'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
// import { useEffect, useRef } from 'react'

export interface DevTokensTableProps extends Omit<DataTableProps<TokenCreatedByDevDataDto>, 'data' | 'columns'> {
  tokens: TokenCreatedByDevDataDto[]
  isLoading?: boolean
  onLoadMore?: () => void
}

const columns: ColumnDefWithMeta<TokenCreatedByDevDataDto>[] = [
  {
    id: 'token',
    header: () => <Trans i18nKey="detail.devProjects.token" />,
    meta: {
      style: { flex: 1, minWidth: 300 },
    },
    cell: ({ row }) => {
      const token = row.original
      const { t } = useTranslation()
      const activeChainId = useActiveChainId() || ChainIds.Solana
      return (
        <div className="flex items-center gap-2">
          <TokenAvatar
            tokenAvatar={token.logoUrl}
            name={token.symbol}
            chainLogo={CHAIN_IMAGE_URLS[activeChainId ?? ChainIds.Solana]}
            className="size-10"
          />
          <div>
            <Link
              to={getPath(APP_PATH.MEME_TOKEN_DETAIL, { chain: CHAIN_SYMBOLS[activeChainId], address: token.address })}
            >
              <div className="font-[380]">{token.symbol}</div>
            </Link>
            <div className="flex items-center gap-1 text-[rgba(255,255,255,0.7)] font-[330] text-[12px]">
              <span className="leading-3">{formatAddressWallet(token.address)}</span>
              <TooltipProvider>
                <SimpleTooltip content={t('listCoin.tooltip.copyAddress')}>
                  <div>
                    <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center" text={token.address} type="tokenAddress" />
                  </div>
                </SimpleTooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: 'createdAt',
    minSize: 180,
    header: () => <Trans i18nKey="detail.devProjects.issueDate" />,
    cell: ({ row }) => {
      const token = row.original
      return <div>{dayjs(token.createdAt).format('YYYY/MM/DD HH:mm')}</div>
    },
  },
  {
    id: 'status',
    header: () => <Trans i18nKey="detail.devProjects.status" />,
    cell: ({ row }) => {
      const token = row.original
      const { t } = useTranslation()
      return (
        <div>
          {token.rug ? 'Rug' : t('detail.devProjects.alive')}
          {token.migratedAt ? ` | ${t('detail.devProjects.migrated')}` : ''}
        </div>
      )
    },
  },
  {
    id: 'rugTime',
    meta: { style: { flex: 1, maxWidth: 200, minWidth: 150 } },
    header: () => <Trans i18nKey="detail.devProjects.rugTime" />,
    cell: ({ row }) => {
      const token = row.original
      return <div>{token.rugTime ? dayjs(token.rugTime).format('YYYY/MM/DD HH:mm') : '--'}</div>
    },
  },
  {
    id: 'marketCap',
    header: () => <Trans i18nKey="detail.devProjects.marketcap" />,
    cell: ({ row }) => {
      return (
        <div>
          <MarketDisplay value={row.original.marketCap || 0} showColor />
        </div>
      )
    },
  },
  {
    id: 'age',
    header: () => <Trans i18nKey="detail.devProjects.tokenAge" />,
    cell: ({ row }) => {
      const token = row.original
      return <TokenAge createdTime={token.createdAt} className="text-[calc(14rem/16)] font-[380]" />
    },
  },
]

export const DevTokensTable = (props: DevTokensTableProps) => {
  const { tokens, isLoading, onLoadMore, ...rest } = props
  // const ref = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       // console.log('entries', entries)
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           // console.log('load more triggered')
  //           onLoadMore?.()
  //         }
  //       })
  //     },
  //     {
  //       root: null,
  //       rootMargin: '0px',
  //       threshold: 1.0,
  //     },
  //   )
  //
  //   if (ref.current) {
  //     observer.observe(ref.current)
  //   }
  //
  //   return () => {
  //     if (ref.current) {
  //       observer.unobserve(ref.current)
  //     }
  //   }
  // }, [onLoadMore])

  return (
    <>
      <DataTable
        data={tokens}
        columns={columns}
        className={cn(
          'h-full max-h-[calc(100vh-320px)] overflow-auto relative min-h-50',
          tokens.length === 0 ? 'no-scrollbar' : '',
        )}
        headerClassName="sticky top-0 z-5 bg-[#121214]"
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        noDataComponent={<></>}
        {...rest}
      />
      {!isLoading && tokens.length === 0 && (
        <div className="absolute inset-x-0 top-0 pointer-events-none">
          <EmptyList />
        </div>
      )}
    </>
  )
}
