import { useTranslation } from 'react-i18next'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
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
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { Button } from '@/components/ui/button'
import { useState, useMemo } from 'react'
import { FilterTypeOption, FilterSideOption, OrderType, OrderSide, All, xPositions } from '../types'

interface MyPositionFilterProps {
  filter: OrdersListFilter
  setFilter: (filter: OrdersListFilter) => void
  onClickCloseAll: () => void
  filterPostions: xPositions[]
}

const MyPositionFilter = ({ filter, setFilter, onClickCloseAll,filterPostions }: MyPositionFilterProps) => {
  const { t } = useTranslation()
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

  const [direction, setDirection] = useState<string>(directionsOptions[0].value)

  const handleDirectionChange = (direction: string) => {
    setDirection(direction)

    if (setFilter) {
      setFilter({
        ...filter,
        side: direction as OrderSide | All,
      })
    }
  }

  const directionText = useMemo(() => {
    return directionsOptions.find((item) => {
      return item.value === direction
    })?.label
  }, [directionsOptions, direction])

  return (
    <div className="mb-2.5">
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

        <CloseAllPosition onClickCloseAll={onClickCloseAll} filterPostions={filterPostions} />
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
              showOnlyBaseCoin: !filter?.showOnlyBaseCoin,
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

interface CloseAllPositioinProps {
  onClickCloseAll: () => void
  filterPostions: xPositions[]
}

const CloseAllPosition = ({ onClickCloseAll,filterPostions }: CloseAllPositioinProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onClickCloseAll()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={'ghost'} 
          className="px-[10px] py-[5px] bg-[#1B1B1E]  rounded-full text-[#908E98] text-[calc(11rem/16)] h-[calc(24rem/16)] "
          disabled={!filterPostions || filterPostions.length === 0}
        >
          {t('futuresDetails.common.closeAll')}
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        className="w-[335px] bg-[#232329] rounded-2xl p-5"
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            <p className="text-[calc(18rem/16)] py-3">{t('futuresDetails.common.closeAllConfirm')}</p>
          </DialogTitle>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button variant="greyDefault" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
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

export default MyPositionFilter
