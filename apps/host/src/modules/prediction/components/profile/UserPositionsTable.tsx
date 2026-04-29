import LoadingState from '@/modules/prediction/components/portfolio/PositionsCellRender/LoadingState'
import { DataTable } from '@pages/meme/discover/desktop/components/DataTable'
import { EmptyList } from '@components/discover/EmptyList'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/DataTable'
import { Skeleton } from '@/components/ui/skeleton'
import { PositionCard } from '@/modules/prediction/components/shared/PositionCard'
import { EventDetailsSellButton } from '@/modules/prediction/components/shared/PositionCardSellButton'
import { PositionModel } from '@/modules/prediction/models/PositionModel'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useEventDetailsPageContext } from '../../contexts/EventDetailsPageContext'

type BaseProps = {
  isLoading: boolean
  disableHover?: boolean
  onLoadMore?: () => void
  hasNextPage?: boolean
  classNameEmpty?: string
}

type TableVariantProps<T> = BaseProps & {
  positions: T[]
  variant: 'table'
  columns: ColumnDefWithMeta<T>[]
}

type CardVariantProps = BaseProps & {
  positions: PositionModel[]
  variant?: 'cards'
  columns?: never
}

type UserPositionsTableProps<T = PositionModel> = TableVariantProps<T> | CardVariantProps

const CardSkeleton = () => (
  <div className="flex w-full flex-col gap-4 rounded-lg border border-white/10 bg-[#1A1A1E] p-4 xl:max-w-81.25">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded bg-white/10" />
        <Skeleton className="h-4 w-16 rounded bg-white/10" />
        <Skeleton className="h-5 w-10 rounded-md bg-white/10" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-14 rounded bg-white/10" />
        <Skeleton className="h-3 w-10 rounded bg-white/10" />
      </div>
    </div>
    <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-3 w-8 rounded bg-white/10" />
          <Skeleton className="h-3 w-12 rounded bg-white/10" />
        </div>
      ))}
    </div>
    <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
    <div className="flex items-start justify-between border-t border-white/5 pt-3">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-16 rounded bg-white/10" />
        <Skeleton className="h-3 w-12 rounded bg-white/10" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-3 w-12 rounded bg-white/10" />
        <Skeleton className="h-3 w-10 rounded bg-white/10" />
      </div>
    </div>
  </div>
)

const getGridCols = (_count: number) => {
  // if (count <= 1) return 'grid-cols-1'
  // if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
  // if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}

const CardGrid = ({ positions }: { positions: PositionModel[] }) => {
  const { event } = useEventDetailsPageContext()
  const { t } = useTranslation()

  return (
    <div className={`grid auto-rows-min gap-4 px-2 py-3 ${getGridCols(positions.length)}`}>
      {positions.map((position) => (
        <PositionCard
          key={`${position.marketId}-${position.outcome}`}
          position={position}
          market={event?.markets?.find((market) => market.id === position.marketId)}
          currentTitle={t('prediction.profile.currentSell')}
          renderSellButton={(pos) => (
            <EventDetailsSellButton
              position={pos}
              // className={isSingle ? 'mt-2 mr-3 mb-3 ml-auto h-8 w-32 px-0 text-xs' : undefined}
            />
          )}
        />
      ))}
    </div>
  )
}

export function UserPositionsTable<T = PositionModel>(props: UserPositionsTableProps<T>) {
  const { t } = useTranslation()
  const { positions, isLoading, disableHover, onLoadMore, hasNextPage, classNameEmpty } = props
  const isCardVariant = props.variant !== 'table'

  if (isLoading) {
    if (isCardVariant) {
      return (
        <div className="grid auto-rows-min grid-cols-1 gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )
    }
    return <LoadingState columns={props.columns} />
  }

  if (!positions?.length && isCardVariant) {
    return (
      <div className="flex h-50 w-full items-center justify-center overflow-hidden">
        <EmptyList emptyText={t('prediction.positions.noPositions')} />
      </div>
    )
  }

  if (isCardVariant) {
    return <CardGrid positions={positions as PositionModel[]} />
  }

  const tableProps = props as TableVariantProps<T>
  return (
    <div className="w-full">
      <DataTable<T>
        data={tableProps.positions}
        columns={tableProps.columns}
        isLoading={false}
        className="border-none"
        headerClassName="bg-transparent border-b border-white/10"
        rowClassName={`border-b border-white/5 ${!disableHover ? 'hover:bg-white/5' : 'hover:bg-transparent'}`}
        cellClassName="py-2 px-0"
        headerCellClassName="py-2 px-0"
        onLoadMore={onLoadMore}
        hasNextPage={hasNextPage}
        noDataComponent={
          <div className={cn('flex h-full w-full items-center justify-center', classNameEmpty)}>
            <EmptyList emptyText={t('prediction.positions.noPositions')} />
          </div>
        }
      />
    </div>
  )
}
