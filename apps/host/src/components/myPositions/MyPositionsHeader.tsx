import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { useTranslation } from 'react-i18next'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  HoldingState,
  setIsHiddenSmallerThan1U,
  setIsHiddenSmallPoll,
  setIsShowOnlyCurrentCurrency, setPage,
} from '@/redux/modules/holding.slice.ts'

const MyPositionsHeader = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    isHiddenSmallPoll,
    isHiddenSmallerThan1U,
    isShowOnlyCurrentCurrency
  } = useAppSelector((state: RootState)=> state.holding as HoldingState)

  const handleOnChangeHiddenSmallPoll = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setIsHiddenSmallPoll(!!status))
  }
  const handleOnChangeHiddenSmallThan1U = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setIsHiddenSmallerThan1U(!!status))
  }
  const handleOnChangeShowOnlyCurrentCurrency = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setIsShowOnlyCurrentCurrency(!!status))
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CheckboxWithLabel
          label={t("detail.myPositions.hiddenSmallPoll")}
          defaultChecked={isHiddenSmallPoll}
          onChange={handleOnChangeHiddenSmallPoll}
        />
        <CheckboxWithLabel
          label={t("detail.myPositions.hiddenSmallThan1U")}
          defaultChecked={isHiddenSmallerThan1U}
          onChange={handleOnChangeHiddenSmallThan1U}
        />
      </div>
      <CheckboxWithLabel
        label={t("detail.myPositions.showOnlyCurrentCurrency")}
        defaultChecked={isShowOnlyCurrentCurrency}
        onChange={handleOnChangeShowOnlyCurrentCurrency}
      />
    </div>
  )
};

export default MyPositionsHeader;