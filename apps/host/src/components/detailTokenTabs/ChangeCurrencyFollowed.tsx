import { FilterTransactionAmountType } from '@/types/enums.ts'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setDataUnit } from '@/redux/modules/userSettings.slice.ts'
import { getDataUnitByChain, getFilterTransactionAmountTypeByDataUnit } from '@/lib/currency'
import { useActiveChain } from '@/hooks/useActiveChain'

type ChangeCurrencyFollowedProps = {
  currency: FilterTransactionAmountType
  setCurrency: Dispatch<SetStateAction<FilterTransactionAmountType>>
}

const ChangeCurrencyFollowed = ({ currency, setCurrency }: ChangeCurrencyFollowedProps) => {
  const dispatch = useAppDispatch()
  const dataUnit = useAppSelector((state: RootState) => state.userSettings.dataUnit)
  const activeChain = useActiveChain()

  const handleOnClickChangeCurrency = () => {
    setCurrency((prev) => {
      if (prev !== FilterTransactionAmountType.USDT) {
        const newDataUnit = getDataUnitByChain(activeChain)
        dispatch(setDataUnit(newDataUnit))
        return getFilterTransactionAmountTypeByDataUnit(newDataUnit)
      }
      dispatch(setDataUnit('USD'))
      return FilterTransactionAmountType.USDT
    })
  }

  useEffect(() => {
    setCurrency(getFilterTransactionAmountTypeByDataUnit(dataUnit))
  }, [dataUnit])

  return (
    <div
      className="flex items-center gap-1.5 p-1 rounded-full bg-[#232329] cursor-pointer select-none"
      onClick={handleOnClickChangeCurrency}
    >
      {currency === FilterTransactionAmountType.SOL ? (
        <img
          alt="icon currency"
          className="w-3.5 h-3.5 border border-[#121218] rounded-full"
          src="/images/cryptoDeposit/solana.svg"
        />
      ) : (
        <span className="p-1"></span>
      )}
      <span className="app-font-regular text-[10px] leading-[1] text-white">
        {currency === FilterTransactionAmountType.SOL ? 'SOL' : 'USD'}
      </span>
      <img className="mr-1 w-4 h-4" src="/images/orderBook/icon-refund.svg" alt="change currency" />
    </div>
  )
}

export default ChangeCurrencyFollowed
