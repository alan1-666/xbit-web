import { SearchHistory } from '@/components/common/search/SearchHistory'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { SkeletonList } from '@/components/ui/skeleton'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { futureClient } from '@/lib/gql/apollo-client'
import ls from '@/lib/local-storage'
import { fShortenNumber } from '@/lib/number.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { DataTable } from '@/pages/home/data-table'
import { searchTokensPc, searchTokensV3 } from '@/services/tokens.service'
import { CategoryToken } from '@/types/category.ts'
import { ChainIds } from '@/types/enums.ts'
import { GetTokensByCategoryResponse } from '@/types/responses.ts'
import { TokenTrending } from '@/types/token.ts'
import { formatLongValue, formatMoney, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { useQuery } from '@apollo/client'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import Text from '@components/common/Text.tsx'
import ConfirmCollectTokenMeme from '@components/futuresDetails/tokenSearchDrawer/ConfirmCollectTokenMeme.tsx'
import { PriceChange, PriceChangePC } from '@components/futuresDiscover/table/crypto-table.tsx'
import { useXStockTokens } from '@components/xstocks/hooks/useXStockTokens.ts'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { createContext, Dispatch, SetStateAction, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { ChainType } from '@/@generated/gql/graphql-meme2'
import { EmptyList } from '@/components/discover/EmptyList'

export interface XStocksSearchListProps {
  onClose?: () => void
  debounceValue?: string
  tableHeaderClassName?: string
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
  scrollable?: boolean
  allowSwitchChain?: boolean
  isHidenFuturesTab?: boolean
  isdesktop?: boolean
}

type XStocksSearchListContextState = {
  searchValue?: string
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
}

const XStocksSearchListContext = createContext<XStocksSearchListContextState>({
  searchValue: '',
  setFavoriteTokens: () => {},
})

const TranslatedText = (props: { text: string }) => {
  const { text } = props
  const { t } = useTranslation()
  return <Text text={t(text)} fontSize={11} fontWeight="light" color="#ffffff80" />
}

const SymbolCell = (props: { token: CategoryToken; isDesktop?: boolean }) => {
  const { token, isDesktop } = props
  const chainId = (token.chainId ?? ChainIds.Solana) as ChainIds
  const chainLogo = getBlockchainLogo2(chainId)
  const tokenLogo = token.logoUrl ?? getBlockChainLogo(chainId, token.address ?? '')
  const { searchValue, setFavoriteTokens } = useContext(XStocksSearchListContext)
  const queryClient = useQueryClient()
  return (
    <div className="flex items-center gap-2 flex-3">
      <ConfirmCollectTokenMeme
        token={token.address ?? ''}
        defaultCollect={token.isFavorite ?? false}
        tokenSymbol={token.symbol}
        triggerClassName="p-0"
        chain={ChainType.Solana}
        onRemoveSuccess={() => {
          queryClient.setQueryData(
            ['tokens', 'xStocks', ChainIds.Solana],
            (oldData: InfiniteData<GetTokensByCategoryResponse>) => {
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  tokensByCategory: {
                    data: page.tokensByCategory.data.map((t) => {
                      if (t.address === token.address) {
                        return { ...t, isFavorite: false }
                      }
                      return t
                    }),
                  },
                })),
              }
            },
          )
          setFavoriteTokens((prev) => prev.filter((t) => t.token !== token.address))
        }}
        onAdded={() => {
          queryClient.setQueryData(
            ['tokens', 'xStocks', ChainIds.Solana],
            (oldData: InfiniteData<GetTokensByCategoryResponse>) => {
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  tokensByCategory: {
                    data: page.tokensByCategory.data.map((t) => {
                      if (t.address === token.address) {
                        return { ...t, isFavorite: true }
                      }
                      return t
                    }),
                  },
                })),
              }
            },
          )
          setFavoriteTokens((prev) => {
            const existingToken = prev.find((t) => t.token === token.address)
            if (existingToken) {
              return prev.map((t) => (t.token === token.address ? { ...t, isFavorite: true } : t))
            }
            const newToken = {
              token: token.address ?? '',
              symbol: token.symbol ?? '',
              image: token.logoUrl ?? '',
              chainId: token.chainId ?? ChainIds.Solana,
              isFavorite: true,
              name: token.name ?? '',
              price: token.price ?? '0',
              volume24h: token.volume24h ? +token.volume24h : 0,
              price24hChange: token.price24hChange ?? '0',
            } as any as TokenTrending
            return [...prev, newToken]
          })
        }}
      />
      <ChainCurrencyIcon
        chainIcon={chainLogo}
        currencyIcon={tokenLogo}
        name={token.symbol ?? ''}
        fallbackClassName="bg-secondary"
        avatarClassName="border-[#261236]"
      />
      <div className="">
        <div className="mb-1 flex items-center gap-1 text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
          <div className="flex items-baseline gap-1">
            <Text
              className="text-white text-[calc(13rem/16)] truncate leading-[calc(13rem/16)]"
              text={token.symbol}
              fontWeight="regular"
              highLightText={searchValue}
              highLightColor="#843BEA"
            />{' '}
            <IconXStock />
          </div>
        </div>
        <div className="flex items-center">
          {isDesktop ? (
            <Text
              className="text-[calc(10rem/16)] font-normal text-[#908E98]"
              text={token.name?.replace('xStock', '') ?? ''}
              color="#908E98"
              highLightText={searchValue}
            />
          ) : (
            <div className="text-[calc(1rem*(12/16))] text-[#908E98] leading-[calc(1rem*(12/16))] mr-1">
              ${fShortenNumber(token.marketCap ? +token.marketCap : 0, 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PriceCell = (props: { token: CategoryToken }) => {
  const { token } = props
  return (
    <div className="flex items-end gap-1 flex-col relative">
      {/* <MoneyFormatted value={token.price!} className="text-white leading-[calc(15rem/16)]" /> */}
      <div className="text-white leading-[calc(15rem/16)]">{formatMoney(Number(token.price!))}</div>

      <span className="text-[calc(12rem/16)] text-[#FFFFFF80] leading-[calc(12rem/16)]">
        ${fShortenNumber(token.liquidity ? +token.liquidity : 0)}
      </span>
    </div>
  )
}

const PriceCellDesktop = (props: { token: CategoryToken }) => {
  const { token } = props
  return (
    <div className="flex justify-end opacity-80">
      <Text text={formatMoney(Number(token.price!))} fontSize={13} fontWeight="medium" className="lining-nums" />
    </div>
  )
}

const MarketCapCell = (props: { token: CategoryToken }) => {
  const { token } = props
  return (
    <div className="flex justify-end opacity-80">
      <Text
        text={`$${fShortenNumber(token.marketCap ? +token.marketCap : 0, 2)}`}
        fontSize={13}
        fontWeight="medium"
        className="lining-nums"
      />
    </div>
  )
}

const LiquidityCell = (props: { token: CategoryToken }) => {
  const { token } = props
  return (
    <div className="flex justify-end opacity-80">
      <Text
        text={`$${fShortenNumber(token.liquidity ? +token.liquidity : 0, 2)}`}
        fontSize={13}
        fontWeight="medium"
        className="lining-nums"
      />
    </div>
  )
}

const PriceChangeCell = (props: { token: CategoryToken }) => {
  const { token } = props
  const priceChange = token.price24hChange ? +token.price24hChange : 0
  return <PriceChange value={`${formatLongValue(priceChange, false, 2)}%`} isPositive={Number(priceChange) >= 0} />
}

const PriceChangeCellPC = (props: { token: CategoryToken }) => {
  const { token } = props
  const priceChange = token.price24hChange ? +token.price24hChange : 0
  return <PriceChangePC value={`${formatLongValue(priceChange, false, 2)}%`} isPositive={Number(priceChange) >= 0} />
}
const columns: ColumnDef<CategoryToken>[] = [
  {
    accessorKey: 'symbol',
    header: () => (
      <div className="flex items-center">
        <div className="flex items-center gap-0.5">
          <TranslatedText text="xstocks.columns.token" />
          <Text text="/" fontSize={11} fontWeight="light" color="#908E98" />
          <TranslatedText text="xstocks.columns.marketCap" />
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <SymbolCell token={token} />
    },
  },
  {
    accessorKey: 'price',
    header: () => (
      <div className="flex items-center gap-2 justify-end">
        <div className="flex items-center gap-0.5">
          <TranslatedText text="xstocks.columns.price" />
          <Text text="/" fontSize={11} fontWeight="light" color="#FFFFFF80" />
          <TranslatedText text="xstocks.columns.liquidity" />
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceCell token={token} />
    },
  },
  {
    accessorKey: 'price24hChange',
    header: () => (
      <div className="flex justify-end">
        <TranslatedText text="tokenSearchDrawer.tableHeaders.24hChange" />
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceChangeCell token={token} />
    },
  },
]

const desktopColumns: ColumnDef<CategoryToken>[] = [
  {
    accessorKey: 'symbol',
    header: () => (
      <div className="!min-w-[180px] flex items-center">
        <TranslatedText text="xstocks.columns.token" />
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <SymbolCell token={token} isDesktop={true} />
    },
  },
  {
    accessorKey: 'price',
    header: () => (
      <div className="flex items-center gap-2 justify-end">
        <TranslatedText text="xstocks.columns.price" />
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceCellDesktop token={token} />
    },
  },
  {
    accessorKey: 'marketCap',
    header: () => (
      <div className="flex items-center gap-2 justify-end">
        <TranslatedText text="xstocks.columns.marketCap" />
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <MarketCapCell token={token} />
    },
  },
  {
    accessorKey: 'liquidity',
    header: () => (
      <div className="flex items-center gap-2 justify-end">
        <TranslatedText text="xstocks.columns.liquidity" />
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <LiquidityCell token={token} />
    },
  },
  {
    accessorKey: 'price24hChange',
    header: () => (
      <div className="flex justify-end">
        <TranslatedText text="tokenSearchDrawer.tableHeaders.24hChange" />
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceChangeCellPC token={token} />
    },
  },
]

export const XStocksSearchList = (props: XStocksSearchListProps) => {
  const {
    onClose,
    debounceValue,
    setFavoriteTokens,
    tableHeaderClassName = 'bg-[#121212]',
    scrollable = true,
    allowSwitchChain,
    isHidenFuturesTab,
    isdesktop = false,
  } = props

  const { t } = useTranslation()
  const { tokens, isLoading } = useXStockTokens()
  const navigate = useNavigate()

  const searchVariables = useMemo(
    () => ({
      searchString: debounceValue || '',
      isStock: true,
    }),
    [debounceValue],
  )

  const { data: dataSearch, isLoading: loadingSearch } = useReactQuery({
    queryKey: ['searchTokensV3', debounceValue, 'isStock'],
    queryFn: async () => {
      const { data } = await futureClient.query({
        query: searchTokensPc,
        variables: {
          input: searchVariables,
        },
      })
      return data?.searchUniversal?.data || []
    },
    enabled: !!debounceValue,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  const handleRowClick = (token: CategoryToken) => {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistoryv2') || '[]') as SearchHistory[]

    const newHistory = searchHistory.filter((item) => item.address !== token.address)
    newHistory.unshift({
      address: token.address ?? '',
      name: token.symbol,
      logo: token.logoUrl,
      chainId: token.chainId ? Number(token.chainId) : (ChainIds.Solana as number),
      type: 'xstock',
    })
    if (newHistory.length > 20) {
      newHistory.pop()
    }
    localStorage.setItem('searchHistoryv2', JSON.stringify(newHistory))

    const chainId = token.chainId ?? ChainIds.Solana
    const path = getPath(APP_PATH.X_STOCK_DETAIL, { address: token.address ?? '', chain: CHAIN_SYMBOLS[+chainId] })
    if (allowSwitchChain) {
      ls.set('disableSwitchChain', true)
    }

    navigate(path, {
      state: {
        token,
        symbol: token.symbol,
        chain: 'sol',
        tokenLogo: token.logoUrl,
        address: token.address,
        tokenName: token.name,
      },
    })
  }

  const searchedTokens = useMemo(() => {
    const searchText = debounceValue?.toLowerCase().trim() ?? ''
    let result: CategoryToken[] = []
    if (!searchText) result = tokens.slice(0, 20)
    else if (dataSearch) {
      result = dataSearch.map((item: any) => ({
        address: item.token || item.address,
        symbol: item.symbol,
        name: item.name,
        logoUrl: item.image || item.logoUrl,
        chainId: item.chainId ?? ChainIds.Solana,
        price: item.price?.toString(),
        price24hChange: item.price24hChange?.toString(),
        marketCap: item.marketcap?.toString(),
        liquidity: item.liquidity?.toString(),
        volume24h: item.volume24h?.toString(),
        isFavorite: item.isFavorite ?? false,
      })) as CategoryToken[]
    } else {
      result = tokens.filter((token) => {
        const symbolMatch = token.symbol?.toLowerCase().includes(searchText) ?? false
        const nameMatch = token.name?.toLowerCase().includes(searchText) ?? false
        const addressMatch = searchText.length >= 4 && (token.address?.toLowerCase().includes(searchText) ?? false)
        return symbolMatch || nameMatch || addressMatch
      })
    }
    return result.sort((a, b) => (b.liquidity ? +b.liquidity : 0) - (a.liquidity ? +a.liquidity : 0))
  }, [tokens, debounceValue, dataSearch])

  return (
    <XStocksSearchListContext.Provider value={{ searchValue: debounceValue, setFavoriteTokens }}>
      {isHidenFuturesTab ? (
        <div>
          <DataTable
            isLoading={isLoading || loadingSearch}
            columns={isdesktop ? desktopColumns : columns}
            data={searchedTokens}
            onRowClick={(e) => {
              handleRowClick(e)
              onClose?.()
            }}
            isStickyHeader={true}
            containerClassName="!border-none _hidescrollbar h-full !overflow-visible bg-[#0A0A0A]"
            tableHeaderClassName={`px-2 ${tableHeaderClassName} sticky`}
            tableHeaderRowClassName="!border-none h-[24px]"
            tableBodyRowClassName="border-0 no-padding-top"
            tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none py-2.5 justify-end px-last-child"
            skeletonComponent={<SkeletonList count={10} classNameItem="h-[53px]" />}
            noDataText={t('wallet.noData')}
            emptyComponent={
              <div className="flex justify-center items-center">
                <EmptyList containerClassName='h-full'/>
              </div>
            }
          />
        </div>
      ) : (
        <div className={isdesktop ? '' : 'mt-5'}>
          <TableVirtual
            isLoading={isLoading || loadingSearch}
            columns={isdesktop ? desktopColumns : columns}
            data={searchedTokens}
            onRowClick={(e) => {
              handleRowClick(e)
              onClose?.()
            }}
            isStickyHeader={true}
            containerClassName="!border-none _hidescrollbar h-full !max-h-auto"
            tableHeaderClassName={`px-2 ${tableHeaderClassName}`}
            tableHeaderRowClassName="!border-none"
            tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-2.5 justify-end px-2-custom px-last-child"
            emptyText={t('wallet.noData')}
            tableRowClassName="!border-none"
            tableHeadClassName={cn("px-last-child px-0 h-[30px]", isdesktop && '!h-[40px]')}
            isSearchList
            isMemeSearchList
            rowHeight={isdesktop ? 40 : 54}
            cusTomMaxHeight={scrollable ? undefined : 'auto'}
          />
        </div>
      )}
    </XStocksSearchListContext.Provider>
  )
}
