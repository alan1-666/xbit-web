import { useTranslation } from 'react-i18next'
import BottomSheet from '@/components/common/BottomSheet'
import { useEffect, useState } from 'react'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  setHideModestBalance,
  setIsHiddenSmallPoll,
  setHideZeroBalance,
  setPage,
} from '@/redux/modules/holding.slice.ts'

import { HoldingState } from '@/redux/modules/holding.slice.ts'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const FilterHolding = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    hideModestBalance,
    hideZeroBalance,
    isHiddenSmallPoll: hideSmallLiquidity,
  } = useAppSelector((state: RootState) => state.holding as HoldingState)
  const [filterTemp, setFilterTemp] = useState({
    hideModestBalance,
    hideSmallLiquidity,
    hideZeroBalance,
  })

  useEffect(() => {
    if (open) {
      setFilterTemp({
        hideModestBalance,
        hideSmallLiquidity,
        hideZeroBalance,
      })
    }
  }, [open])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('holding.filter.filter')}>
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className={`relative text-center text-[14px] font-[330] px-3 py-[13px] border-[0.5px] rounded-lg bg-[#2B2B33] text-white hover:border-[#755AB3] cursor-pointer ${
            filterTemp.hideModestBalance ? 'border-[#755AB3] bg-[#584487]' : ''
          }`}
          onClick={() => setFilterTemp({ ...filterTemp, hideModestBalance: !filterTemp.hideModestBalance })}
        >
          {filterTemp.hideModestBalance && (
            <img
              src="/images/icons/border-checked.svg?v=2"
              alt="check"
              className="absolute h-[14px] w-auto top-0 right-0"
            />
          )}
          {t('holding.filter.hideSmallAsset')}
        </div>
        <div
          className={`relative text-center text-[14px] font-[330] px-3 py-[13px] border-[0.5px] rounded-lg bg-[#2B2B33] text-white hover:border-[#755AB3] cursor-pointer ${
            filterTemp.hideSmallLiquidity ? 'border-[#755AB3] bg-[#584487]' : ''
          }`}
          onClick={() => setFilterTemp({ ...filterTemp, hideSmallLiquidity: !filterTemp.hideSmallLiquidity })}
        >
          {filterTemp.hideSmallLiquidity && (
            <img
              src="/images/icons/border-checked.svg?v=2"
              alt="check"
              className="absolute h-[14px] w-auto top-0 right-0"
            />
          )}
          {t('holding.filter.hideSmallLiquidityPool')}
        </div>
        <div
          className={`relative text-center text-[14px] font-[330] px-3 py-[13px] border-[0.5px] rounded-lg bg-[#2B2B33] text-white hover:border-[#755AB3] cursor-pointer ${
            filterTemp.hideZeroBalance ? 'border-[#755AB3] bg-[#584487]' : ''
          }`}
          onClick={() => setFilterTemp({ ...filterTemp, hideZeroBalance: !filterTemp.hideZeroBalance })}
        >
          {filterTemp.hideZeroBalance && (
            <img
              src="/images/icons/border-checked.svg?v=2"
              alt="check"
              className="absolute h-[14px] w-auto top-0 right-0"
            />
          )}
          {t('holding.filter.hideSold')}
        </div>
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
            dispatch(setHideModestBalance(filterTemp.hideModestBalance))
            dispatch(setIsHiddenSmallPoll(filterTemp.hideSmallLiquidity))
            dispatch(setHideZeroBalance(filterTemp.hideZeroBalance))
            setOpen(false)
          }}
        >
          {t('button.apply')}
        </button>
      </div>
    </BottomSheet>
  )
}

export default FilterHolding
