import { LoyaltyStatusResp } from '@/@generated/gql/graphql-loyalty'
import { formatLeaderboardName } from '@/hooks/useLoyalty'
import { useResponsive } from '@/hooks/useResponsive'
import { APP_PATH } from '@/lib/constant'
import { formatPercent } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils.ts'
import '@/styles/loyalty.css'
import { isEmail } from '@/utils/helpers'
import { ColumnDefWithMeta, DataTable } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import MoneyFormatted from '../common/MoneyFormatted'
import { useLoyalty } from './context/LoyaltyContext'
import TopRanking from './TopRanking'

const Context = createContext({
  showTop3: false,
  isEnded: false,
})

const columns: ColumnDefWithMeta<LoyaltyStatusResp>[] = [
  {
    id: 'rank',
    header: () => '#',
    size: 24,
    cell: ({ row }) => {
      const { index } = row
      const { showTop3 } = useContext(Context)
      if (!showTop3 && index < 3) {
        return null
      }
      return <div className="text-[calc(14rem/16)] font-[550] text-[#605E6A]">{row.index + (showTop3 ? 4 : 1)}</div>
    },
  },
  {
    id: 'name',
    meta: {
      className: 'flex-1 css-address-col',
    },
    header: () => {
      const { t } = useTranslation()
      return t('loyalty.address')
    },
    cell: (e) => {
      const { name } = e.row.original

      return (
        <div className="flex items-center space-x-2">
          {/* <div className="hidden sm:block text-[#A9A9B5] font-[330] text-[calc(14rem/16)]">
            {isEmail(name) ? name : formatAddressWallet(name)}
          </div> */}
          {/* <div className="block sm:hidden text-[#A9A9B5] font-[330] text-[calc(14rem/16)]"> */}
          <div className="block text-[calc(14rem/16)] font-[330] text-[#A9A9B5]">
            {formatLeaderboardName(name)}
          </div>
        </div>
      )
    },
  },
  {
    id: 'points',
    header: () => {
      const { t } = useTranslation()
      return t('loyalty.pointsThisSeason')
    },
    meta: {
      className: '[&>div]:justify-end flex justify-end max-w-[100px]',
    },
    cell: (e) => {
      const { totalPoint } = e.row.original
      return (
        <div className="text-[calc(14rem/16)] font-[330] text-[#A9A9B5]">
          <MoneyFormatted value={totalPoint} unit="" />
        </div>
      )
    },
  },
  {
    id: 'boosts',
    header: () => {
      const { t } = useTranslation()
      return t('loyalty.pointsBonus')
    },
    meta: {
      className: '[&>div]:justify-end flex justify-end css-boosts-col',
    },
    cell: (e) => {
      const { boost, pointPercent } = e.row.original
      const { isEnded } = useContext(Context)
      return (
        <div className="text-[calc(14rem/16)] font-[400] text-[#A9A9B5]">
          {isEnded ? formatPercent(pointPercent) : `${boost?.toFixed(1)}X`}
        </div>
      )
    },
  },
]

const TopRankingRow = (props: { index: number; children: ReactNode }) => {
  const { index, children } = props
  const { showTop3 } = useContext(Context)
  if (showTop3) return <div>{children}</div>
  return (
    <div
      className={cn(
        index < 3 ? 'top-ranking-row' : '',
        index === 0 ? 'top1' : '',
        index === 1 ? 'top2' : '',
        index === 2 ? 'top3' : '',
      )}
    >
      {children}
      <div className="absolute -top-[1px] -left-[2px] z-[1]">
        {index === 0 ? <img src="/images/loyalty/top1-badge.svg" alt="" /> : null}
        {index === 1 ? <img src="/images/loyalty/top2-badge.svg" alt="" /> : null}
        {index === 2 ? <img src="/images/loyalty/top3-badge.svg" alt="" /> : null}
      </div>
    </div>
  )
}

