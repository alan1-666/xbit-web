import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import Text from '@/components/common/Text'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { formatAddressWallet } from '@/lib/string'
import { searchTokensV3 } from '@/services/tokens.service'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { useQuery } from '@apollo/client'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState, useTransition } from 'react'

import { MemeDto } from '@/@generated/gql/graphql-core'
import { TokenTrendingSearchBarData } from '@/@generated/gql/graphql-future'
import IconOfficial from '@/components/detailInfo/IconOfficial'
import ConfirmCollectTokenMeme from '@/components/futuresDetails/tokenSearchDrawer/ConfirmCollectTokenMeme'
import useHandleLogic from '@/components/futuresDetails/tokenSearchDrawer/hooks/useHandleLogic'
import { useTokenTrendingSearchBar } from '@/components/futuresDetails/tokenSearchDrawer/hooks/useTokenTrendingSearchBar'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { TopBarToken } from '@/components/v2/desktop/TokenTopBarCard'
import { useActiveChain } from '@/hooks/useActiveChain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { futureClient } from '@/lib/gql/apollo-client'
import { getPath } from '@/lib/utils'
import { TokenTrending } from '@/types/token'
import { getDexLogo } from '@/utils/lauchpad'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MarketCapCell, PriceChangeCell } from '../Search'

interface SearchResultsListProps {
  debounceValue: string
  favoriteTokens: TokenTrending[]
  setOpen: Dispatch<SetStateAction<boolean>>
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
}

const useTableColumns = (
  setListTokenMeme: Dispatch<SetStateAction<TokenTrending[]>>,
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>,
  // handleAddFavorite: (token: TokenTrending) => void,
  // handleRemoveFavorite: (token: string) => void,

  debounceValue?: string,
) => {
  const columnHelper = createColumnHelper<any>()
  const { t } = useTranslation()

  const getLaunchpadLogo = (token: MemeDto) => {
    const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
    return launchpad ? getDexLogo(launchpad) : undefined
  }

  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
        enableSorting: false,
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5">
              <Text
                text={t('tokenSearchDrawer.tableHeaders.token')}
                fontSize={11}
                fontWeight="light"
                color="#FFFFFF80"
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const { chainId, token, image, symbol, metadataCustom, isFavorite } = info.row.original
          const chainLogo = getBlockchainLogo2(chainId)
          const tokenLogo = image ?? getBlockChainLogo(chainId, token)

          const isOfficial = Boolean(metadataCustom?.isOfficial)
          const queryClient = useQueryClient()
          return (
            <div className="flex items-center gap-2 flex-3">
              <ConfirmCollectTokenMeme
                token={token}
                defaultCollect={isFavorite}
                tokenSymbol={symbol}
                triggerClassName="p-0"
                iconStarInSearch
                onRemoveSuccess={() => {
                  setListTokenMeme((prev) =>
                    prev.map((e) => {
                      if (e.token === token) {
                        return {
                          ...e,
                          isFavorite: false,
                        }
                      }
                      return { ...e }
                    }),
                  )
                  setFavoriteTokens((prev) => prev.filter((e) => e.token !== token))
                  queryClient.setQueryData(['topBarTokens', 'favorites'], (oldData: TopBarToken[]) => {
                    const newData = oldData.filter((e) => e.address !== token)
                    return newData
                  })
                }}
                onAdded={() => {
                  setListTokenMeme((prev) =>
                    prev.map((e) => {
                      if (e.token === token) {
                        return {
                          ...e,
                          isFavorite: true,
                        }
                      }
                      return { ...e }
                    }),
                  )
                  setFavoriteTokens((prev) => [...prev, info.row.original])
                  queryClient.setQueryData(['topBarTokens', 'favorites'], (oldData: TopBarToken[]) => {
                    const tokenInfor = info.row.original
                    const newData = [...oldData]
                    const existingIndex = oldData.findIndex((token) => token.address === token)
                    if (existingIndex === -1) {
                      newData.push({
                        address: tokenInfor.token,
                        avatar: tokenInfor.image || getBlockChainLogo(tokenInfor.chainId, tokenInfor.token),
                        name: tokenInfor.symbol ?? '--',
                        marketCap: tokenInfor.marketcap ? +tokenInfor.marketcap : 0,
                        priceChange: tokenInfor.price24hChange ? +tokenInfor.price24hChange : 0,
                        chainId: tokenInfor.chainId,
                        sector: 'meme',
                      })
                    }

                    return newData
                  })
                  // handleAddFavorite(info.row.original)
                }}
              />
              <ChainCurrencyIcon
                chainIcon={chainLogo}
                currencyIcon={tokenLogo}
                name={symbol}
                fallbackClassName="bg-secondary"
                avatarClassName="border-[#261236]"
              />
              <div className="">
                <div className="mb-1 flex items-center gap-1 text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
                  <Text
                    text={symbol}
                    fontSize={13}
                    fontWeight="medium"
                    className="leading-[calc(1rem*(13/16))]"
                    highLightText={debounceValue}
                    highLightColor="#AB57FF"
                  />
                  {isOfficial && (
                    <div className="-ml-1.5">
                      <IconOfficial className="size-[12px]" />
                    </div>
                  )}
                  {!!getLaunchpadLogo(info.row.original) && (
                    <img src={getLaunchpadLogo(info.row.original)} alt="" className="size-[10px]" />
                  )}
                </div>
                <div className="flex items-center">
                  <Text
                    text={formatAddressWallet(token, 5, 4)}
                    fontSize={10}
                    fontWeight="medium"
                    className="leading-[calc(1rem*(10/16))] mr-1 "
                    highLightText={debounceValue}
                    color="#FFFFFF99"
                  />
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('marketcap', {
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className="flex justify-end items-center gap-1 cursor-pointer select-none"
            onClick={column.getToggleSortingHandler()}
          >
            <Text
              text={t('tokenSearchDrawer.tableHeaders.marketCap')}
              fontSize={11}
              fontWeight="light"
              color="#FFFFFF80"
            />
            <div className="flex flex-col leading-none items-center">
              <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
              <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
            </div>
          </div>
        ),
        cell: (info) => <MarketCapCell info={info} type="marketCap" />,
      }),

      columnHelper.accessor('volume24h', {
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className="flex justify-end items-center gap-1 cursor-pointer select-none"
            onClick={column.getToggleSortingHandler()}
          >
            <Text
              text={t('tokenSearchDrawer.tableHeaders.volumeMeme')}
              fontSize={11}
              fontWeight="light"
              color="#FFFFFF80"
            />
            <div className="flex flex-col leading-none items-center">
              <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
              <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
            </div>
          </div>
        ),
        cell: (info) => <MarketCapCell info={info} type="volume" />,
      }),

      columnHelper.accessor('price24hChange', {
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className="flex justify-end items-center gap-1 cursor-pointer select-none"
            onClick={column.getToggleSortingHandler()}
          >
            <Text
              text={t('tokenSearchDrawer.tableHeaders.24hChange')}
              fontSize={11}
              fontWeight="light"
              color="#FFFFFF80"
            />
            <div className="flex flex-col leading-none items-center">
              <IconSortUp currentColor={column.getIsSorted() === 'desc' ? '#fff' : '#FFFFFF80'} />
              <IconSortDown currentColor={column.getIsSorted() === 'asc' ? '#fff' : '#FFFFFF80'} />
            </div>
          </div>
        ),
        cell: (info) => <PriceChangeCell info={info} />,
      }),
    ],
    [columnHelper, debounceValue],
  )
}

