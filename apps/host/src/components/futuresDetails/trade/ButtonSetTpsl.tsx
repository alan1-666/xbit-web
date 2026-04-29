import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { OrderContractState } from '@/components/futuresDetails/trade/type.order'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { CheckboxXbit } from '@components/ui/checkbox-xbit.tsx'
import TpSlSetting from './TpSlSetting'
import NewTpSlSetting from './NewTpSlSetting' 
import { useTranslation } from 'react-i18next'

const ButtonSetTpsl = () => {
  const { t } = useTranslation()
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { isShowTPSl, reduceOnly } = orderInfo

  const dispatch = useAppDispatch()

  return (
    <>
      <div className="mt-[17px] mb-[10px] flex items-center justify-between">
        <div
          className="flex items-center"
          onClick={() => {
            dispatch(
              setOrderInfo({
                ...orderInfo,
                reduceOnly: false,
                isShowTPSl: !isShowTPSl
              }),
            )
          }}
        >
          <CheckboxXbit checked={isShowTPSl} className="cursor-pointer mr-1"></CheckboxXbit>
          <span className="text-[calc(1rem*(10/16))] xl:text-[12px] leading-[1] text-[#FFFFFFB2]">{t('futuresDetails.common.tpSl')}</span>
        </div>



        <div
          className="flex items-center"
          onClick={() => {
            dispatch(
              setOrderInfo({
                ...orderInfo,
                reduceOnly: !reduceOnly,
              }),
            )
          }}
        >
          <CheckboxXbit
            checked={orderInfo.reduceOnly}
            className="cursor-pointer mr-1"
          >
          </CheckboxXbit>
          <span className='text-[calc(1rem*(10/16))] xl:text-[12px] leading-[1] text-[#FFFFFFB2]'>{t('position.reduceOnly')}</span>
        </div>

      </div>

      {isShowTPSl && <NewTpSlSetting />}
    </>

  )
}

export default ButtonSetTpsl
