import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import Text from '@/components/common/Text'
import { PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { formatAddressWallet } from '@/lib/string'
import { formatLongValue, formatMoney, getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react'

import { MemeDto } from '@/@generated/gql/graphql-core'
import IconOfficial from '@/components/detailInfo/IconOfficial'
import { IconEmptyV3 } from '@/components/icon'
import { SkeletonList } from '@/components/ui/skeleton'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { futureClient } from '@/lib/gql/apollo-client'
import ls from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { DataTable } from '@/pages/home/data-table'
import { searchTokensV3 } from '@/services/tokens.service'
import { TokenTrending } from '@/types/token'
import { getDexLogo } from '@/utils/lauchpad'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { TokenSearchDrawerType } from '.'
import ConfirmCollectTokenMeme from './ConfirmCollectTokenMeme'
import useHandleLogic from './hooks/useHandleLogic'
import useItemTokenOHLC from './hooks/useItemTokenOHLC'
import { useTokenTrendingSearchBar } from './hooks/useTokenTrendingSearchBar'
import { chains, chainsIds, useTableColumnsAddress } from './MemeList'
import { mappedChainIdToTypeChain } from '@/redux/modules/newWallet.slice'
import { Configs } from '@/const/configs'

interface SearchResultsListProps {
  debounceValue: string
  favoriteTokens: TokenTrending[]
  allowShowList?: boolean
  isFavorite?: boolean
  isFuturesSearch?: boolean
  type?: TokenSearchDrawerType

  setOpen: Dispatch<SetStateAction<boolean>>
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
}

const MarketCapCell = memo(({ info }: { info: any }) => {
  const { token, volume24h, marketcap } = info.row.original

  const { price } = useItemTokenOHLC({
    address: token,
    initMarketcap: marketcap,
    initVolume24h: volume24h,
  })

  return (
    <div className="flex items-end flex-col relative gap-1">
      <span className="text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] app-font-regular">
        {formatMoney(price.marketcap ? price.marketcap : marketcap)}
      </span>
      {/* <MoneyFormatted value={price.marketcap} /> */}
      <Text
        text={formatMoney(Number(price.volume24h ? price.volume24h : volume24h))}
        fontSize={12}
        fontWeight="light"
        color="#908E98"
        className="lining-nums leading-[calc(1rem*(12/16))]"
      />
    </div>
  )
})

const PriceChangeCell = memo(({ info }: { info: any }) => {
  const { token, price24hChange } = info.row.original
  const { price } = useItemTokenOHLC({
    address: token,
    initChangePercent: price24hChange,
  })

  const changePercent = price?.price24hChange ? price?.price24hChange : price24hChange
  return (
    <PriceChange
      value={`${formatLongValue(changePercent as number, false, 2)}%`}
      isPositive={Number(changePercent) > 0}
    />
  )
})
PriceChangeCell.displayName = 'PriceChangeCell'

const useTableColumns = (
  setFavoriteTokensInitial: Dispatch<SetStateAction<TokenTrending[]>>,
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>,
  trendingVariables: {
    input: {
      chain: string
      dex: string
      direction: string
      timeRange: string
    }
  },
  debounceValue?: string,
) => {
  const columnHelper = createColumnHelper<any>()
  const { t } = useTranslation()

  const getLaunchpadLogo = (token: MemeDto) => {
    const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
    return launchpad ? getDexLogo(launchpad) : undefined
  }

  const { updateCacheWithFavorite } = useTokenTrendingSearchBar(trendingVariables)

  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
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
          return (
            <div className="flex items-center gap-2 flex-3">
              <ConfirmCollectTokenMeme
                token={token}
                defaultCollect={isFavorite ?? false}
                tokenSymbol={symbol}
                chain={mappedChainIdToTypeChain(chainId)}
                triggerClassName="p-0"
                onRemoveSuccess={() => {
                  setFavoriteTokensInitial((prev) => prev.filter((item) => item.token !== token))
                  setFavoriteTokens((prev) => prev.filter((item) => item.token !== token))
                  updateCacheWithFavorite(token, false)
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
                    fontSize={14}
                    fontWeight="regular"
                    className="leading-[calc(1rem*(14/16))]"
                    highLightText={debounceValue}
                    highLightColor="#843BEA"
                  />
                  {isOfficial && (
                    <div className="-ml-1.5">
                      <IconOfficial className="size-[12px]" />
                    </div>
                  )}
                  {!!getLaunchpadLogo(info.row.original) && (
                    <img src={getLaunchpadLogo(info.row.original)} alt="" className="w-2.5 h-2.5" />
                  )}
                </div>
                <div className="flex items-center">
                  <Text
                    text={formatAddressWallet(token, 5, 4)}
                    fontSize={12}
                    fontWeight="light"
                    className="leading-[calc(1rem*(10/16))] mr-1 "
                    highLightText={debounceValue}
                    highLightColor="#843BEA"
                    color="#908E98"
                  />
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('marketcap', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-0.5">
              <Text
                text={t('tokenSearchDrawer.tableHeaders.marketCap')}
                fontSize={11}
                fontWeight="light"
                color="#FFFFFF80"
              />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text
                text={t('tokenSearchDrawer.tableHeaders.volumeMeme')}
                fontSize={11}
                fontWeight="light"
                color="#FFFFFF80"
              />
            </div>
          </div>
        ),
        cell: (info) => <MarketCapCell info={info} />,
      }),

      columnHelper.accessor('price24hChange', {
        header: () => (
          <div className="flex justify-end">
            <Text
              text={t('tokenSearchDrawer.tableHeaders.24hChange')}
              fontSize={11}
              fontWeight="light"
              color="#FFFFFF80"
            />
          </div>
        ),
        cell: (info) => <PriceChangeCell info={info} />,
      }),
    ],
    [columnHelper, debounceValue],
  )
}

export const MemeWatchlist = (props: SearchResultsListProps) => {
  const { t } = useTranslation()
  const { debounceValue, favoriteTokens, setOpen, setFavoriteTokens, type } = props
  const memeChain = useMemo<keyof typeof chains>(() => {
    const raw = ls.get('meme_chain') || TYPE_CHAIN.SOLANA
    return (raw as keyof typeof chains) ?? (TYPE_CHAIN.SOLANA as keyof typeof chains)
  }, [])

  const searchVariables = useMemo(() => {
    if (!Configs.enableSolana()) {
      return {
        searchString: debounceValue,
        chainId: chainsIds[memeChain],
      }
    }
    return {
      searchString: debounceValue,
    }
  }, [debounceValue, memeChain])

  const trendingVariables = useMemo(
    () => ({
      input: {
        chain: chains[memeChain],
        dex: 'All',
        direction: 'Popular',
        timeRange: 'h24',
      },
    }),
    [memeChain],
  )

  // const { loading, data: dataSearch } = useQuery(searchTokensV3, {
  //   variables: {
  //     input: searchVariables,
  //   },
  //   skip: !debounceValue,
  //   client: futureClient,
  // })
  const { data: dataSearch, isLoading: loading } = useQuery({
    queryKey: ['searchTokensV3', debounceValue],
    queryFn: async () => {
      const { data } = await futureClient.query({
        query: searchTokensV3,
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

  const { handleRowClick, handleRowAddressClick } = useHandleLogic()
  const [favoriteTokensInitial, setFavoriteTokensInitial] = useState<TokenTrending[]>(favoriteTokens)
  const [listTokenMeme, setListTokenMeme] = useState<TokenTrending[]>(favoriteTokens)

  const columns = useTableColumns(setFavoriteTokensInitial, setFavoriteTokens, trendingVariables, debounceValue)
  const columnsAddress = useTableColumnsAddress(debounceValue)

  useEffect(() => {
    setFavoriteTokensInitial(favoriteTokens)
  }, [favoriteTokens])

  const tableData = useMemo(() => {
    if (debounceValue && debounceValue.trim() !== '') {
      const searchResults = dataSearch || []
      if (searchResults.some((e: any) => e.__typename === 'SearchWalletData')) {
        return searchResults
      }

      return searchResults.map((searchToken: any) => {
        const isFavorite = favoriteTokensInitial.some(
          (favToken) => favToken.token.toLowerCase() === searchToken.token.toLowerCase(),
        )

        return {
          ...searchToken,
          isFavorite: isFavorite,
        }
      })
    } else {
      return favoriteTokensInitial.map((token) => ({
        ...token,
        isFavorite: true,
      }))
    }
  }, [debounceValue, dataSearch, favoriteTokensInitial])
  const isSearchWalletData = useMemo(() => tableData.some((e: any) => e.__typename === 'SearchWalletData'), [tableData])

  useEffect(() => {
    if (isSearchWalletData) {
      setListTokenMeme(tableData)
    } else {
      const updatedTokens = tableData.map((item: any) => {
        return {
          ...item,
          price: item.price,
          price24hChange: item.price24hChange?.toString() ?? '',
        }
      })
      setListTokenMeme(updatedTokens as TokenTrending[])
    }
  }, [tableData, isSearchWalletData])

  return (
    <div>
      <div className={cn('relative')}>
        {/* <TableVirtual
          columns={isSearchWalletData ? columnsAddress : columns}
          isLoading={loading}
          data={listTokenMeme}
          onRowClick={(e) => {
            handleRowClick(e, true)
            setOpen(false)
          }}
          isStickyHeader={true}
          containerClassName="!border-none _hidescrollbar h-full"
          tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400] bg-[#212127] px-2"
          tableHeaderRowClassName="!border-none"
          tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-2.5 justify-end px-2-custom px-last-child"
          emptyText={t('wallet.noData')}
          tableRowClassName="!border-none"
          tableHeadClassName="px-last-child px-0 h-[30px]"
          rowHeight={54}
          cusTomMaxHeightPC={type === TokenSearchDrawerType.CRYPTO ? 'calc(94vh - 203px)' : 'calc(86vh - 203px)'}
        /> */}
        <DataTable
          isLoading={loading}
          columns={isSearchWalletData ? columnsAddress : columns}
          data={listTokenMeme}
          onRowClick={(e) => {
            if (isSearchWalletData) {
              handleRowAddressClick({ address: e.address, chainId: e.chainId })
            } else {
              handleRowClick(e, true)
            }
            setOpen(false)
          }}
          isStickyHeader={true}
          containerClassName={cn(
            '!border-none _hidescrollbar h-full !overflow-auto',
            type === TokenSearchDrawerType.MEME ? 'max-h-[calc(86vh-162px)]' : 'max-h-[calc(94vh-162px)]',
          )}
          tableHeaderClassName={`text-[#908E98] text-[calc(1rem*(11/16))] app-font-light px-2 sticky bg-[#212127]`}
          tableHeaderRowClassName="!border-none h-[24px]"
          tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none py-2.5 justify-end"
          tableBodyRowClassName="border-0 no-padding-top"
          skeletonComponent={<SkeletonList count={10} classNameItem="h-[53px]" />}
          noDataText={t('wallet.noData')}
          emptyComponent={
            <div className="flex justify-center">
              <IconEmptyV3 />
            </div>
          }
        />
      </div>
    </div>
  )
}