const chains = { eth: 'EVM', sol: 'SOLANA', arb: 'ALL' }

const MemeListPC = (props: SearchResultsListProps) => {
  const { t } = useTranslation()
  const activeChain = useActiveChain()

  const { debounceValue, favoriteTokens, setOpen, setFavoriteTokens } = props
  const { handleRowClick } = useHandleLogic()
  const navigate = useNavigate()
  const [listTokenMeme, setListTokenMeme] = useState<TokenTrending[]>([])

  const trendingVariables = useMemo(
    () => ({
      input: {
        chain: chains[activeChain],
        dex: 'All',
        direction: 'Popular',
        timeRange: 'h24',
      },
    }),
    [activeChain],
  )
  const { getTokenTrendingSearchBar: data, loading } = useTokenTrendingSearchBar(trendingVariables)

  // State to track isFavorite changes due to user actions
  const [favoriteUpdates, setFavoriteUpdates] = useState<Map<string, boolean>>(new Map())

  const searchVariables = useMemo(
    () => ({
      searchString: debounceValue,
    }),
    [debounceValue],
  )

  const { loading: loadingSearch, data: dataSearch } = useQuery(searchTokensV3, {
    variables: searchVariables,
    skip: !debounceValue,
    client: futureClient,
  })
  const tokens = useMemo(() => {
    return data.map((token: TokenTrendingSearchBarData) => ({
      ...token,
      price24hChange: token?.price24hChange?.toString() ?? '',
      marketcap: token?.marketcap?.toString() ?? '',
    }))
  }, [data])

  const tableData = useMemo(() => {
    return debounceValue ? dataSearch?.search.data || [] : tokens
  }, [debounceValue, dataSearch?.search.data, tokens])

  const [loadingDelay, setLoadingDelay] = useState(false)
  const [_, startTransition] = useTransition()

  const columns = useTableColumns(
    (updater) => {
      setListTokenMeme(updater)
      if (typeof updater === 'function') {
        setListTokenMeme((prev) => {
          const newData = updater(prev)
          const newUpdates = new Map(favoriteUpdates)
          newData.forEach((token) => {
            if (token.isFavorite !== undefined) {
              newUpdates.set(token.token, token.isFavorite)
            }
          })
          setFavoriteUpdates(newUpdates)
          return newData
        })
      }
    },
    setFavoriteTokens,
    // handleAddFavorite,
    // handleRemoveFavorite,
    debounceValue,
  )

  const favoriteTokensMap = useMemo(() => {
    return new Map(favoriteTokens.map((token) => [token.token, token]))
  }, [favoriteTokens])

  useEffect(() => {
    const updatedTokens = tableData.map((item: any) => {
      const userUpdate = favoriteUpdates.get(item.token)
      const tokenFavorite = favoriteTokensMap.get(item.token)
      return {
        ...item,
        price: item.price,
        price24hChange: item.price24hChange?.toString() ?? '',
        isFavorite: userUpdate !== undefined ? userUpdate : !!tokenFavorite,
      }
    })
    setListTokenMeme(updatedTokens as TokenTrending[])
  }, [tableData, favoriteTokensMap, favoriteUpdates])

  useEffect(() => {
    if (loading || loadingSearch) {
      setLoadingDelay(true)
    } else {
      startTransition(() => {
        setLoadingDelay(false)
      })
    }
  }, [loading, loadingSearch])

  return (
    <div className="">
      <TableVirtual
        isLoading={loadingDelay}
        columns={columns}
        data={listTokenMeme}
        onRowClick={(e, event) => {
          event?.stopPropagation()
          event?.preventDefault()
          setOpen(false)

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
  )
}

export default memo(MemeListPC)