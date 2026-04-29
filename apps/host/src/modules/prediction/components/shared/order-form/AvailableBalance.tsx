import { formatBalance } from '@/lib/format.ts'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from './OrderFormData.ts'
import { useTranslation } from 'react-i18next'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { useContext } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'

const UsdcBalance = () => {
  const { data, isPending } = useMyUSDCBalance()
  const userAddress = useProxyWallet()

  if (!userAddress) return <span>$0</span>

  return <span>{isPending ? <Loader /> : formatBalance(data, { showCurrency: true })}</span>
}

const ConditionalTokenBalance = () => {
  const { t } = useTranslation()
  const { rawBalance: data, isBalancePending: isPending } = useContext(OrderFormContext)
  const userAddress = useProxyWallet()

  if (!userAddress) return <span>0 {t('prediction.orderForm.shares')}</span>

  return (
    <span>
      {isPending ? <Loader /> : formatBalance(data, { showCurrency: false })}
      {` ${t('prediction.orderForm.shares')}`}
    </span>
  )
}

export const AvailableBalance = () => {
  const { t } = useTranslation()
  const { control } = useFormContext<OrderFormData>()
  const side = useWatch({ control, name: 'side' })

  return (
    <div className="text-[#908E98] text-xs font-normal leading-[1.3]">
      <span className="lowercase">{t('exchange.balance')} </span>
      {side === 'buy' ? <UsdcBalance /> : <ConditionalTokenBalance />}
    </div>
  )
}
