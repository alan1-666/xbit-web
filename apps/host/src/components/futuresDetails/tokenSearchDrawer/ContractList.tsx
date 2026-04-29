import Text from '@/components/common/Text'
import { LeverageBadge, PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { useSearchFilter } from '@/pages/futures-market/hooks/useHandleGetData'
import useSortableTable from '@/pages/futures-market/hooks/useSortableTable'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ConfirmCollectToken from './ConfirmCollectToken'
import CrytoSearchResultsList from './CrytoSearchResultsList'
import useHandleLogic from './hooks/useHandleLogic'
import { useAppDispatch } from '@/redux/store'
import { routerActions } from '@/redux/modules/router.slice'
import useSymbolListSubscription, { useMergedData } from '@/pages/futures-market/hooks/useSymbolListSubscription'
import { TokenSearchDrawerType } from '.'
import { DataTable } from '@/pages/home/data-table'
import { SkeletonList } from '@/components/ui/skeleton'
import { IconEmptyV3 } from '@/components/icon'

const useTableColumnsWithSort = (
  setSymbolList: Dispatch<SetStateAction<ISymbolList[]>>,
  setSymbolInitial: Dispatch<SetStateAction<ISymbolList[]>>,
  setIsFavoriteChange: Dispatch<SetStateAction<boolean>>,
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void,
  search?: string,
) => {
  const columnHelper = createColumnHelper<ISymbolList>()

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
                color="#FFFFFF8F"
              />
              <Text text="/" fontSize={12} fontWeight="light" color="#FFFFFF8F" />
              <Text
                text={t('tokenSearchDrawer.tableHeaders.marketCap')}
                fontSize={11}
                fontWeight="light"
                color="#FFFFFF8F"
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const { symbol, maxLeverage, marketCap, isFavorite, changPxPercent, currentPrice, volume } = info.row.original
          return (
            <div className="flex items-center space-x-2">
              <ConfirmCollectToken
                defaultCollect={isFavorite ?? false}
                token={symbol}
                tokenInfor={{ symbol, maxLeverage, marketCap, changPxPercent, currentPrice, volume }}
                onRemoveSuccess={() => {
                  setSymbolList((prev) =>
                    prev.map((item) => {
                      if (item.symbol === symbol) {
                        return { ...item, isFavorite: false }
                      }
                      return item
                    }),
                  )

                  // Remove token from favorites list
                  setSymbolsFavorite((prev) => prev.filter((item) => item.symbol !== symbol))

                  // Update the initial list
                  setSymbolInitial((prev) =>
                    prev.map((e) => {
                      if (e.symbol === symbol) {
                        return { ...e, isFavorite: false }
                      }
                      return e
                    }),
                  )
                }}
                onAdded={() => {
                  setSymbolInitial((prev) =>
                    prev.map((e) => {
                      if (e.symbol === symbol) {
                        return {
                          ...e,
                          isFavorite: true,
                        }
                      }
                      return { ...e }
                    }),
                  )
                  setSymbolsFavorite((prev) => [...prev, info.row.original])
                  setIsFavoriteChange(true)
                }}
                tokenSymbol={symbol}
                triggerClassName="p-0"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-end">
                  <Text
                    text={symbol}
                    fontSize={15}
                    fontWeight="light"
                    className="leading-[calc(1rem*(15/16))]"
                    highLightText={search}
                    highLightColor="#843BEA"
                  />
                  <Text
                    text="/"
                    fontSize={11}
                    fontWeight="light"
                    color="#908E98"
                    className="leading-[calc(1rem*(12/16))]"
                  />
                  <Text
                    text="USDC"
                    fontSize={11}
                    fontWeight="light"
                    color="#908E98"
                    className="leading-[calc(1rem*(11/16))] pr-1"
                  />
                  <LeverageBadge value={maxLeverage as unknown as string} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] text-[#908E98] lining-nums">
                    {formatMoney(marketCap)}
                  </div>
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('currentPrice', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-0.5">
              <Text
                text={t('tokenSearchDrawer.tableHeaders.price')}
                fontSize={11}
                fontWeight="light"
                color="#FFFFFF8F"
              />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text
                text={t('tokenSearchDrawer.tableHeaders.volume')}
                fontSize={11}
                fontWeight="light"
                color="#FFFFFF8F"
              />
            </div>
          </div>
        ),
        cell: (info: any) => {
          const currentPrice = info.getValue()
          const volume = info.row.original.volume
          return (
            <div className="flex items-end gap-1 flex-col relative">
              {/* <Text text={formatMoney(currentPrice)} fontSize={15} fontWeight="medium" className="lining-nums" /> */}
              <Text
                text={formatNumberWithCommas(`${currentPrice}`, 9)}
                fontSize={15}
                fontWeight="light"
                className="lining-nums leading-[calc(1rem*(15/16))]"
              />
              <Text
                text={formatMoney(volume)}
                fontSize={12}
                fontWeight="regular"
                color="#908E98"
                className="lining-nums leading-[calc(1rem*(12/16))]"
              />
            </div>
          )
        },
      }),

      columnHelper.accessor('changPxPercent', {
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
        cell: (info) => {
          const changePercent = info.getValue()
          return <PriceChange value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
        },
      }),
    ],
    [search],
  )
}

