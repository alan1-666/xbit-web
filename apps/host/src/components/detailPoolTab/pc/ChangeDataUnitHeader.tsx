import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setDataUnit, UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'
import { getDataUnitByChain } from '@/lib/currency'
import { useActiveChain } from '@/hooks/useActiveChain'

const ChangeDataUnitHeader = () => {
  const dispatch = useAppDispatch()
  const { dataUnit } = useAppSelector((state: RootState) => state.userSettings as unknown as UserSettingsState)
  const nativeToken = useNativeTokenNameByChain()
  const activeChain = useActiveChain()

  const handleOnClickChangeCurrency = () => {
    if (dataUnit === 'USD') {
      dispatch(setDataUnit(getDataUnitByChain(activeChain)))
    } else {
      dispatch(setDataUnit('USD'))
    }
  }

  return (
    <div
      className="flex items-center gap-1 py-1 px-0.5 rounded-[4px] hover:bg-[#232329] cursor-pointer select-none"
      onClick={handleOnClickChangeCurrency}
    >
      <span className="block font-light text-[12px] leading-[1] w-[26px] text-[#FFFFFF80] text-center">
        {dataUnit === 'USD' ? 'USD' : nativeToken}
      </span>
      <img className="block min-w-4 h-4" src="/images/orderBook/icon-refund.svg" alt="change currency" />
    </div>
  )
}

export default ChangeDataUnitHeader
