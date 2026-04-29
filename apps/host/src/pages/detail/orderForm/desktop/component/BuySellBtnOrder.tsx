import { TransactionType } from '@/@generated/gql/graphql-trading'
import { usePreference } from '@/hooks/usePreference'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { OrderFormType } from '../../useOrderForm'

const BuySellBtnOrder = () => {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext<OrderFormType>()
  const transactionType = watch('transactionType')
  const { preference } = usePreference()
  const priceChangeColor = preference?.priceChangeColor || 'normal'
  const bgbuy = priceChangeColor === 'normal' ? 'bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]' : 'red-gradient'
  const bgsell = priceChangeColor === 'normal' ? 'red-gradient' : 'bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]'

  return (
    <div className="flex w-full mb-3 text-center bg-transparent relative h-7.5 md:h-10">
      <div
        className={clsx(
          'w-[50%] bg-[#ececed1f] flex items-center justify-center rounded-l-full py-2 font-medium text-sm md:text-base leading-none cursor-pointer',
          {
            '!bg-[#009c46]': transactionType === TransactionType.Buy,
          },
        )}
        onClick={() => {
          setValue('transactionType', TransactionType.Buy)
        }}
        style={{ clipPath: 'polygon(0px 0px, 100% 0px, 97% 100%, 0px 100%)' }}
      >
        {t('orderForm.tabs.buy')}
      </div>
      <div
        className={clsx(
          'flex-1 bg-[#ececed1f] flex items-center justify-center rounded-r-full py-2 font-medium text-sm md:text-base text-[14px] leading-none cursor-pointer',
          {
            '!bg-[#eb4453]': transactionType === TransactionType.Sell,
          },
        )}
        onClick={() => {
          setValue('transactionType', TransactionType.Sell)
        }}
        style={{ clipPath: 'polygon(3% 0px, 100% 0px, 100% 100%, 0% 100%)' }}
      >
        {t('orderForm.tabs.sell')}
      </div>
    </div>
  )
}

export default BuySellBtnOrder
