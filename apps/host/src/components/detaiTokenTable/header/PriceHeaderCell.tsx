import { DisplayPriceType } from '@/types/enums.ts'
import { setDisplayPriceType, TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useTranslation } from 'react-i18next'

export const PriceHeaderCell = () => {
  const dispatch = useAppDispatch()
  const displayPriceType = useAppSelector((state) => (state.tokenDetail as TokenDetailState).displayPriceType)
  const { t } = useTranslation()
  const handleClickSoldPrice = () => {
    dispatch(
      setDisplayPriceType(displayPriceType === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE),
    )
  }
  return (
    <div className="min-w-[80px]">
      <div
        onClick={handleClickSoldPrice}
        className="flex items-center gap-[2px] w-fit px-2 py-[4.5px] cursor-pointer rounded-[3px]"
      >
        <div className="cursor-pointer">
          {displayPriceType === DisplayPriceType.PRICE
            ? t('detail.tokenDetail.finalPrice')
            : t('detail.tokenDetail.marketCap')}
        </div>
        <img src="/images/futuresDetail/arrow-swap-icon.svg" className="block w-[9px] h-[9px]" alt="icon swap" />
      </div>
    </div>
  )
}
