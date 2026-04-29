import { IconSortDown, IconSortUp } from '@/components/icon'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { getPath } from '@/lib/utils.ts'
import { useAppDispatch } from '@/redux/store'
import { CategoryToken } from '@/types/category.ts'
import { ChainIds } from '@/types/enums.ts'
import { GetTokensByCategoryResponse } from '@/types/responses.ts'
import { TokenTrending } from '@/types/token.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import Text from '@components/common/Text.tsx'
import ConfirmCollectTokenMeme from '@components/futuresDetails/tokenSearchDrawer/ConfirmCollectTokenMeme.tsx'
import { TableVirtual } from '@components/futuresDiscover/table/table-virtual.tsx'
import { useXStockTokens } from '@components/xstocks/hooks/useXStockTokens.ts'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { createContext, Dispatch, SetStateAction, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PriceChangePC } from '../Search'

export interface XStocksSearchListPropsPC {
  onClose?: () => void
  debounceValue?: string
  tableHeaderClassName?: string
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
  scrollable?: boolean
  allowSwitchChain?: boolean
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
  return <Text text={t(text)} fontSize={11} fontWeight="light" color="#FFFFFF80" />
}

const SymbolCell = (props: { token: CategoryToken }) => {
  const { token } = props
  const chainId = token.chainId ?? 0
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
        iconStarInSearch
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
              text={token.symbol}
              fontSize={14}
              fontWeight="medium"
              className="leading-[calc(1rem*(13/16))]"
              highLightText={searchValue}
              highLightColor="#AB57FF"
            />{' '}
            <Text
              text={token.name?.replace('xStock', '') ?? ''}
              fontSize={10}
              fontWeight="medium"
              className="leading-[calc(1rem*(10/16))] mr-1 "
              highLightText={searchValue}
              color="#FFFFFF99"
            />
            <IconXStock />
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] leading-[calc(1rem*(10/16))] mr-1 app-font-medium">
            ${fShortenNumber(token.marketCap ? +token.marketCap : 0, 2)}
          </div>
        </div>
      </div>
    </div>
  )
}

const PriceCell = (props: { token: CategoryToken; type: 'price' | 'liquidity' }) => {
  const { token, type } = props
  return (
    <div className="flex items-end gap-1 flex-col relative">
      {type === 'price' && <MoneyFormatted value={token.price!} className="!font-[450] text-[14px]" />}
      {type === 'liquidity' && (
        <span className=" !font-[450] text-[14px]">${fShortenNumber(token.liquidity ? +token.liquidity : 0)}</span>
      )}
    </div>
  )
}

const PriceChangeCell = (props: { token: CategoryToken }) => {
  const { token } = props
  const priceChange = token.price24hChange ? +token.price24hChange : 0
  return <PriceChangePC isPositive={Number(priceChange) > 0} value={`${priceChange}`} />
  // return <PriceChange value={`${formatLongValue(priceChange, false, 2)}%`} isPositive={Number(priceChange) >= 0} />
}

const columns: ColumnDef<CategoryToken>[] = [
  {
    accessorKey: 'symbol',
    sortingFn: (rowA, rowB) => {
      const marketCapA = rowA.original.marketCap ? +rowA.original.marketCap : 0
      const marketCapB = rowB.original.marketCap ? +rowB.original.marketCap : 0
      return marketCapA - marketCapB
    },
    header: ({ column }) => (
      <div className="flex items-center">
        <div
          className="flex items-center gap-0.5 cursor-pointer select-none"
          onClick={column.getToggleSortingHandler()}
        >
          <TranslatedText text="xstocks.columns.token" />
          <Text text="/" fontSize={11} fontWeight="light" color="#FFFFFF80" />
          <TranslatedText text="xstocks.columns.marketCap" />
        </div>
        <div className="flex flex-col leading-none items-center ml-1">
          <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
          <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
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
    sortingFn: 'auto',
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 justify-end cursor-pointer select-none"
        onClick={column.getToggleSortingHandler()}
      >
        <div className="flex items-center gap-0.5">
          <TranslatedText text="xstocks.columns.price" />
        </div>
        <div className="flex flex-col leading-none items-center">
          <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
          <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceCell token={token} type="price" />
    },
  },
  {
    accessorKey: 'liquidity',
    sortingFn: 'auto',
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 justify-end cursor-pointer select-none"
        onClick={column.getToggleSortingHandler()}
      >
        <div className="flex items-center gap-0.5">
          <TranslatedText text="xstocks.columns.liquidity" />
        </div>
        <div className="flex flex-col leading-none items-center">
          <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
          <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceCell token={token} type="liquidity" />
    },
  },
  {
    accessorKey: 'price24hChange',
    sortingFn: 'auto',
    header: ({ column }) => (
      <div className="flex justify-end cursor-pointer select-none gap-1" onClick={column.getToggleSortingHandler()}>
        <TranslatedText text="xstocks.columns.change24h" />
        <div className="flex flex-col leading-none items-center">
          <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
          <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const token = row.original
      return <PriceChangeCell token={token} />
    },
  },
]

export const XStocksSearchListPC = (props: XStocksSearchListPropsPC) => {
  const {
    onClose,
    debounceValue,
    setFavoriteTokens,
    tableHeaderClassName = 'bg-[#121212]',
    scrollable = true,
    allowSwitchChain,
  } = props

  const { t } = useTranslation()
  const { tokens, isLoading } = useXStockTokens()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const searchedTokens = useMemo(() => {
    const searchText = debounceValue?.toLowerCase().trim() ?? ''
    let result: CategoryToken[] = []
    if (!searchText) {
      result = tokens.slice(0, 20)
    } else {
      result = tokens.filter((token) => {
        const symbolMatch = token.symbol?.toLowerCase().includes(searchText) ?? false
        const nameMatch = token.name?.toLowerCase().includes(searchText) ?? false
        const addressMatch = searchText.length >= 4 && (token.address?.toLowerCase().includes(searchText) ?? false)
        return symbolMatch || nameMatch || addressMatch
      })
    }
    return result.sort((a, b) => (b.liquidity ? +b.liquidity : 0) - (a.liquidity ? +a.liquidity : 0))
  }, [tokens, debounceValue])

  return (
    <XStocksSearchListContext.Provider value={{ searchValue: debounceValue, setFavoriteTokens }}>
      <div>
        <TableVirtual
          isLoading={isLoading}
          columns={columns}
          data={searchedTokens}
          onRowClick={(e, event) => {
            event?.stopPropagation()
            event?.preventDefault()
            navigate(
              getPath(APP_PATH.MEME_TOKEN_DETAIL, {
                address: e.token,
                chain: CHAIN_SYMBOLS[+e.chainId],
              }),
              { state: { symbol: e.symbol } }
            )
          }}
          isStickyHeader={true}
          containerClassName="!border-none _hidescrollbar h-full"
          tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400] bg-[#232329] px-2"
          tableHeaderRowClassName="!border-none"
          tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-2.5 justify-end px-2-custom px-last-child-pc px-third-col"
          emptyText={t('wallet.noData')}
          tableRowClassName="!border-none highlight-even-column"
          tableHeadClassName="px-last-child-pc px-0 h-[30px] px-third-col"
          rowHeight={61}
          cusTomMaxHeightPC={debounceValue ? '570px' : '510px'}
        />
      </div>
    </XStocksSearchListContext.Provider>
  )
}