export interface LeaderboardProps {
  showTop3?: boolean
  onOpenChange?: (open: boolean) => void
  showIcon?: boolean
  showTitle?: boolean
  classNames?: string
  headerTableClassName?: string
  isEnded?: boolean
  showTop10?: boolean
}

export const Leaderboard = (props: LeaderboardProps) => {
  const { t } = useTranslation()
  const {
    showTop3 = false,
    onOpenChange,
    showIcon = true,
    showTitle,
    classNames,
    headerTableClassName,
    isEnded = false,
    showTop10 = true,
  } = props
  const { leaderboard, loadingLeaderboard, selectedSeason } = useLoyalty()
  const { isDesktop } = useResponsive()
  const navigate = useNavigate()

  const limitedLeaderboard = useMemo(() => {
    if (!leaderboard?.leaderboard || leaderboard.leaderboard.length === 0) {
      return []
    }

    if (showTop10) {
      return leaderboard.leaderboard.slice(0, 10)
    }

    return leaderboard.leaderboard
  }, [leaderboard, showTop10])

  const { top3Data, restData } = useMemo(() => {
    if (limitedLeaderboard.length === 0) {
      return { top3Data: [], restData: [] }
    }

    const top3 = limitedLeaderboard.slice(0, 3)
    const rest = limitedLeaderboard.slice(3)

    return { top3Data: top3, restData: rest }
  }, [limitedLeaderboard])

  const tableData = useMemo(() => {
    if (showTop3) {
      return restData
    }
    return limitedLeaderboard
  }, [showTop3, restData, limitedLeaderboard])

  return (
    <Context.Provider value={{ showTop3: showTop3, isEnded }}>
      <div>
        <div className={cn('flex items-center justify-between', isDesktop && 'mb-4', showTop3 && 'mb-0')}>
          <div
            className={cn('flex gap-2', (showTop3 || showTitle) && 'w-10')}
            style={{
              visibility: showTop3 || showTitle ? 'hidden' : 'visible',
            }}
          >
            <div className="text-[calc(18rem/16)] font-[380] text-[#FBFBFB]">{t('loyalty.leaderboard')}</div>
            <div className="mt-[3px] h-fit rounded-[4px] bg-[#3E2761] px-2 py-[2px] text-[calc(11rem/16)] text-[#C8A7FD]">
              {selectedSeason?.name}
            </div>
          </div>
          {showIcon && (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (isDesktop) {
                  onOpenChange?.(true)
                } else {
                  navigate(APP_PATH.LOYALTY_RANKINGS)
                }
              }}
            >
              <img src="/images/icons/arrow-left.svg" alt="arrow-right" className="size-5 rotate-180" />
            </div>
          )}
        </div>

        {showTop3 && (
          <div className="grid grid-cols-3 gap-4">
            <TopRanking top="top1" data={top3Data[0]} isEnded={isEnded} />
            <TopRanking top="top2" data={top3Data[1]} isEnded={isEnded} />
            <TopRanking top="top3" data={top3Data[2]} isEnded={isEnded} />
          </div>
        )}

        <DataTable
          data={tableData}
          headerClassName={cn('sticky top-0 bg-[#0a0a0a] z-10 mb-1', headerTableClassName)}
          isLoading={loadingLeaderboard}
          columns={columns}
          className={cn('_hidescrollbar max-h-[378px] overflow-y-auto', classNames)}
          headerCellClassName="[&>div]:text-[#6C6A76] [&>div]:font-[305] [&>div]:text-[calc(12rem/16)]"
          headerRowClassName="border-none"
          tableBodyClassName="mt-[1px]"
          rowHeight={44}
          rowClassName={cn('h-11 border-none rounded-[8px] hover:text-[#C8A7FD]')}
          striped
          rowWrapper={TopRankingRow}
          rowWrapperPropsFn={(_, index) => {
            return {
              index: index,
            }
          }}
        />
      </div>
    </Context.Provider>
  )
}
