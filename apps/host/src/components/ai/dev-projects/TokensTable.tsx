import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getPath } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import dayjs from 'dayjs'
import { fShortenNumber } from '@/lib/number.ts'
import { DurationDisplay } from '@components/common/FormattingDisplay.tsx'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { TokenCreatedByDevDataDto } from '@/@generated/gql/graphql-meme2.ts'

const TokenAge = (props: { createdTime: string }) => {
  const { createdTime } = props
  const [age, setAge] = useState(dayjs().unix() - dayjs(createdTime).unix())

  useEffect(() => {
    const iv = setInterval(() => {
      const currentAge = dayjs().unix() - dayjs(createdTime).unix()
      setAge(currentAge)
    }, 1000)
    return () => {
      clearInterval(iv)
    }
  }, [createdTime])

  return <DurationDisplay value={age} className="text-[calc(1rem*(13/16))] leading-[1]" allowOverrideStyle={false} />
}

const Head = (props: { tKey: string }) => {
  const { tKey } = props
  const { t } = useTranslation()
  return <span className="text-[calc(11rem/16)] text-[#FFFFFF80] whitespace-nowrap break-keep">{t(tKey)}</span>
}

const columns: ColumnDef<TokenCreatedByDevDataDto>[] = [
  {
    accessorKey: 'symbol',
    header: () => <Head tKey="detail.devProjects.token" />,
    cell: ({ row }) => {
      const token = row.original
      const tokenLogo = token.avatar ?? ''

      return (
        <Link
          to={getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token.address, chain: CHAIN_SYMBOLS[ChainIds.Solana] })}
          className="text-[#1890FF] underline text-[calc(13rem/16)]"
          target="_blank"
          rel="noopener noreferrer"
          state={{
            address: token.address,
            chain: CHAIN_SYMBOLS[ChainIds.Solana],
            symbol: token.symbol,
            tokenLogo,
            createdTime: token.createdAt,
          }}
        >
          {token.symbol}
        </Link>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => <Head tKey="detail.devProjects.issueDate" />,
    cell: ({ row }) => {
      const token = row.original
      return <div className="text-[calc(13rem/16)] min-w-32">{dayjs(token.createdAt).format('YYYY/MM/DD HH:mm')}</div>
    },
  },
  {
    accessorKey: 'status',
    header: () => <Head tKey="detail.devProjects.status" />,
    cell: ({ row }) => {
      const { t } = useTranslation()
      const token = row.original
      const status = useMemo(() => {
        if (token.rug) {
          if (token.migratedAt) {
            return `Rug | ${t('detail.devProjects.migrated')}`
          }
          return 'Rug'
        }
        if (token.migratedAt) {
          return t('detail.devProjects.migrated')
        }
        return t('detail.devProjects.alive')
      }, [token, t])

      return (
        <div className="text-[calc(13rem/16)] whitespace-nowrap break-keep">
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: 'rugTime',
    header: () => <Head tKey="detail.devProjects.rugTime" />,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div className="text-[calc(13rem/16)] min-w-32">
          {token.rugTime ? dayjs(token.rugTime).format('YYYY/MM/DD HH:mm') : '--'}
        </div>
      )
    },
  },
  {
    accessorKey: 'marketcap',
    header: () => <Head tKey="detail.devProjects.marketcap" />,
    cell: ({ row }) => {
      return <span className="text-[calc(13rem/16)]">${fShortenNumber(row.original.marketCap || 0)}</span>
    },
  },
  {
    accessorKey: 'tokenAge',
    header: () => <Head tKey="detail.devProjects.tokenAge" />,
    cell: ({ row }) => {
      const token = row.original
      return <TokenAge createdTime={token.createdAt} />
    },
  },
]

interface TokensTableProps {
  tokens: TokenCreatedByDevDataDto[]
  onLoadMore: () => void
  isLoading: boolean
}

export const TokensTable = (props: TokensTableProps) => {
  const { tokens, onLoadMore, isLoading } = props
  const loadMoreRef = useRef<HTMLTableRowElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data: tokens,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.2 }, // Trigger when 20% of loadMoreRef is visible
    )
    const current = loadMoreRef.current
    if (current) {
      observer.observe(current)
    }
    return () => {
      if (current) observer.unobserve(current)
      observer.disconnect()
    }
  }, [onLoadMore])

  return (
    <div ref={listRef} className="overflow-x-auto w-full max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar">
      <Table>
        <TableHeader className="sticky top-0 bg-[#0A0A0A] z-[9]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}
                    className="whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length
            ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 20 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[40px]" />
          ))}
        </div>
      )}
      <div ref={loadMoreRef} className="h-5 w-full" />
    </div>
  )
}
