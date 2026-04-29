import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import Text from '@/components/common/Text'
import { PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { formatAddressWallet } from '@/lib/string'
import { searchTokensV3 } from '@/services/tokens.service'
import { formatLongValue, formatMoney, getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState, useTransition } from 'react'

import { MemeDto } from '@/@generated/gql/graphql-core'
import { ChainType } from '@/@generated/gql/graphql-user'
import { CopyButton } from '@/components/common/copy-button'
import { IconXStock } from '@/components/common/tags/IconXStock'
import IconOfficial from '@/components/detailInfo/IconOfficial'
import { IconEmptyV3 } from '@/components/icon'
import { SkeletonList } from '@/components/ui/skeleton'
import { Configs } from '@/const/configs'
import { useNativeTokenSymbol } from '@/hooks/useActiveChain'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatBalance } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import ls from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { DataTable } from '@/pages/home/data-table'
import { ChainIds } from '@/types/enums'
import { TokenTrending } from '@/types/token'
import { getDexLogo } from '@/utils/lauchpad'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { useTranslation } from 'react-i18next'
import ConfirmCollectTokenMeme from './ConfirmCollectTokenMeme'
import MemeSearchResultsList from './MemeSearchResultsList'
import useHandleLogic from './hooks/useHandleLogic'
import useItemTokenOHLC from './hooks/useItemTokenOHLC'
import { useTokenTrendingSearchBar } from './hooks/useTokenTrendingSearchBar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { TOKEN_TRENDING_SEARCH_BAR_KEY, TOKEN_TRENDING_SEARCH_BAR_MS } from '@/components/futuresDiscover/futuresSearch'
import { TokenTrendingSearchBarData } from '@/@generated/gql/graphql-meme2'
import { mappedChainIdToTypeChain, mappedChainTypeToChainId } from '@/redux/modules/newWallet.slice'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'
import { useAppSelector } from '@/redux/store'

interface SearchResultsListProps {
  debounceValue: string
  allowShowList?: boolean
  favoriteTokens: TokenTrending[]
  setOpen: Dispatch<SetStateAction<boolean>>
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
  isfuturesSearch?: boolean
  allowSwitchChain?: boolean
  className?: string
}

