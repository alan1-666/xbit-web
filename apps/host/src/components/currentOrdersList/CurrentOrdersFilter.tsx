import { useTranslation } from 'react-i18next'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { OrdersListFilter, OrdersListFilterOrderType, OrdersListFilterTransactionType } from '.'
import { OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'

interface CurrentOrdersFilterProps {
  filter: OrdersListFilter
  setFilter: (filter: OrdersListFilter) => void
  currentToken?: string
}

const CurrentOrdersFilter = ({ filter, setFilter, currentToken }: CurrentOrdersFilterProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const entrustmentOptions: FilterSelectOption[] = [
    {
      value: 'all',
      label: t('currentOrdersList.allOrders'),
    },
    // {
    //   value: 'oneClick',
    //   label: '一键买卖',
    // },
    // {
    //   value: OrderType.Market,
    //   label: t('currentOrdersList.marketTrade'),
    // },
    {
      value: OrderType.Limit,
      label: t('currentOrdersList.limitOrder'),
    },
    {
      value: OrderType.TrailingTpsl,
      label: t('currentOrdersList.trailingStopLoss'),
    },
  ]

  const directionsOptions: FilterSelectOption[] = [
    {
      value: 'all',
      label: t('currentOrdersList.allDirections'),
    },
    {
      value: TransactionType.Buy,
      label: t('currentOrdersList.buy'),
    },
    {
      value: TransactionType.Sell,
      label: t('currentOrdersList.sell'),
    },
  ]

  return (
    <div className="flex items-center justify-between gap-2 mb-2 lg:mb-4">
      <div className="flex gap-[8px]">
        <FilterSelect
          options={entrustmentOptions}
          selectTriggerProps={{
            className:
              'rounded-full px-2 py-1.5 min-w-fit border-none bg-[#18181D] gap-1 font-[#908E98] text-[#908E98] text-[12px]',
          }}
          onValueChange={(value: string) => {
            setFilter({
              ...filter,
              orderType: value === 'all' ? undefined : (value as OrdersListFilterOrderType),
            })
          }}
          defaultValue={filter.orderType}
        />
        <FilterSelect
          options={directionsOptions}
          selectTriggerProps={{
            className:
              'rounded-full px-2 py-1.5 min-w-fit border-none bg-[#18181D] gap-1 font-[#908E98] text-[#908E98] text-[12px]',
          }}
          defaultValue={filter.transactionType}
          onValueChange={(value: string) => {
            setFilter({
              ...filter,
              transactionType: value === 'all' ? undefined : (value as OrdersListFilterTransactionType),
            })
          }}
        />
      </div>
      <CheckboxWithLabel
        label={t('currentOrdersList.showCurrentCoinOnly')}
        labelWrapperClassName="text-[#908E98] font-[330] text-[11px] leading-none"
        containerClassName="ml-2"
        defaultChecked={filter?.baseAddress === currentToken}
        onChange={() => {
          setFilter({
            ...filter,
            baseAddress: filter?.baseAddress === currentToken ? undefined : currentToken,
          })
        }}
      />
    </div>
  )
}

export default CurrentOrdersFilter
