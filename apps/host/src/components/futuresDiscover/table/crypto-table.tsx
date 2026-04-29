import { createColumnHelper } from '@tanstack/react-table'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Text from '../../common/Text'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import ToastCenterScreen from '@/components/futuresDetails/ToastCenterScreen'
import { APP_PATH } from '@/lib/constant'
import useSymbolListSubscription, { useMergedData } from '@/pages/futures-market/hooks/useSymbolListSubscription'
import { formatMoney, formatPercentage } from '@/utils/helpers'
import { Row } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { ISymbolList } from '../list-coin-crypto'
import Confirm from './confirm'
import { DraggableDataTable } from './draggable-data-table'
import FavoriteStar from './favorite-star'

interface LeverageBadgeProps {
  value: string
}

interface PriceChangeProps {
  value: string
  isPositive: boolean
}

export const LeverageBadge = memo<LeverageBadgeProps>(({ value }) => (
  <div className="bg-[#2B2B2B] py-[1px] px-1 ml-1 rounded text-[calc(1rem*(10/16))] flex items-center justify-center">
    <span className="lining-nums text-[#A8A8A8] font-light">{value}X</span>
  </div>
))

LeverageBadge.displayName = 'LeverageBadge'

export const PriceChange = memo<PriceChangeProps>(({ value, isPositive }) => {
  const bgColor = isPositive ? 'var(--bg-positive)' : 'var(--bg-negative)'
  const textColor = 'text-[#FFFFFF]'

  return (
    <div
      className={`${textColor} py-1 rounded-[6px] text-[calc(1rem*(14/16))] app-font-regular text-center sm:w-2/3 ml-auto mt-auto lining-nums max-w-[85px] w-[68px] truncate leading-[calc(1rem*(18/16))]`}
      style={{
        background: bgColor,
      }}
    >
      {isPositive ? '+' : ''}
      {value}
    </div>
  )
})

export const PriceChangeText = memo<PriceChangeProps>(({ value, isPositive }) => {
  // 检查数值是否为 0（支持字符串和数字类型）
  const numericValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value
  const isZero = numericValue === 0 || isNaN(numericValue)
  
  const textColor = isZero ? 'text-white' : (isPositive ? 'text-rise' : 'text-fall')

  return (
    <div
      className={`${textColor} text-[calc(1rem*(12/16))] app-font-regular text-wight sm:w-2/3 ml-auto mt-auto lining-nums truncate leading-[calc(1rem*(18/16))]`}
    >
      {!isZero && isPositive ? '+' : ''}
      {value}
    </div>
  )
})

export const PriceChangePC = memo<PriceChangeProps>(({ value, isPositive }) => {
  const color = isPositive ? 'var(--rise)' : 'var(--fall)'
  return (
    <div
      className={`py-1 rounded-[4px] text-[calc(1rem*(14/16))] font-[500] text-right  ml-auto mt-auto truncate h-[26px] leading-[calc(1rem*(16/16))]`}
      style={{
        color: color,
      }}
    >
      {isPositive ? '+' : ''}
      {value}
    </div>
  )
})

PriceChange.displayName = 'PriceChange'
PriceChangeText.displayName = 'PriceChangeText'

const DraggableRow = memo(({ row, children }: { row: Row<ISymbolList>; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } = useSortable({
    id: row.original.symbol,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
    cursor: active ? 'grabbing' : 'grab',
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group hover:!bg-[#27272a] ${isDragging ? 'bg-[#27272a]' : ''} relative`}
    >
      {children}
    </tr>
  )
})

DraggableRow.displayName = 'DraggableRow'

const useDragSensors = () => {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {}),
  )
}

const useFavoriteHandler = (
  data: ISymbolList[],
  setActiveId: (id: string) => void,
  setIsOpenToast: (open: boolean) => void,
) => {
  const [isAdd] = useState(false)

  const handleFavoriteClick = useCallback(
    (id: string) => {
      setActiveId('')
      setTimeout(() => {
        setIsOpenToast(true)
      }, 300)
    },
    [setActiveId, setIsOpenToast],
  )

  return { isAdd, handleFavoriteClick }
}

const useOutsideClick = (
  ref: React.RefObject<HTMLElement | null>,
  isOpenConfirm: boolean,
  setActiveId: (id: string) => void,
) => {
  useEffect(() => {
    if (isOpenConfirm) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActiveId('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside as unknown as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside as unknown as EventListener)
    }
  }, [isOpenConfirm, ref, setActiveId])
}