// Memoized cell components to prevent unnecessary re-renders
const SymbolCell = memo(
  ({
    info,
    debounceValue,
    setListTokenMeme,
    setFavoriteTokens,
    trendingVariables,
  }: {
    info: any
    debounceValue?: string
    setListTokenMeme: Dispatch<SetStateAction<TokenTrending[]>>
    setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
    trendingVariables: {
      input: {
        chain: string
        dex: string
        direction: string
        timeRange: string
      }
    }
  }) => {
    const { chainId, token, image, symbol, isFavorite, metadataCustom, isXStock } = info.row.original
    const chainLogo = getBlockchainLogo2(chainId)
    const tokenLogo = image ?? getBlockChainLogo(chainId, token)
    const isOfficial = Boolean(metadataCustom?.isOfficial)

    const { updateCacheWithFavorite } = useTokenTrendingSearchBar(trendingVariables)

    const getLaunchpadLogo = (token: MemeDto) => {
      const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
      return launchpad ? getDexLogo(launchpad) : undefined
    }

    const queryClient = useQueryClient()

    const updateSearchCache = (isFav: boolean) => {
      if (!debounceValue) return
      queryClient.setQueryData(['searchTokensV3', debounceValue], (old: any) => {
        if (!old) return old

        return old.map((t: any) => {
          if (t.token === token) {
            return { ...t, isFavorite: isFav }
          }
          return t
        })
      })
    }

    return (
      <div className="flex items-center gap-2 flex-3">
        <ConfirmCollectTokenMeme
          token={token}
          defaultCollect={isFavorite}
          tokenSymbol={symbol}
          triggerClassName="p-0"
          chain={mappedChainIdToTypeChain(chainId)}
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
            updateCacheWithFavorite(token, false)
            updateSearchCache(false)
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
            updateCacheWithFavorite(token, true)
            updateSearchCache(true)
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

            {isXStock && (
              <div className="ml-[1px]">
                <IconXStock className="size-[12px]" />
              </div>
            )}
            {!!getLaunchpadLogo(info.row.original) && (
              <img src={getLaunchpadLogo(info.row.original)} alt="" className="size-[10px]" />
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
)

SymbolCell.displayName = 'SymbolCell'

const MarketCapCell = memo(({ info }: { info: any }) => {
  const { token, volume24h, marketcap } = info.row.original

  const { price } = useItemTokenOHLC({
    address: token,
    initMarketcap: Number(marketcap),
    initVolume24h: Number(volume24h),
  })

  return (
    <div className="flex items-end flex-col relative gap-1">
      <span className="text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] app-font-regular">
        {formatMoney(price.marketcap ? price.marketcap : marketcap)}
      </span>
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

MarketCapCell.displayName = 'MarketCapCell'

const PriceChangeCell = memo(({ info }: { info: any }) => {
  const { token, price24hChange } = info.row.original
  const { price } = useItemTokenOHLC({
    address: token,
    initChangePercent: Number(price24hChange),
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
  setListTokenMeme: Dispatch<SetStateAction<TokenTrending[]>>,
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
        cell: (info) => (
          <SymbolCell
            trendingVariables={trendingVariables}
            info={info}
            debounceValue={debounceValue}
            setListTokenMeme={setListTokenMeme}
            setFavoriteTokens={setFavoriteTokens}
          />
        ),
      }),

      columnHelper.accessor('marketcap', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center">
              <Text text={t('orderBook.marketCap')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
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
    [debounceValue],
  )
}

export const useTableColumnsAddress = (debounceValue?: string) => {
  const columnHelper = createColumnHelper<any>()
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5">
              <Text text={t('detail.pool.address')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const { address, alias } = info.row.original
          return (
            <div className="flex gap-1 items-center col-span-2">
              {address && (
                <WalletAvatar
                  data-avatar-type="wallet"
                  address={address}
                  className="size-[36px] block rounded-full mr-2"
                />
              )}
              <div className="flex flex-col h-[32px] justify-center">
                <div className="flex items-center">
                  <Text
                    text={alias === address ? formatAddressWallet(address) : alias}
                    className="!text-[14px] !font-[380]"
                    highLightText={debounceValue}
                    highLightColor="#843BEA"
                    color="#908E98"
                  />
                  <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center pl-0.5 ml-1" text={address} type="tokenAddress" />
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('balance', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-0.5">
              <Text text={t('assets.futures.balance')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const nativeTokenSymbol = useNativeTokenSymbol()
          const { balance } = info.row.original
          return (
            <span className="font-[380] text-[12px] text-[#FFFFFFCC] block text-end">
              {formatBalance(Number(balance))} {nativeTokenSymbol}
            </span>
          )
        },
      }),

      columnHelper.accessor('numTracked', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-0.5">
              <Text text={t('tokenSearchDrawer.Tracked')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const { numTracked } = info.row.original
          return <span className="font-[380] text-[12px] text-[#FFFFFFCC] block text-end">{numTracked ?? '--'}</span>
        },
      }),

      columnHelper.accessor('Renamed', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-0.5">
              <Text text={t('tokenSearchDrawer.Renamed')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const { numAlias } = info.row.original
          return <span className="font-[380] text-[12px] text-[#FFFFFFCC] block text-end">{numAlias ?? '--'}</span>
        },
      }),
    ],
    [debounceValue],
  )
}

export const chains = { eth: ChainType.Evm, sol: ChainType.Solana, arb: 'ALL', bsc: ChainType.Bsc, mon: ChainType.Mon }
export const chainsIds: Record<string, ChainIds> = {
  Solana: ChainIds.Solana,
  bsc: ChainIds.Bsc,
  mon: ChainIds.Mon
}

const MemeList = (props: SearchResultsListProps) => {
  const { t } = useTranslation()

  const {
    debounceValue,
    allowShowList,
    favoriteTokens,
    setOpen,
    setFavoriteTokens,
    isfuturesSearch,
    allowSwitchChain,
    className,
  } = props
  const { handleRowClick, handleRowAddressClick } = useHandleLogic()
  const [listTokenMeme, setListTokenMeme] = useState<TokenTrending[]>([])
  // const memeChain = useMemo<keyof typeof chains>(() => {
  //   const raw = !Configs.enableBSC() ? TYPE_CHAIN.SOLANA : ls.get('meme_chain') || TYPE_CHAIN.SOLANA
  //   return (raw as keyof typeof chains) ?? (TYPE_CHAIN.SOLANA as keyof typeof chains)
  // }, [])
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  // supportedRouteChains
  const memeChain = useMemo(() => {
    if(Configs.supportedRouteChains().includes(activeChain)) return activeChain as TYPE_CHAIN
    return TYPE_CHAIN.BSC
  }, [activeChain])
  
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
  const { getTokenTrendingSearchBar: data, loading, isFromCache } = useTokenTrendingSearchBar(trendingVariables)

  // State to track isFavorite changes due to user actions
  const [favoriteUpdates, setFavoriteUpdates] = useState<Map<string, boolean>>(new Map())

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

  const { data: dataSearch, isLoading: loadingSearch } = useQuery({
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

  const tableData = useMemo(() => {
    return debounceValue ? dataSearch || [] : data
  }, [debounceValue, dataSearch, data])

  const isSearchWalletData = useMemo(() => tableData.some((e: any) => e.__typename === 'SearchWalletData'), [tableData])

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
    trendingVariables,
    debounceValue,
  )

  const columnsAddress = useTableColumnsAddress(debounceValue)

  // const favoriteTokensMap = useMemo(() => {
  //   return new Map(favoriteTokens.map((token) => [token.token, token]))
  // }, [favoriteTokens])

  useEffect(() => {
    setListTokenMeme(tableData)
    // if (isSearchWalletData) {
    // } else {
    //   const updatedTokens = tableData.map((item: any) => {
    //     const userUpdate = favoriteUpdates.get(item.token)
    //     const tokenFavorite = favoriteTokensMap.get(item.token)
    //     return {
    //       ...item,
    //       price: item.price,
    //       price24hChange: item.price24hChange?.toString() ?? '',
    //       isFavorite: userUpdate !== undefined ? userUpdate : !!tokenFavorite,
    //     }
    //   })
    //   setListTokenMeme(updatedTokens as TokenTrending[])
    // }
  }, [tableData])

  useEffect(() => {
    if (loading || loadingSearch) {
      setLoadingDelay(true)
    } else {
      startTransition(() => {
        setLoadingDelay(false)
      })
    }
  }, [loading, loadingSearch])

  const renderTable = useCallback(() => {
    if (!allowShowList) {
      return (
        <MemeSearchResultsList
          debounceValue={debounceValue}
          favoriteTokens={favoriteTokens}
          setFavoriteTokens={setFavoriteTokens}
        />
      )
    }
    return (
      <div className={cn('', className)}>
        <DataTable
          isLoading={loadingDelay}
          columns={isSearchWalletData ? columnsAddress : columns}
          data={listTokenMeme}
          onRowClick={(e) => {
            if (isSearchWalletData) {
              if (e.address) {
                handleRowAddressClick({ address: e.address, chainId: e.chainId })
              }
            } else {
              handleRowClick(e, allowSwitchChain)
            }
            setOpen(false)
          }}
          isStickyHeader={true}
          containerClassName={cn(
            '!border-none _hidescrollbar h-full !overflow-visible',
            !isfuturesSearch ? '!overflow-auto max-h-[calc(86vh-114px)]' : 'bg-[#0A0A0A]',
          )}
          tableHeaderClassName={`text-[#908E98] text-[calc(1rem*(11/16))] app-font-light px-2 sticky ${!isfuturesSearch ? 'bg-[#212127]' : 'bg-[#0A0A0A]'}`}
          tableHeaderRowClassName="!border-none h-[24px]"
          tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none py-2.5 justify-end px-last-child"
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
    )
  }, [
    allowShowList,
    debounceValue,
    favoriteTokens,
    loadingDelay,
    listTokenMeme,
    columns,
    handleRowClick,
    setOpen,
    t,
    isFromCache,
    isSearchWalletData,
    columnsAddress,
    handleRowAddressClick,
    allowSwitchChain,
    setFavoriteTokens,
    isfuturesSearch,
    className,
  ])

  return <div className="">{renderTable()}</div>
}

export default memo(MemeList)
