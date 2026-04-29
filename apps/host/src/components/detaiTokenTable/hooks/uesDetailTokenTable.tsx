import { useActiveChain } from '@/hooks/useActiveChain'
import { getDataUnitByChain, getFilterTransactionAmountTypeByDataUnit } from '@/lib/currency'
import { formatPrice, formatVolume } from '@/lib/format'
import { setDisplayPriceType, setSortByCreatedAt, TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice'
import { setDataUnit, UserSettingsState } from '@/redux/modules/userSettings.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { DisplayPriceType, FilterTransactionAmountType, SortByCreateAtType } from '@/types/enums'
import { useCallback, useState } from 'react'

const uesDetailTokenTable = () => {
  const dispatch = useAppDispatch()
  const { sortByCreatedAt, displayPriceType } = useAppSelector(
    (state: RootState) => state.tokenDetail as TokenDetailState,
  )
  const { dataUnit } = useAppSelector((state: RootState) => state.userSettings as UserSettingsState)
  const activeChain = useActiveChain()

  const [currency, setCurrency] = useState<FilterTransactionAmountType>(
    getFilterTransactionAmountTypeByDataUnit(dataUnit),
  )

  const handleSort = useCallback(() => {
    const currentDirection = sortByCreatedAt
    console.log({ currentDirection })
    if (currentDirection === SortByCreateAtType.DESC) {
      dispatch(setSortByCreatedAt(SortByCreateAtType.ASC))
    } else if (currentDirection === SortByCreateAtType.ASC) {
      dispatch(setSortByCreatedAt(undefined))
    } else {
      dispatch(setSortByCreatedAt(SortByCreateAtType.DESC))
    }
  }, [sortByCreatedAt])

  const handleClickSoldPrice = () => {
    dispatch(
      setDisplayPriceType(displayPriceType === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE),
    )
  }

  const handleChangeCurrency = () => {
    // setCurrency((prev) => {
    //   if (prev !== FilterTransactionAmountType.USDT) {
    //     const newDataUnit = getDataUnitByChain(activeChain)
    //     dispatch(setDataUnit(newDataUnit))
    //     return getFilterTransactionAmountTypeByDataUnit(newDataUnit)
    //   }
    //   dispatch(setDataUnit('USD'))
    //   return FilterTransactionAmountType.USDT
    // })
    if (currency === FilterTransactionAmountType.USDT) {
      const newDataUnit = getDataUnitByChain(activeChain)
      dispatch(setDataUnit(newDataUnit))
      setCurrency(getFilterTransactionAmountTypeByDataUnit(newDataUnit))
    } else {
      dispatch(setDataUnit('USD'))
      setCurrency(FilterTransactionAmountType.USDT)
    }
  }

  const handleTextColor = (type: RealtimeTransactionType) => {
    switch (type) {
      case RealtimeTransactionType.Buy:
        return 'text-rise'
      case RealtimeTransactionType.Sell:
        return 'text-fall'
      default:
        return 'text-white'
    }
  }

  const calculateMarketCap = (price: number, totalSupply: number): number => {
    if (price <= 0 || totalSupply <= 0) return 0
    return price * totalSupply
  }

  const formatPriceAndMc = (token: RealtimeTransaction, type: 'usd' | 'marketcap', totalSupply: number) => {
    if (type === 'usd') {
      return formatPrice(token.usdPrice, {
        showCurrency: true,
      })
    } else {
      const marketCap = calculateMarketCap(token.usdPrice, totalSupply ?? 0)
      return formatVolume(marketCap, {
        showCurrency: true,
      })
    }
  }

  return {
    handleClickSoldPrice,
    handleSort,
    currency,
    handleTextColor,
    handleChangeCurrency,
    formatPriceAndMc,
    calculateMarketCap,
  }
}

export default uesDetailTokenTable
