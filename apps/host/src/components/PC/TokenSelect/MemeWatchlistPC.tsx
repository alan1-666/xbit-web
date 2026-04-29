import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import Text from '@/components/common/Text'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { formatAddressWallet } from '@/lib/string'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { MemeDto } from '@/@generated/gql/graphql-core'
import IconOfficial from '@/components/detailInfo/IconOfficial'
import ConfirmCollectTokenMeme from '@/components/futuresDetails/tokenSearchDrawer/ConfirmCollectTokenMeme'
import useHandleLogic from '@/components/futuresDetails/tokenSearchDrawer/hooks/useHandleLogic'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { TopBarToken } from '@/components/v2/desktop/TokenTopBarCard'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn, getPath } from '@/lib/utils'
import { searchTokensV3 } from '@/services/tokens.service'
import { TokenTrending } from '@/types/token'
import { getDexLogo } from '@/utils/lauchpad'
import { useQuery } from '@apollo/client'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { MarketCapCell, PriceChangeCell } from '../Search'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { useNavigate } from 'react-router-dom'

interface SearchResultsListProps {
  debounceValue: string
  favoriteTokens: TokenTrending[]
  isloading: boolean

  setOpen: Dispatch<SetStateAction<boolean>>
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
}

const useTableColumns = (
  setFavoriteTokensInitial: Dispatch<SetStateAction<TokenTrending[]>>,
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>,
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
                defaultCollect={isFavorite ?? false}
                tokenSymbol={symbol}
                triggerClassName="p-0"
                onRemoveSuccess={() => {
                  setFavoriteTokensInitial((prev) => prev.filter((item) => item.token !== token))
                  setFavoriteTokens((prev) => prev.filter((item) => item.token !== token))

                  queryClient.setQueryData(['topBarTokens', 'favorites'], (oldData: TopBarToken[]) => {
                    const newData = oldData.filter((e) => e.address !== token)
                    return newData
                  })
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
                    className="lining-nums !font-[450]"
                    highLightText={debounceValue}
                    highLightColor="#AB57FF"
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
                    fontSize={10}
                    fontWeight="medium"
                    className="leading-[calc(1rem*(10/16))] mr-1 "
                    highLightText={debounceValue}
                    // highLightColor="#FFFFFF99"
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

export const MemeWatchlistPC = (props: SearchResultsListProps) => {
  const { t } = useTranslation()
  const { debounceValue, favoriteTokens, isloading, setFavoriteTokens } = props

  const { loading, data: dataSearch } = useQuery(searchTokensV3, {
    variables: {
      searchString: debounceValue,
    },
    skip: !debounceValue,
    client: futureClient,
  })
  const { handleRowClick } = useHandleLogic()
  const navigate = useNavigate()
  const [favoriteTokensInitial, setFavoriteTokensInitial] = useState<TokenTrending[]>(favoriteTokens)
  const [listTokenMeme, setListTokenMeme] = useState<TokenTrending[]>(favoriteTokens)

  const columns = useTableColumns(setFavoriteTokensInitial, setFavoriteTokens, debounceValue)

  useEffect(() => {
    setFavoriteTokensInitial(favoriteTokens)
  }, [favoriteTokens])

  const tableData = useMemo(() => {
    if (debounceValue && debounceValue.trim() !== '') {
      const searchResults = dataSearch?.search.data || []

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
  }, [debounceValue, dataSearch?.search.data, favoriteTokensInitial])

  useEffect(() => {
    const updatedTokens = tableData.map((item: any) => {
      return {
        ...item,
        price: item.price,
        price24hChange: item.price24hChange?.toString() ?? '',
      }
    })
    setListTokenMeme(updatedTokens as TokenTrending[])
  }, [tableData])

  return (
    <div>
      <div className={cn('relative')}>
        <TableVirtual
          columns={columns}
          isLoading={loading || isloading}
          data={listTokenMeme}
          onRowClick={(e, event) => {
            event?.stopPropagation()
            event?.preventDefault()
            // handleRowClick(e, true)
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
    </div>
  )
}