const ContractList = ({
  symbolDataInitial,
  search,
  isLoading,
  allowShowList,
  isFavorite,
  type,
  favoriteTokens,

  setOpen,
  setSymbolsFavorite,
  setIsFavoriteChange,
  isfuturesSearch = false,
  hideFavoriteTokens,
}: {
  symbolDataInitial: ISymbolList[]
  search: string
  setIsFavoriteChange: Dispatch<SetStateAction<boolean>>
  isLoading?: boolean
  allowShowList?: boolean
  isFavorite?: boolean
  favoriteTokens?: ISymbolList[]
  setOpen: Dispatch<SetStateAction<boolean>>
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void
  isfuturesSearch?: boolean
  type?: TokenSearchDrawerType
  hideFavoriteTokens?: boolean
}) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { saveToHistory } = useHandleLogic()
  const navigate = useNavigate()
  const [symbolList, setSymbolList] = useState<ISymbolList[]>(symbolDataInitial)
  const [symbolInitial, setSymbolInitial] = useState<ISymbolList[]>(symbolDataInitial)

  const filteredData = useSearchFilter(
    (symbolInitial || []).map((item) => ({
      ...item,
      openInterest: item.openInterest ?? '',
    })),
    search,
  )

  const { sortedData } = useSortableTable<any>(!isFavorite ? symbolList : filteredData)
  const { symbolData } = useSymbolListSubscription({
    shouldSkip: false,
  })
  const initialData = isfuturesSearch ? sortedData.slice(0, 20) : sortedData

  const currentData = useMergedData(initialData, symbolData)

  {
    /* t如果是合约搜索 只展示前20条 */
  }
  const columns = useTableColumnsWithSort(
    setSymbolInitial,
    setSymbolList,
    setIsFavoriteChange,
    setSymbolsFavorite,
    search,
  )

  // const fetchSymbolList = async () => {
  //   setLoadingDelay(true)
  //   const { data } = await symbolDexClient.query({
  //     query: SEARCH_SYMBOL_ENDPOINT,
  //     variables: {
  //       input: {
  //         filter: ''
  //       },
  //     },
  //   })
  //   if (data) {
  //      startTransition(() => {
  //       setLoadingDelay(false)
  //       setFetchedSymbolList(data?.searchSymbol?.list)
  //     })
  //   }

  // }

  const handleRowClick = useCallback(
    (row: any) => {
      saveToHistory({ address: row.symbol, name: row.symbol, logo: row.image, chainId: row.chainId }, 'dex')
      dispatch(routerActions.setHeaderTab('crypto'))
      navigate(`/futures/${row.symbol}`)
      setOpen(false)
    },
    [navigate],
  )

  useEffect(() => {
    if (search !== '') {
      let filterData = symbolDataInitial.filter((item) => {
        const name = item.symbol.toUpperCase()
        return name.indexOf(search.toUpperCase()) > -1
      })
      if (hideFavoriteTokens) {
        filterData = filterData.filter((item) => !item.isFavorite)
      }
      setSymbolList(filterData)
    }
  }, [symbolDataInitial, search])

  useEffect(() => {
    if (!search) {
      setSymbolList(symbolDataInitial)
    }
  }, [symbolDataInitial, search])

  useEffect(() => {
    setSymbolInitial(symbolDataInitial)
  }, [symbolDataInitial])
  return (
    <div>
      {!allowShowList ? (
        <CrytoSearchResultsList
          search={search}
          favoriteTokens={favoriteTokens}
          setSymbolsFavorite={setSymbolsFavorite}
        />
      ) : (
        <>
          {!isfuturesSearch ? (
            <TableVirtual<ISymbolList, any>
              isLoading={isLoading}
              columns={columns}
              data={currentData}
              isStickyHeader={true}
              onRowClick={handleRowClick}
              containerClassName="!border-none _hidescrollbar h-full"
              tableHeaderClassName={`text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400] px-2 ${'bg-[#212127]'}`}
              tableHeaderRowClassName="!border-none"
              tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none py-2.5 justify-end px-2-custom px-last-child"
              emptyText={t('wallet.noData')}
              tableRowClassName="!border-none"
              tableHeadClassName="px-last-child px-0 h-[30px]"
              isSearchList
              rowHeight={54}
              cusTomMaxHeightPC={
                isFavorite ? (type === TokenSearchDrawerType.CRYPTO ? 'calc(94vh - 203px)' : 'calc(86vh - 203px)') : ''
              }
            />
          ) : (
            <DataTable
              isLoading={isLoading}
              columns={columns}
              data={currentData}
              onRowClick={handleRowClick}
              isStickyHeader={true}
              containerClassName="!border-none _hidescrollbar h-full !overflow-visible"
              tableHeaderClassName={`text-[#908E98] text-[calc(1rem*(11/16))] app-font-light px-2 sticky bg-[#0A0A0A]`}
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
          )}
        </>
      )}
    </div>
  )
}

export default memo(ContractList)