const useTableColumns = (
  activeId: string,
  favoriteStarRef: React.RefObject<HTMLDivElement | null>,
  handleFavoriteClick: (id: string) => void,
  setIsOpenConfirm: (open: boolean) => void,
) => {
  const columnHelper = createColumnHelper<ISymbolList>()

  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5">
              <Text text="币种" fontSize={11} fontWeight="light" color="#FFFFFF80" />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text text="市值" fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const { symbol, maxLeverage, marketCap } = info.row.original
          return (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <Text text={symbol} fontSize={15} fontWeight="medium" className="leading-[calc(1rem*(15/16))]" />
                  <Text
                    text="/"
                    fontSize={9}
                    fontWeight="light"
                    color="#FFFFFF80"
                    className="leading-[calc(1rem*(9/16))]"
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
              <Text text="价格" fontSize={11} fontWeight="light" color="#FFFFFF80" />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text text="成交额" fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info: any) => {
          const { id, isFavorite, volume } = info.row.original
          const currentPrice = info.getValue()

          return (
            <div className="flex items-end gap-1 flex-col relative">
              {activeId === id && (
                <div ref={favoriteStarRef}>
                  <FavoriteStar
                    isFavorite={isFavorite}
                    onClick={() => (isFavorite ? setIsOpenConfirm(true) : handleFavoriteClick(id))}
                  />
                </div>
              )}
              <Text text={formatMoney(currentPrice)} fontSize={15} fontWeight="medium" />
              <Text text={formatMoney(volume)} fontSize={11} fontWeight="regular" color="#FFFFFFB2" />
            </div>
          )
        },
      }),

      columnHelper.accessor('changPxPercent', {
        header: () => (
          <div className="flex justify-end gap-2">
            <div className="flex items-center text-right">
              <Text text="24h涨跌幅" fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => {
          const changePercent = info.getValue()
          return <PriceChange value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
        },
      }),
    ],
    [columnHelper, activeId, favoriteStarRef, handleFavoriteClick, setIsOpenConfirm],
  )
}

const useNavigation = () => {
  const navigate = useNavigate()

  const handleViewMore = useCallback(() => {
    navigate(APP_PATH.MARKET)
  }, [navigate])

  return { handleViewMore }
}

const ViewMoreButton = memo(({ onClick, dataLength }: { onClick: () => void; dataLength: number }) => {
  if (dataLength === 0) return null

  return (
    <div
      className="mt-3 rounded-[50px] h-[calc(1rem*(44/16))] hover:scale-[101%] transition-all duration-300 cursor-pointer flex gap-1 w-fit bg-[#ECECED14] justify-center items-center px-4 mx-auto"
      onClick={onClick}
    >
      <p className="text-[calc(1rem*(11/16))] text-[#FFFFFFB2]">查看更多 100+ coins</p>
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

const CryptoTable = ({
  initialData,
  isLoading,
  total,
}: {
  initialData: ISymbolList[]
  isLoading: boolean
  total: number
}) => {
  const [data, setData] = useState<ISymbolList[]>(initialData)
  const [isOpenConfirm, setIsOpenConfirm] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [isOpenToast, setIsOpenToast] = useState(false)
  const favoriteStarRef = useRef<HTMLDivElement>(null)
  const handleRowClick = useRowNavigation()

  const { symbolData } = useSymbolListSubscription({
    shouldSkip: false,
  })
  const currentData = useMergedData(data, symbolData)

  const sensors = useDragSensors()
  const { handleViewMore } = useNavigation()
  const { isAdd, handleFavoriteClick } = useFavoriteHandler(data, setActiveId, setIsOpenToast)
  const columns = useTableColumns(activeId, favoriteStarRef, handleFavoriteClick, setIsOpenConfirm)

  useOutsideClick(favoriteStarRef, isOpenConfirm, setActiveId)

  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map((item) => item.symbol) || [], [data])

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((items) => {
        const oldIndex = items.findIndex((item) => item.symbol === active.id)
        const newIndex = items.findIndex((item) => item.symbol === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleDragMove = useCallback(() => {
    setActiveId('')
  }, [])

  const handleDragStart = useCallback(({ active }: any) => {
    setActiveId(active.id as string)
  }, [])

  const handleConfirmAccept = useCallback(() => {
    handleFavoriteClick(activeId)
  }, [handleFavoriteClick, activeId])

  const handleConfirmCancel = useCallback(() => {
    setActiveId('')
  }, [])

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onDragStart={handleDragStart}
      >
        <div className="">
          <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
            <DraggableDataTable<ISymbolList, any>
              columns={columns}
              data={currentData}
              isStickyHeader={true}
              containerClassName="!border-none _hidescrollbar"
              tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
              tableHeaderRowClassName="!border-none"
              tableCellClassName="group-hover:!bg-[#27272a] !py-2.5 justify-end border-b"
              DraggableRowComponent={DraggableRow}
              isLoading={isLoading}
              onRowClick={handleRowClick}
            />
          </SortableContext>

          <ViewMoreButton onClick={handleViewMore} dataLength={total} />
        </div>
      </DndContext>

      {/* <div>
        <TableVirtual<ISymbolList, any>
          columns={columns}
          data={currentData}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          isStickyHeader={false}
          containerClassName="!border-none _hidescrollbar"
          tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
          tableHeaderRowClassName="!border-none "
          tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-2.5 justify-end"
        />
        <ViewMoreButton onClick={handleViewMore} dataLength={total} />
      </div> */}

      <ToastCenterScreen
        text={isAdd ? '添加成功' : '已取消自选'}
        isSuccess={true}
        isError={false}
        showModal={isOpenToast}
        setShowModal={setIsOpenToast}
      />

      <Confirm
        title={'确定取消ETHUSD自选？'}
        onAccept={handleConfirmAccept}
        onCancel={handleConfirmCancel}
        isOpenConfirm={isOpenConfirm}
        setIsOpenConfirm={setIsOpenConfirm}
      />
    </>
  )
}

export default memo(CryptoTable)
