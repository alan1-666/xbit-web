import Text from '@/components/common/Text'
import { LeverageBadge, PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { SEARCH_SYMBOL_ENDPOINT } from '@/services/symbol.dex.service'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ConfirmCollectToken from './ConfirmCollectToken'
import useHandleLogic from './hooks/useHandleLogic'

const CrytoSearchResultsList = ({
  search,
  favoriteTokens,
  setSymbolsFavorite,
}: {
  search: string
  favoriteTokens?: ISymbolList[]
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void
}) => {
  const columnHelper = createColumnHelper<ISymbolList>()
  const navigate = useNavigate()
  const { saveToHistory } = useHandleLogic()
  const [loading, setLoading] = useState(false)
  const [popularSymbols, setPopularSymbols] = useState<ISymbolList[]>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => <></>,
        cell: (info) => {
          const { symbol, maxLeverage, marketCap, isFavorite, changPxPercent, currentPrice, volume } = info.row.original
          return (
            <div className="flex items-center space-x-2">
              <ConfirmCollectToken
                defaultCollect={isFavorite ?? false}
                token={symbol}
                tokenInfor={{ symbol, maxLeverage, marketCap, changPxPercent, currentPrice, volume }}
                tokenSymbol={symbol}
                triggerClassName="p-0"
                onAdded={() => {
                  setSymbolsFavorite((prev) => [...prev, info.row.original])
                }}
                onRemove={() => {
                  setSymbolsFavorite((prev) => prev.filter((item) => item.symbol !== symbol))
                }}
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-end">
                  <Text
                    text={symbol}
                    fontSize={15}
                    fontWeight="medium"
                    className="leading-[calc(1rem*(15/16))]"
                    highLightText={search.split(' ').join('').toUpperCase()}
                  />
                  <Text
                    text="/"
                    fontSize={9}
                    fontWeight="light"
                    color="#FFFFFF80"
                    className="leading-[calc(1rem*(12/16))]"
                    highLightText={search.split(' ').join('').toUpperCase()}
                  />
                  <Text
                    text="USDC"
                    fontSize={11}
                    fontWeight="light"
                    color="#FFFFFF80"
                    className="leading-[calc(1rem*(11/16))] pr-1"
                  />
                  <LeverageBadge value={maxLeverage as unknown as string} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="text-[calc(1rem*(12/16))] tex-[#FFFFFFB2] lining-nums">{formatMoney(marketCap)}</div>
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('currentPrice', {
        header: () => <></>,
        cell: (info: any) => {
          const currentPrice = info.getValue()
          const volume = info.row.original.volume
          return (
            <div className="flex items-end gap-1 flex-col relative">
              {/* <Text text={formatMoney(currentPrice)} fontSize={15} fontWeight="medium" className="lining-nums" /> */}
              <Text
                text={formatNumberWithCommas(`${currentPrice}`, 9)}
                fontSize={15}
                fontWeight="medium"
                className="lining-nums"
              />
              <Text
                text={formatMoney(volume)}
                fontSize={11}
                fontWeight="regular"
                color="#FFFFFFB2"
                className="lining-nums"
              />
            </div>
          )
        },
      }),

      columnHelper.accessor('changPxPercent', {
        header: () => <></>,
        cell: (info) => {
          const changePercent = info.getValue()
          return <PriceChange value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
        },
      }),
    ],
    [columnHelper, search],
  )

  const handleSearchResult = async () => {
    try {
      setLoading(true)
      const { data } = await symbolDexClient.query({
        query: SEARCH_SYMBOL_ENDPOINT,
        variables: {
          input: {
            filter: search.split(' ').join('').toUpperCase(),
          },
        },
      })
      setPopularSymbols(
        data?.searchSymbol?.list.map((token: ISymbolList) => {
          const symbolFavorite = favoriteTokens?.find((symbol) => symbol.symbol === token.symbol)
          if (symbolFavorite) {
            return {
              ...token,
              isFavorite: true,
            }
          }
          return {
            ...token,
          }
        }),
      )
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (search) {
      handleSearchResult()
    }
  }, [search])

  const handleRowClick = useCallback(
    (row: any) => {
      saveToHistory({ address: row.symbol, name: row.symbol, logo: row.image, chainId: row.chainId }, 'dex')
      navigate(`/futures/${row.symbol}`)
    },
    [navigate],
  )

  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <TableVirtual<ISymbolList, any>
        isLoading={loading}
        columns={columns}
        data={popularSymbols}
        isStickyHeader={true}
        isShowHeader={false}
        onRowClick={handleRowClick}
        containerClassName="!border-none _hidescrollbar h-full"
        tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400] bg-[#232329] px-2"
        tableHeaderRowClassName="!border-none"
        tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-2.5 justify-end px-2-custom px-last-child"
        emptyText={t('wallet.noData')}
        tableRowClassName="!border-none"
        tableHeadClassName="px-last-child px-0 h-[30px]"
        isSearchList
        rowHeight={60}
      />
    </div>
  )
}

export default CrytoSearchResultsList
