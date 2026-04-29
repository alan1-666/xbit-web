import { Trans, useTranslation } from 'react-i18next'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { FilterSelectOption } from '@/components/common/FilterSelect'
import { useFormContext } from 'react-hook-form'
import { OrderFormType } from '../../useOrderForm'
import { OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import { SwitchWalletFormTrade } from './wallet/SwitchWalletFormTrade'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import LimitPriceExplainedFormPC from '@/components/orderForm/LimitPriceExplainedFormPC'

export type DetailOrderType = 'oneClick' | 'marketPrice' | 'limitPrice' | 'trailingTpSl'

const TabOrderType = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext<OrderFormType>()
  const orderType = watch('orderType')
  const transactionType = watch('transactionType')
  const activeWallet = useSelector(_activeWallet)

  const orderBuyOptions: FilterSelectOption[] = [
    // {
    //   value: 'oneClick' as DetailOrderType,
    //   label: t('orderForm.tabs.quickTrade'),
    // },
    {
      value: 'marketPrice' as DetailOrderType,
      label: t('orderForm.tabs.marketTrade'),
    },
    {
      value: 'limitPrice' as DetailOrderType,
      label: t('orderForm.tabs.limitOrder'),
    },
  ]
  const orderSellOptions: FilterSelectOption[] = [
    // {
    //   value: 'oneClick' as DetailOrderType,
    //   label: t('orderForm.tabs.quickTrade'),
    // },
    {
      value: 'marketPrice' as DetailOrderType,
      label: t('orderForm.tabs.marketTrade'),
    },
    {
      value: 'limitPrice' as DetailOrderType,
      label: t('orderForm.tabs.limitOrder'),
    },
    // {
    //   value: 'trailingTpSl' as DetailOrderType,
    //   label: t('orderForm.tabs.trailingStopLoss'),
    // },
  ]

  useEffect(() => {
    if (orderType) {
      if (orderType === 'oneClick' || orderType === 'marketPrice') {
        setValue('type', OrderType.Market)
      }
      if (orderType === 'limitPrice') {
        setValue('type', OrderType.Limit)
      }
      if (orderType === 'trailingTpSl') {
        setValue('type', OrderType.TrailingTpsl)
      }
    }
  }, [orderType])

  return (
    <div className="relative z-[2] flex pt-5 items-center justify-between border-b-[1px] border-b-[#ECECED14] pb-1.5">
      <div className="flex items-center">
        <MovingLineTabs
          containerClassName="justify-start bg-transparent after:hidden "
          tabsListClassName="p-0 gap-2 h-[19px] md:gap-3"
          itemClassName="px-1 pt-0 pb-1.5 text-[calc(1rem*(13/16))] leading-[1] font-medium "
          tabs={transactionType === TransactionType.Buy ? orderBuyOptions : orderSellOptions}
          defaultTab={orderType}
          onTabChange={(tab: string) => {
            //   dispatch(setCurrentTradingTransactionType(tab))
            setValue('orderType', tab)
          }}
        />
        <LimitPriceExplainedFormPC />
      </div>
      {activeWallet?.isConnected && <SwitchWalletFormTrade tokenDetail={tokenDetail} />}
    </div>
  )
}

export default TabOrderType
