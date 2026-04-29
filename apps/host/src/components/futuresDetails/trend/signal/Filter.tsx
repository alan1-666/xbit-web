import { useTranslation } from 'react-i18next'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import {
  OrdersListFilter,
  OrdersListFilterOrderType,
  OrdersListFilterTransactionType,
} from '@components/currentOrdersList/index'
import { OrderType, TransactionType } from '@/@generated/gql/graphql-trading'

interface FilterProps {}

const Filter = ({}: FilterProps) => {
  const { t } = useTranslation()

  const signalTypeOptions: FilterSelectOption[] = [
    {
      value: 'all',
      label: '信号类型',
    },
  ]

  const directionsOptions: FilterSelectOption[] = [
    {
      value: 'all',
      label: '收益率',
    },
  ]

  return (
    <div className="flex items-center justify-between gap-[8px] mb-[8px]">
      <div className="flex gap-[8px]">
        <FilterSelect
          options={signalTypeOptions}
          triggerIcon="/images/tokenDetail/icon-chevron-down.svg"
          triggerIconClassname="w-[9.09px] h-[5.05px]"
          selectTriggerProps={{
            className:
              'w-auto rounded-full px-[10px] py-[5px] border-[none] bg-[#ECECED14] h-[26px] gap-[7.67px] text-[#FFFFFF99] text-[13px] leading-[1] app-font-regular',
          }}
          onValueChange={(value: string) => {}}
        />
        <FilterSelect
          options={directionsOptions}
          triggerIcon="/images/tokenDetail/icon-chevron-down.svg"
          triggerIconClassname="w-[9.09px] h-[5.05px]"
          selectTriggerProps={{
            className:
              'w-auto rounded-full px-[10px] py-[5px] border-[none] bg-[#ECECED14] h-[26px] gap-[7.67px] text-[#FFFFFF99] text-[13px] leading-[1] app-font-regular',
          }}
          defaultValue={directionsOptions[0].value}
          onValueChange={(value: string) => {}}
        />
      </div>
      <div className="flex gap-[8px]">
				<CheckboxWithLabel 
					label={'隐藏k线信号'} 
					defaultChecked={false} 
					onChange={() => {}}
				/>

				<CheckboxWithLabel 
					label={'已订阅'} 
					defaultChecked={true} 
					onChange={() => {}}
				/>
			</div>
    </div>
  )
}

export default Filter
