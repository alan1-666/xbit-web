import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import DrawerCheckSelect from '../common/DrawerCheckSelect'
import { currencyOptions } from './type'

interface IPCurrenciesFilter {
  currencyFilter: string
  setCurrencyFilter: Dispatch<SetStateAction<string>>
}

const CurrenciesFilter = ({ setCurrencyFilter, currencyFilter }: IPCurrenciesFilter) => {
  const { t } = useTranslation()

  const handleCurrencyChange = (mode: string) => {
    setCurrencyFilter(mode)
  }

  return (
    <DrawerCheckSelect
      childrenTrigger={
        <div
          className={cn(
            `flex items-center py-1.5 cursor-pointer text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-[#FFFFFF] justify-center`,
          )}
        >
          {currencyOptions.find((item) => item.value === currencyFilter)?.label}
          <img className="ml-1" src="/images/icons/icon-chevron-down.svg" alt="icon arrow down" />
        </div>
      }
      title="全部币种"
      titleClassName="text-lg p-0 m-0"
      isClose
      headerClassName="py-4 px-3"
      options={currencyOptions}
      value={currencyFilter}
      onChange={handleCurrencyChange}
    />
  )
}

export default CurrenciesFilter
