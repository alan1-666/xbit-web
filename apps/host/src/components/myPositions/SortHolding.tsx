import { useTranslation } from 'react-i18next'
import BottomSheet from '@/components/common/BottomSheet'
import { IconSortDown1, IconSortUp1 } from '@components/icon'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setSortBy, setPage } from '@/redux/modules/holding.slice.ts'

import { HoldingState } from '@/redux/modules/holding.slice.ts'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const SORT_OPTIONS = [
  {
    label: 'assets.funding.holding',
    value: 'holdingValue',
  },
  {
    label: 'assets.funding.lastActive',
    value: 'balanceUpdatedTime',
  },
  {
    label: 'detail.holderTable.totalBuy',
    value: 'totalBuyUsd',
  },
  {
    label: 'detail.holderTable.totalSell',
    value: 'totalSellUsd',
  },
]

const SortHolding = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sortBy } = useAppSelector((state: RootState) => state.holding as HoldingState)

  const [tempSortBy, setTempSortBy] = useState(sortBy)

  useEffect(() => {
    if (open) {
      setTempSortBy(sortBy)
    }
  }, [sortBy, open])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('holding.sort.sorting')}>
      <div className="flex flex-col gap-2.5">
        {SORT_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={cn(
              'relative px-3 py-[15px] rounded-[8px] bg-[#2B2B33] border-[0.5px] border-[#ECECED14] flex items-center justify-between hover:border-[#755AB3]',
              tempSortBy.includes(option.value) ? 'border-[#755AB3] bg-[#584487] text-white' : '',
            )}
          >
            <span className="text-[14px] text-white font-[330]">{t(option.label)}</span>
            <div className="flex items-center gap-3 ">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setTempSortBy(`+${option.value}`)
                }}
              >
                <span
                  className={`text-[12px] font-[330] ${tempSortBy === `+${option.value}` ? 'text-[#2FFD95]' : tempSortBy.includes(option.value) ? 'text-white' : 'text-[#908E98]'}`}
                >
                  {t('holding.sort.ascending')}
                </span>
                <IconSortUp1
                  currentColor={
                    tempSortBy === `+${option.value}`
                      ? '#2FFD95'
                      : tempSortBy.includes(option.value)
                        ? '#FFFFFF'
                        : '#908E98'
                  }
                />
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setTempSortBy(`-${option.value}`)
                }}
              >
                <span
                  className={`text-[12px] font-[330] ${tempSortBy === `-${option.value}` ? 'text-[#2FFD95]' : tempSortBy.includes(option.value) ? 'text-white' : 'text-[#908E98]'}`}
                >
                  {t('holding.sort.descending')}
                </span>
                <IconSortDown1
                  currentColor={
                    tempSortBy === `-${option.value}`
                      ? '#2FFD95'
                      : tempSortBy.includes(option.value)
                        ? '#FFFFFF'
                        : '#908E98'
                  }
                />
              </div>
            </div>
            {tempSortBy.includes(option.value) && (
              <img
                src="/images/icons/border-checked.svg?v=2"
                alt="check"
                className="absolute h-[14px] w-auto top-0 right-0"
              />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        <button
          className="px-3 py-[14px] rounded-[100px] bg-[#2B2B33] text-white"
          onClick={() => {
            setOpen(false)
          }}
        >
          {t('button.cancel')}
        </button>
        <button
          className="px-3 py-[14px] rounded-[100px] purple-btn-gradient text-white"
          onClick={() => {
            dispatch(setPage(1))
            dispatch(setSortBy(tempSortBy))
            setOpen(false)
          }}
        >
          {t('button.apply')}
        </button>
      </div>
    </BottomSheet>
  )
}

export default SortHolding
