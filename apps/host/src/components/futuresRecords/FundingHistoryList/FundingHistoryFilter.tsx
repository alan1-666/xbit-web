import { useTranslation } from 'react-i18next'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { OrdersListFilter } from '.'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { useState, useMemo } from 'react'
import { OrderSide, All } from '@/components/futuresDetails/trade/types.ts'
import { ISymbolList } from '@/redux/modules/symbolList.slide'


interface FundingHistoryFilterProps {
  filter: OrdersListFilter
  setFilter: (filter: OrdersListFilter) => void
  symbolList: ISymbolList[]
}

const FundingHistoryFilter = ({ filter, setFilter, symbolList }: FundingHistoryFilterProps) => {
  const { t } = useTranslation()

  const directionsOptions: FilterSelectOption[] = useMemo(() => [
    {
      label: t('futuresDetails.tabs.allDirection'),
      value: 'All',
    },
    {
      label: t('futuresDetails.common.long'),
      value: 'Long',
    },
    {
      label: t('futuresDetails.common.short'),
      value: 'Short',
    },
  ], [t])
  const allText = t('constant.all')

  const coinList = useMemo(() => {
    return [{
      label: allText as string,
      value: 'All',
    }].concat(symbolList?.map((item: ISymbolList) => {
      return {
        label: `${item.symbol}USDC ${t('futuresDetails.common.perp')}`,
        value: item.symbol,
      }
    }))
  }, [symbolList, t])

  const [direction, setDirection] = useState<string>(directionsOptions[0].value)
  
  const handleDirectionChange = (direction: string) => {
    setDirection(direction)
    if(setFilter) {
      setFilter({
        ...filter,
        side:  direction as OrderSide
      })
    }
  }


  const directionText = useMemo(() => {
      return directionsOptions.find((item) => {
        return item.value === direction
      })?.label
  }, [directionsOptions, direction])

  const coinText = useMemo(() => {
    return filter.coin === 'All' ? t('futuresDetails.common.allCoins') : filter.coin + 'USDC'
  }, [filter.coin, t])


  const handleCoinChange = (coin: string) => {
    if(setFilter) {
      setFilter({
        ...filter,
        coin: coin
      })
    }
  }

  return (
    <div className="mb-[8px]">
      <div className="flex items-center justify-between gap-[8px] mb-[12px]">
        <div className="flex gap-[8px]">


        <DrawerCheckSelect 
          childrenTrigger={
            <div className='flex items-center px-[10px] py-[5px] min-w-[92px]  h-[26px]  text-[#FFFFFF] text-[13px] leading-[1] app-font-regular'>
             <div className="cursor-pointer text-[#FFFFFF] text-[13px] leading-[1] app-font-regular w-[calc(100%_-_10px)]">
               {directionText}
             </div>
             <img className="ml-1" src="/images/futuresDetail/order-arrow-down2.svg" />
           </div>
          }
          options={directionsOptions}
          value={direction}
          onChange={handleDirectionChange}
        />

        <DrawerCheckSelect 
          title={t('futuresDetails.common.allCoins')}
          optionsListClassName={`max-h-[350px] h-[350px]`}
          search={true}
          childrenTrigger={
             <div className='flex items-center px-[10px] py-[5px] min-w-[92px]  h-[26px]  text-[#FFFFFF] text-[13px] leading-[1] app-font-regular'>
             <div className="cursor-pointer text-[#FFFFFF] text-[13px] leading-[1] app-font-regular w-[calc(100%_-_10px)]">
               {coinText}
             </div>
             <img className="ml-1" src="/images/futuresDetail/order-arrow-down2.svg" />
           </div>
          }
          options={coinList}
          value={filter.coin}
          onChange={handleCoinChange}
          searchPlaceholder={t('tokenSearchDrawer.search')}
        />

        </div>

   


      </div>


    



    </div>
  )
}



export default FundingHistoryFilter


