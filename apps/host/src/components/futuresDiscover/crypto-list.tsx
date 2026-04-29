import { createColumnHelper } from '@tanstack/react-table'
import React, { memo, useCallback, useMemo } from 'react'

import { APP_PATH } from '@/lib/constant'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'
import Text from '../common/Text'
import { IconSortDown, IconSortUp } from '../icon'
import { ISymbolList } from './list-coin-crypto'
import { LeverageBadge, PriceChange } from './table/crypto-table'
import { TableVirtual } from './table/table-virtual'
import { headerTabs } from '@/pages/futures-market/type'
import { useTranslation } from 'react-i18next'

const ViewMoreButton = memo(({ onClick, dataLength }: { onClick: () => void; dataLength: number }) => {
  const { t } = useTranslation()
  if (dataLength === 0) return null

  return (
    <div
      className="rounded-[50px] h-[calc(1rem*(44/16))] hover:scale-[101%] transition-all duration-300 cursor-pointer flex gap-1 w-fit bg-[#ECECED14] justify-center items-center px-4 mx-auto"
      onClick={onClick}
    >
      <p className="text-[calc(1rem*(11/16))] text-[#FFFFFFB2]">{t('futuresMarket.showMore')} 100+ coins</p>
      <img src="/images/listCoinCrypto/more-1.svg" alt="" className="size-6" />
    </div>
  )
})

ViewMoreButton.displayName = 'ViewMoreButton'

const useRowNavigation = () => {
  const navigate = useNavigate()

  return useCallback(
    (row: ISymbolList) => {
      navigate(`/futures/${row.symbol}`)
    },
    [navigate],
  )
}

const SortHeader = React.memo(
  ({
    text,
    onSort,
    sortIndicator,
  }: {
    text: string
    onSort: () => void
    sortIndicator: { upColor: string; downColor: string }
  }) => (
    <div className="flex cursor-pointer" onClick={onSort}>
      <Text text={text} fontSize={11} fontWeight="light" color="#FFFFFF80" className="cursor-pointer" />
      <div className="flex flex-col ml-1 cursor-pointer">
        <IconSortUp currentColor={sortIndicator.upColor} />
        <IconSortDown currentColor={sortIndicator.downColor} />
      </div>
    </div>
  ),
)

SortHeader.displayName = 'SortHeader'

const CryptoList = ({
  initialData,
  isLoading,
  total,
}: {
  initialData: ISymbolList[]
  isLoading: boolean
  total: number
}) => {
  const handleRowClick = useRowNavigation()
  const columnHelper = createColumnHelper<ISymbolList>()
  const { t } = useTranslation()
  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5">
              <Text text={t('tokenSearchDrawer.tableHeaders.token')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text text={t('tokenSearchDrawer.tableHeaders.marketCap')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const { symbol, maxLeverage, marketCap } = info.row.original
          return (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-end">
                  <Text text={symbol} fontSize={15} fontWeight="medium" className="leading-[calc(1rem*(15/16))]" />
                  <Text
                    text="/"
                    fontSize={9}
                    fontWeight="light"
                    color="#FFFFFF80"
                    className="leading-[calc(1rem*(12/16))]"
                  />
                  <Text
                    text="USDC"
                    fontSize={11}
                    fontWeight="light"
                    color="#FFFFFF80"
                    className="leading-[calc(1rem*(11/16))] pr-1"
                  />
                  <LeverageBadge value={`${maxLeverage}`} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="text-[calc(1rem*(12/16))] tex-[#FFFFFFB2]">{formatMoney(marketCap)}</div>
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
              <Text text={t('tokenSearchDrawer.tableHeaders.price')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text text={t('tokenSearchDrawer.tableHeaders.volume')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info: any) => {
          const { volume } = info.row.original
          const currentPrice = info.getValue()

          return (
            <div className="flex items-end gap-1 flex-col relative">
              {/* {activeId === id && (
                  <div ref={favoriteStarRef}>
                    <FavoriteStar
                      isFavorite={isFavorite}
                      onClick={() => (isFavorite ? setIsOpenConfirm(true) : handleFavoriteClick(id))}
                    />
                  </div>
                )} */}
              <Text text={formatNumberWithCommas(`${currentPrice}`, 9)} fontSize={15} fontWeight="medium" />
              <Text text={formatMoney(volume)} fontSize={11} fontWeight="regular" color="#FFFFFFB2" />
            </div>
          )
        },
      }),

      columnHelper.accessor('changPxPercent', {
        header: () => (
          <div className="flex justify-end gap-2">
            <div className="flex items-center text-right">
              <Text text={t('tokenSearchDrawer.tableHeaders.24hChange')} fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const changePercent = info.getValue()
          return <PriceChange value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
        },
      }),
    ],
    [columnHelper],
  )

  const navigate = useNavigate()

  const handleViewMore = useCallback(() => {
    localStorage.setItem('marketTab', headerTabs[1].value)
    navigate(APP_PATH.MARKET)
    
  }, [navigate])

  // table-fixed
  return (
    <div className="px-[14px]">
      <TableVirtual<ISymbolList, any>
        columns={columns}
        data={initialData}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        isStickyHeader={true}
        // tableClassName="table-fixed"
        containerClassName="!border-none _hidescrollbar h-full"
        tableHeaderClassName="text-[#FFFFFF80] h-[26px] text-[calc(1rem*(12/16))] font-[400]"
        tableHeaderRowClassName="!border-none"
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-3 justify-end px-table-cell w-27-precent"
        tableHeadClassName="px-table-cell bg-[#0A0A0A] w-27-precent"
        tableRowClassName="!border-none"
        renderFooter={() => <ViewMoreButton onClick={handleViewMore} dataLength={total} />}
       
      />
      <ViewMoreButton onClick={handleViewMore} dataLength={total} />
    </div>
  )
}

export default React.memo(CryptoList)
