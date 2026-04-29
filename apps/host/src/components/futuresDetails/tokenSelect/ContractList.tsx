import Text from '@/components/common/Text'
import { LeverageBadge, PriceChangePC } from '@/components/futuresDiscover/table/crypto-table'
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
import CrytoSearchResultsList from '../tokenSearchDrawer/CrytoSearchResultsList'
import useHandleLogic from '../tokenSearchDrawer/hooks/useHandleLogic'
import { useAppDispatch } from '@/redux/store'
import { routerActions } from '@/redux/modules/router.slice'
import { cn } from '@/lib/utils'
import useSymbolListSubscription, { useMergedData } from '@/pages/futures-market/hooks/useSymbolListSubscription'

const useTableColumnsWithSort = (
  setSymbolList: Dispatch<SetStateAction<ISymbolList[]>>,
  setSymbolInitial: Dispatch<SetStateAction<ISymbolList[]>>,
  setIsFavoriteChange: Dispatch<SetStateAction<boolean>>,
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void,
  search?: string,
  isdesktop?: boolean,
) => {
  const columnHelper = createColumnHelper<ISymbolList>()

  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
        enableSorting: false,
        header: () => (
          <div className="!min-w-[180px] flex items-center">
            <Text text={t('tokenSearchDrawer.tableHeaders.token')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
          </div>
        ),
        cell: (info) => {
          const { symbol, maxLeverage, isFavorite, changPxPercent, currentPrice, volume } = info.row.original
          return (
            <div className="min-w-[180px] flex items-center space-x-2">
              <ConfirmCollectToken
                defaultCollect={isFavorite ?? false}
                token={symbol}
                tokenInfor={{ symbol, maxLeverage, changPxPercent, currentPrice, volume }}
                onRemoveSuccess={() => {
                  setSymbolList((prev) =>
                    prev.map((item) => {
                      if (item.symbol === symbol) {
                        return { ...item, isFavorite: false }
                      }
                      return item
                    }),
                  )
                  setSymbolsFavorite((prev) => prev.filter((item) => item.symbol !== symbol))
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
              <div className="flex items-center gap-1">
                <Text text={symbol} fontSize={13} fontWeight="medium" highLightText={search} highLightColor="#AB57FF" />
                <Text text="/USDC" fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <LeverageBadge value={maxLeverage as unknown as string} />
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('currentPrice', {
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className={cn('flex justify-end items-center gap-1', !isdesktop && 'cursor-pointer select-none')}
            onClick={!isdesktop ? column.getToggleSortingHandler() : undefined}
          >
            <Text text={t('tokenSearchDrawer.tableHeaders.price')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            {!isdesktop && (
              <div className="flex flex-col leading-none items-center ml-1 gap-0.5">
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="asc"
                  className="w-1.5 h-1.5 rotate-180"
                  style={{ opacity: column.getIsSorted() === 'asc' ? 1 : 0.5 }}
                />
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="desc"
                  className="w-1.5 h-1.5 -mt-0.5"
                  style={{ opacity: column.getIsSorted() === 'desc' ? 1 : 0.5 }}
                />
              </div>
            )}
          </div>
        ),
        cell: (info: any) => {
          const currentPrice = info.getValue()
          return (
            <div className="flex justify-end opacity-80">
              <Text
                text={formatNumberWithCommas(`${currentPrice}`)}
                fontSize={13}
                fontWeight="medium"
                className="lining-nums"
              />
            </div>
          )
        },
      }),

      columnHelper.accessor('changPxPercent', {
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className={cn('flex justify-end items-center gap-1', !isdesktop && 'cursor-pointer select-none')}
            onClick={!isdesktop ? column.getToggleSortingHandler() : undefined}
          >
            <Text
              text={t('tokenSearchDrawer.tableHeaders.24hChange')}
              fontSize={11}
              fontWeight="light"
              color="#FFFFFF80"
            />
            {!isdesktop && (
              <div className="flex flex-col leading-none items-center ml-1 gap-0.5">
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="asc"
                  className="w-1.5 h-1.5 rotate-180"
                  style={{ opacity: column.getIsSorted() === 'asc' ? 1 : 0.5 }}
                />
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="desc"
                  className="w-1.5 h-1.5 -mt-0.5"
                  style={{ opacity: column.getIsSorted() === 'desc' ? 1 : 0.5 }}
                />
              </div>
            )}
          </div>
        ),
        cell: (info) => {
          const changePercent = info.getValue()
          return (
            <div className="flex justify-end">
              <PriceChangePC value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
            </div>
          )
        },
      }),

      columnHelper.accessor('volume', {
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className={cn('flex justify-end items-center gap-1', !isdesktop && 'cursor-pointer select-none')}
            onClick={!isdesktop ? column.getToggleSortingHandler() : undefined}
          >
            <Text
              text={t('tokenSearchDrawer.tableHeaders.volume')}
              fontSize={11}
              fontWeight="light"
              color="#FFFFFF80"
            />
            {!isdesktop && (
              <div className="flex flex-col leading-none items-center ml-1 gap-0.5">
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="asc"
                  className="w-1.5 h-1.5 rotate-180"
                  style={{ opacity: column.getIsSorted() === 'asc' ? 1 : 0.5 }}
                />
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="desc"
                  className="w-1.5 h-1.5 -mt-0.5"
                  style={{ opacity: column.getIsSorted() === 'desc' ? 1 : 0.5 }}
                />
              </div>
            )}
          </div>
        ),
        cell: (info: any) => {
          const volume = info.getValue()
          return (
            <div className="flex justify-end opacity-80">
              <Text text={formatMoney(volume)} fontSize={13} fontWeight="medium" className="lining-nums" />
            </div>
          )
        },
      }),

      columnHelper.accessor('funding', {
        id: 'funding',
        sortingFn: 'auto',
        header: ({ column }) => (
          <div
            className={cn('flex justify-end items-center gap-1', !isdesktop && 'cursor-pointer select-none')}
            onClick={!isdesktop ? column.getToggleSortingHandler() : undefined}
          >
            <Text text={t('futuresDetails.common.fundingRate')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            {!isdesktop && (
              <div className="flex flex-col leading-none items-center ml-1 gap-0.5">
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="asc"
                  className="w-1.5 h-1.5 rotate-180"
                  style={{ opacity: column.getIsSorted() === 'asc' ? 1 : 0.5 }}
                />
                <img
                  src="/images/futuresDetail/triangle.svg"
                  alt="desc"
                  className="w-1.5 h-1.5 -mt-0.5"
                  style={{ opacity: column.getIsSorted() === 'desc' ? 1 : 0.5 }}
                />
              </div>
            )}
          </div>
        ),
        cell: (info) => {
          const fundingRate = info.getValue()
          const isPositive = Number(fundingRate) > 0
          return (
            <div
              className={cn(
                'flex justify-end text-[13px] app-font-medium lining-nums',
                `${!isdesktop ? (isPositive ? 'text-rise' : 'text-fall') : 'text-[#FFFFFF]'}`,
              )}
            >
              {Number(fundingRate || 0) >= 0
                ? `${(Number(fundingRate || 0) * 100).toFixed(4)}`
                : (Number(fundingRate || 0) * 100).toFixed(4)}
              %
            </div>
          )
        },
      }),
    ],
    [search, isdesktop],
  )
}

const ContractList = ({
  symbolDataInitial,
  search,
  isLoading,
  allowShowList,
  isFavorite,
  favoriteTokens,
  setOpen,
  setSymbolsFavorite,
  setIsFavoriteChange,
  isfuturesSearch = false,
  isdesktop = false,
  cusTomMaxHeightPC,
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
  isdesktop?: boolean
  cusTomMaxHeightPC?: string
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
  {
    /* t如果是合约搜索 只展示前20条 */
  }
  const initialData = isfuturesSearch && !isdesktop ? sortedData.slice(0, 20) : sortedData
  const currentData = useMergedData(initialData, symbolData)
  const columns = useTableColumnsWithSort(
    setSymbolInitial,
    setSymbolList,
    setIsFavoriteChange,
    setSymbolsFavorite,
    search,
    isdesktop,
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
    <>
      {!allowShowList ? (
        <CrytoSearchResultsList
          search={search}
          favoriteTokens={favoriteTokens}
          setSymbolsFavorite={setSymbolsFavorite}
        />
      ) : (
        <TableVirtual<ISymbolList, any>
          isLoading={isLoading}
          columns={columns}
          data={currentData}
          initialSorting={[{ id: 'volume', desc: true }]}
          isStickyHeader={true}
          onRowClick={handleRowClick}
          containerClassName={cn('!border-none _hidescrollbar h-full', isdesktop && '!pb-0')}
          cusTomMaxHeightPC={cusTomMaxHeightPC}
          tableClassName="table-fixed w-full"
          tableHeaderClassName={`text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400] ${isfuturesSearch && !isdesktop ? 'bg-[#121212]' : 'bg-[#232329] '}`}
          tableHeaderRowClassName="!border-none"
          tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-1 justify-end px-2-custom px-last-child"
          emptyText={t('wallet.noData')}
          tableRowClassName="!border-none"
          tableHeadClassName="h-[30px]"
          isSearchList
          rowHeight={40}
          // tableClassName="table-fixed"
        />
      )}
    </>
  )
}

export default memo(ContractList)
