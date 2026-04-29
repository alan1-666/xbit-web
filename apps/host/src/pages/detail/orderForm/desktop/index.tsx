import BuySellBtnOrder from './component/BuySellBtnOrder'
import InputAmount from './component/InputAmount'
import TradeSetting from './component/TradeSetting'
import TabOrderType from './component/TabOrderType'
import ButtonSubmitOrder from './component/ButtonSubmitOrder'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { OrderFormProvider } from '../OrderFormProvider'
import InputExchange from './component/InputExchange'
import { useFormContext } from 'react-hook-form'
import { OrderFormType } from '../useOrderForm'
import SelectQuickAmount from './component/SelectQuickAmount'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { useEffect } from 'react'

const OrderFormPC = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const activeWallet = useSelector(_activeWallet)

  return (
    <OrderFormProvider
      defaultValues={{
        userAddress: activeWallet?.walletAddress,
      }}
    >
      <InnerForm tokenDetail={tokenDetail} />
    </OrderFormProvider>
  )
}

const InnerForm = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { watch, reset } = useFormContext<OrderFormType>()
  const orderType = watch('orderType')

  useEffect(() => {
    if (tokenDetail?.address) {
      reset()
    }
  }, [tokenDetail?.address])

  return (
    <>
      <BuySellBtnOrder />
      <TabOrderType tokenDetail={tokenDetail} />
      <InputAmount tokenDetail={tokenDetail} />
      <SelectQuickAmount />
      {orderType === 'limitPrice' && <InputExchange tokenDetail={tokenDetail} />}
      <TradeSetting />
      <ButtonSubmitOrder tokenDetail={tokenDetail} />
    </>
  )
}

export default OrderFormPC
