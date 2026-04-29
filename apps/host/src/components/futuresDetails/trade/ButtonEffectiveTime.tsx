import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { effectiveList } from './Constans'
import { RootState, useAppSelector } from '@/redux/store'
import { OrderContractState } from './type.order'
import useHandleChangeValue from '../hooks/useHandleChangeValue'

const ButtonEffectiveTime = () => {
  const {
    orderInfo: { tif: effective },
  } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const { handleOrderInfoChange } = useHandleChangeValue()

  return (
    <div className="flex items-center text-[calc(10rem/16)] leading-[calc(10rem/16)]">
      <span className="text-[#FFFFFFB2] mr-1 underline leading-[calc(12rem/16)]">生效时间</span>
      <DrawerCheckSelect
        childrenTrigger={
          <div className="text-[#FFFFFF]">
            <div className="flex items-center">
              <span>{effective}</span>
              <img className="ml-1" src="/images/futuresDetail/arrow-down.svg" alt="icon arrow down" />
            </div>
          </div>
        }
        options={effectiveList}
        value={effective}
        onChange={(e) => handleOrderInfoChange('tif', e)}
      />
    </div>
  )
}
export default ButtonEffectiveTime
