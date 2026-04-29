import { useTranslation } from 'react-i18next'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { OrdersListFilter } from '.'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from '@/components/ui/dialog'
import { FilterTypeOption, FilterSideOption, OrderType, OrderSide, All, xOpenOrders } from '../types'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'

interface CurrentOrdersFilterProps {
  filter: OrdersListFilter
  setFilter: (filter: OrdersListFilter) => void,
  onClickCancelAll: () => void
  filterOrders: xOpenOrders[]
}


const CurrentOrdersFilter = ({ filter, setFilter, onClickCancelAll,filterOrders }: CurrentOrdersFilterProps) => {
  const { t } = useTranslation()

  const entrustmentOptions: FilterTypeOption[] = [
    {
      label: t('futuresDetails.tabs.allOrders'),
      value: 'All'
    },
    {
      label: t('futuresDetails.tabs.marketOrder'),
      value: 'Market'
    },

    {
      label: t('futuresDetails.tabs.limitOrder'),
      value: 'Limit'
    },
   /*  {
      label: '止盈止损',
      value: '止盈止损'
    },
    {
      label: '分段委托',
      value: '分段委托'
    },
    {
      label: '分时委托',
      value: '分时委托'
    }, */
  ]

  const directionsOptions: FilterSideOption[] = [
    {
      label: t('futuresDetails.tabs.allDirection'),
      value: 'All',
    },
    {
      label: t('futuresDetails.common.long'),
      value: 'B',
    },
    {
      label: t('futuresDetails.common.short'),
      value: 'A',
    },
  ]


  const [entrustment, setEntrustment] = useState<string>(entrustmentOptions[0].value)
  const [direction, setDirection] = useState<string>(directionsOptions[0].value)

  
  const handleEntrustmentChange = (entrustment: string) => {
    setEntrustment(entrustment)
    if (setFilter) {
      setFilter({
        ...filter,
        type: entrustment as OrderType | All
      })
    }
  }

  const handleDirectionChange = (direction: string) => {
    setDirection(direction)
    if (setFilter) {
      setFilter({
        ...filter,
        side: direction as OrderSide | All
      })
    }
  }

  const entrustmentText = useMemo(() => {
    return entrustmentOptions.find(item => {
      return item.value === entrustment
    })?.label
  }, [entrustmentOptions, entrustment]) 


  const directionText = useMemo(() => {
    return directionsOptions.find(item => {
      return item.value === direction
    })?.label
  }, [directionsOptions, direction]) 

  

  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between gap-[8px] mb-[12px]">
        <div className="flex gap-[8px]">

        <DrawerCheckSelect 
          childrenTrigger={
            <div className='flex items-center cursor-pointer rounded-full px-[10px] py-[5px] min-w-[92px]  bg-[#1B1B1E] h-[26px]  text-[#908E98] text-[13px] leading-[1] app-font-regular'>
              {entrustmentText}
              <img className='ml-1' src="/images/futuresDetail/filter-arrow-down.svg" alt="filter-arrow-down" />
            </div>
          }
          options={entrustmentOptions}
          value={entrustment}
          onChange={handleEntrustmentChange}
        />

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

        <CancelAllOrder onClickCancelAll={onClickCancelAll} filterOrders={filterOrders} />

      </div>

      <div className="flex items-center">
        <CheckboxWithLabel
          containerClassName="mr-6"
          label={t('currentOrdersList.showCurrentCoinOnly')}
          defaultChecked={filter.showOnlyBaseCoin}
          isChecked={filter.showOnlyBaseCoin}
          onChange={() => {
            setFilter({
              ...filter,
              showOnlyBaseCoin: !filter?.showOnlyBaseCoin
            })
          }}
        />
        <CheckboxWithLabel
          label={t('futuresDetails.common.allExpand')}
          defaultChecked={filter.isAllExpand}
          isChecked={filter.isAllExpand}
          onChange={() => {
            setFilter({
              ...filter,
              isAllExpand: !filter?.isAllExpand,
            })
          }}
        />

      </div>
      



    </div>
  )
}

interface CancelAllOrderProps {
  onClickCancelAll: () => void
  filterOrders: xOpenOrders[]
}


const CancelAllOrder = ({onClickCancelAll,filterOrders}: CancelAllOrderProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

	const handleConfirm = () => {
    onClickCancelAll()
		setOpen(false)
	}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={'ghost'}
          className="px-[10px] py-[5px] bg-[#1B1B1E]  rounded-full text-[#908E98] text-[calc(11rem/16)] h-[calc(24rem/16)]"
          disabled={!filterOrders || filterOrders.length === 0}
          > 
          {t('futuresDetails.tips.cancelAllOrders')}
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        className="w-[335px] bg-[#232329] rounded-2xl p-5"
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            <p className="text-[calc(18rem/16)] py-3">
            {t('futuresDetails.tips.cancelAllOrdersConfirm')}
            </p>
          </DialogTitle>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button  variant="greyDefault" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
              {t('futuresDetails.common.cancel')}
            </Button>
            <Button variant="purpleDefault" className="text-white flex-1 rounded-[50px]" onClick={handleConfirm}>
              {t('futuresDetails.common.confirm')}
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription />
      </DialogContent>
    </Dialog>
  )
}

export default CurrentOrdersFilter


