import { OrderContractState } from '@/components/futuresDetails/trade/type.order'
import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store.ts'
import ButtonReducePosition from './ButtonReducePosition.tsx'
import ButtonSetTpsl from './ButtonSetTpsl.tsx'

const GroupOption = () => {
  const dispatch = useAppDispatch()
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  return (
    <div className='mb-3 xl:mt-[16px]'>
      <ButtonSetTpsl />
    </div>
  )
}

export default GroupOption
