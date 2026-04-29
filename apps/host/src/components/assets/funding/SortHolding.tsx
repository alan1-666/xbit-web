import { useTranslation } from 'react-i18next'
import BottomSheet from '@/components/common/BottomSheet'
import { IconSortDown1, IconSortUp1 } from '@components/icon'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  hideModestBalance: boolean
  setHideModestBalance: (hide: boolean) => void
  hideSmallLiquidity: boolean
  setHideSmallLiquidity: (hide: boolean) => void
  hideZeroBalance: boolean
  setHideZeroBalance: (hide: boolean) => void
  sortBy: string
  setSortBy: (sortBy: string) => void
}

export const SORT_OPTIONS = [
  {
    label: 'assets.funding.holding',
    value: 'holdingValue',
  },
  {
    label: 'assets.funding.lastActive',
    value: 'lastTxTime',
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

const SortHolding = ({
  open,
  setOpen,
  hideModestBalance,
  hideSmallLiquidity,
  hideZeroBalance,
  setHideModestBalance,
  setHideSmallLiquidity,
  setHideZeroBalance,
  sortBy,
  setSortBy,
}: Props) => {
  const { t } = useTranslation()
  const [filterTemp, setFilterTemp] = useState({
    hideModestBalance,
    hideSmallLiquidity,
    hideZeroBalance,
  })

  const [tempSortBy, setTempSortBy] = useState(sortBy)

  useEffect(() => {
    if (open) {
      setFilterTemp({
        hideModestBalance,
        hideSmallLiquidity,
        hideZeroBalance,
      })
      setTempSortBy(sortBy)
    }
  }, [sortBy, open])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('holding.filter.filter')}>
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className={`relative text-center text-[14px] font-[330] px-3 py-[13px] border-[0.5px] rounded-lg bg-[#2B2B33] text-white hover:border-[#843BEA] cursor-pointer ${
            filterTemp.hideModestBalance ? 'border-[#843BEA] bg-[#584487]' : ''
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
          className={`relative text-center text-[14px] font-[330] px-3 py-[13px] border-[0.5px] rounded-lg bg-[#2B2B33] text-white hover:border-[#843BEA] cursor-pointer ${
            filterTemp.hideSmallLiquidity ? 'border-[#843BEA] bg-[#584487]' : ''
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
          className={`relative text-center text-[14px] font-[330] px-3 py-[13px] border-[0.5px] rounded-lg bg-[#2B2B33] text-white hover:border-[#843BEA] cursor-pointer ${
            filterTemp.hideZeroBalance ? 'border-[#843BEA] bg-[#584487]' : ''
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
      <div className="mt-5 mb-3 text-[18px] font-[500] text-white">{t('holding.sort.sorting')}</div>
      <div className="flex flex-col gap-2.5">
        {SORT_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={
              cn(
                'px-3 py-[15px] rounded-[8px] bg-[#2B2B33] border-[0.5px] border-[#ECECED14] flex items-center justify-between hover:border-[#843BEA]',
                tempSortBy.includes(option.value) ? 'border-[#843BEA] bg-[#843BEA]' : '',
              )
            }
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
                  className={`text-[12px] font-[330] ${tempSortBy === `+${option.value}` ? 'text-white' : 'text-white/50'}`}
                >
                  {t('holding.sort.ascending')}
                </span>
                <IconSortUp1 currentColor={tempSortBy === `+${option.value}` ? '#FFFFFF' : '#FFFFFF80'} />
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setTempSortBy(`-${option.value}`)
                }}
              >
                <span
                  className={`text-[12px] font-[330] ${tempSortBy === `-${option.value}` ? 'text-white' : 'text-white/50'}`}
                >
                  {t('holding.sort.descending')}
                </span>
                <IconSortDown1 currentColor={tempSortBy === `-${option.value}` ? '#FFFFFF' : '#FFFFFF80'} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        <button
          className="px-3 py-[14px] rounded-[100px] border-[#EE69FF] bg-[#ECECED1F] text-white"
          onClick={() => {
            setHideModestBalance(hideModestBalance)
            setHideSmallLiquidity(hideSmallLiquidity)
            setHideZeroBalance(hideZeroBalance)
            setSortBy(sortBy)
            setOpen(false)
          }}
        >
          {t('button.cancel')}
        </button>
        <button
          className="px-3 py-[14px] rounded-[100px] purple-btn-gradient text-white"
          onClick={() => {
            setHideModestBalance(filterTemp.hideModestBalance)
            setHideSmallLiquidity(filterTemp.hideSmallLiquidity)
            setHideZeroBalance(filterTemp.hideZeroBalance)
            setSortBy(tempSortBy)
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
