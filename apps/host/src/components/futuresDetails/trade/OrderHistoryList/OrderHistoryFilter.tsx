import { useTranslation } from 'react-i18next'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { OrdersListFilter } from '.'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { useState, useMemo } from 'react'
import { OrderSide, All } from '../types'
import { useTranslation } from 'react-i18next'


interface CurrentOrdersFilterProps {
  filter: OrdersListFilter
  setFilter: (filter: OrdersListFilter) => void
  currentToken?: string
}

const CurrentOrdersFilter = ({ filter, setFilter }: CurrentOrdersFilterProps) => {
  const { t } = useTranslation()



  const directionsOptions: FilterSelectOption[] = [
    {
      label: t('futuresDetails.tabs.allDirection'),
      value: 'All',
    },
      {
        label: t('futuresDetails.common.long'),
      value: 'Open Long',
    },
    {
      label: t('futuresDetails.common.short'),
      value: 'Open Short'
    },
    {
      label: t('futuresDetails.common.closeLong'),
      value: 'Close Long'
    },
    {
      label: t('futuresDetails.common.closeShort'),
      value: 'Close Short'
    },
  ]


  const [direction, setDirection] = useState<string>(directionsOptions[0].value)
  
  const handleDirectionChange = (direction: string) => {
    setDirection(direction)
    if(setFilter) {
      setFilter({
        ...filter,
        side:  direction as OrderSide | All
      })
    }
  }


  const directionText = useMemo(() => {
      return directionsOptions.find((item) => {
        return item.value === direction
      })?.label
  }, [directionsOptions, direction])

  

  return (
    <div className="mb-[8px]">
      <div className="flex items-center justify-between gap-[8px] mb-[12px]">
        <div className="flex gap-[8px]">


        <DrawerCheckSelect 
          childrenTrigger={
             <div className='flex items-center bg-[#1B1B1E] rounded-full px-[10px] py-[5px] min-w-[92px]  h-[26px]  text-[#FFFFFF] text-[13px] leading-[1] app-font-regular'>
             <div className="cursor-pointer text-[#908E98] text-[13px] leading-[1] app-font-regular w-[calc(100%_-_10px)]">
               {directionText}
             </div>
             <img className="ml-1" src="/images/futuresDetail/filter-arrow-down.svg" alt="filter-arrow-down" />
           </div>
          }
          options={directionsOptions}
          value={direction}
          onChange={handleDirectionChange}
        />

        </div>

        <CheckboxWithLabel
          label={t('currentOrdersList.showCurrentCoinOnly')}
          defaultChecked={filter?.showOnlyBaseCoin}
          isChecked={filter.showOnlyBaseCoin}
          onChange={() => {
            setFilter({
              ...filter,
              showOnlyBaseCoin: !filter?.showOnlyBaseCoin
            })
          }}
        />


      </div>


    



    </div>
  )
}



export default CurrentOrdersFilter


