import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@components/ui/dropdown-menu.tsx'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setFollowedPoolFilter, setPoolFilter, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { useEffect, useMemo, useState } from 'react'
import { PlatformType, PoolTransactionType, SortByCreateAtType } from '@/types/enums.ts'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'
import { TransactionClassification } from '@/@generated/gql/graphql-future.ts'
import { FilterState } from '@components/detailPoolTab'
import { Dex } from '@/@generated/gql/graphql-meme2.ts'

type FilterTypeProps = {
  isFollowing?: boolean
}

const DEFAULT_STATE = {
  transactionType: PoolTransactionType.All,
  platform: PlatformType.All,
  holder: undefined,
  sortBy: SortByCreateAtType.DESC,
  timestampFrom: undefined,
  timestampTo: undefined,
  minQuantity: undefined,
  maxQuantity: undefined,
  minTotalValue: undefined,
  maxTotalValue: undefined,
  classification: TransactionClassification.All,
}

const listDex = Object.values(Dex).filter((v) => v !== Dex.All)

const FilterDexPoolPc = ({ isFollowing = false }: FilterTypeProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { poolFilter, followedPoolFilter } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  const currentFilter = useMemo(
    () => (isFollowing ? followedPoolFilter?.dex : poolFilter?.dex),
    [isFollowing, followedPoolFilter?.dex, poolFilter?.dex],
  )

  const [open, setOpen] = useState<boolean>(false)
  const [selectedFilter, setSelectedFilter] = useState<Dex>(currentFilter ?? Dex.All)
  const [confirmedFilter, setConfirmedFilter] = useState<Dex | undefined>(currentFilter)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Keep local state in sync if external filter changes (e.g. from elsewhere)
  useEffect(() => {
    setSelectedFilter(currentFilter ?? Dex.All)
    setConfirmedFilter(currentFilter)
  }, [currentFilter])

  const handleClickItem = (item: Dex) => {
    setSelectedFilter(item)
  }

  const createNewState = (item: Dex, state: FilterState | undefined): FilterState => {
    return state ? { ...state, dex: item } : { ...DEFAULT_STATE, dex: item }
  }

  const handleConfirmClick = (item: Dex) => {
    setConfirmedFilter(item)
    const newState = isFollowing ? createNewState(item, followedPoolFilter) : createNewState(item, poolFilter)
    dispatch(isFollowing ? setFollowedPoolFilter(newState) : setPoolFilter(newState))
    setOpen(false)
  }

  // Filter logic for the list
  const filteredDexes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return listDex
    return listDex.filter((item) => String(item).toLowerCase().includes(q))
  }, [searchTerm])

  const showAllRow = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    // allow searching "all" to reveal the All row
    return 'all'.includes(q)
  }, [searchTerm])

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setSearchTerm('') // reset search when closing
      }}
    >
      <DropdownMenuTrigger>
        <Button size="xs" className="rounded-full bg-transparent p-0">
          <img
            src={
              confirmedFilter && confirmedFilter !== Dex.All
                ? '/images/icons/icon-filter-solid.svg'
                : '/images/icons/icon-filter.svg'
            }
            alt="icon filter"
            className="w-3.5 h-3.5"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="p-1 rounded-[4px] min-w-[220px]">
          {/* Search bar */}
          <div className="flex items-center gap-2 py-2">
            <div className="relative w-full">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // If only one result, pick it; otherwise keep current selection
                    if (filteredDexes.length === 1) {
                      setSelectedFilter(filteredDexes[0])
                    }
                    handleConfirmClick(selectedFilter)
                  }
                }}
                className="w-full bg-transparent border border-[#2a2a2e] rounded-md outline-none px-8 py-2 text-sm"
                placeholder={t('detail.pool.searchDex') || 'Search'}
              />
              <img
                src="/images/icons/search-icon-2.svg"
                alt="search"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none"
              />
              {searchTerm && (
                <button
                  aria-label="Clear"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 hover:opacity-100"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <ul className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
            {showAllRow && (
              <li
                key="__all__"
                className="flex items-center justify-between gap-2 px-2 py-3 cursor-pointer hover:bg-[#18181B] min-w-[172px]"
                onClick={() => handleClickItem(Dex.All)}
              >
                <span className="text-[14px] leading-[1] font-light">{t('detail.tabs.all')}</span>
                {selectedFilter === Dex.All && (
                  <img src="/images/icons/icon-tick-rounded.svg?v=2" className="size-3.5" alt="ic tick" />
                )}
              </li>
            )}

            {filteredDexes.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between gap-2 px-2 py-3 cursor-pointer hover:bg-[#18181B] min-w-[172px]"
                onClick={() => handleClickItem(item)}
              >
                <span className="text-[14px] leading-[1] font-light">{item}</span>
                {selectedFilter === item && (
                  <img src="/images/icons/icon-tick-rounded.svg?v=2" className="size-3.5" alt="ic tick" />
                )}
              </li>
            ))}

            {filteredDexes.length === 0 && !showAllRow && (
              <li className="px-2 py-3 text-xs opacity-70">{t('detail.pool.dexNotFound') || 'No results'}</li>
            )}
          </ul>

          <div className="flex justify-end items-center flex-row gap-2.5 pt-4">
            <Button
              size="lg"
              variant="gradient"
              disabled={filteredDexes.length === 0 && !showAllRow}
              className="text-[14px] leading-[1] font-normal text-[#261236] rounded-[50px] h-8"
              onClick={() => handleConfirmClick(selectedFilter)}
            >
              {t('chart.buttons.confirm')}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FilterDexPoolPc
