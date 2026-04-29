import { useTranslation } from 'react-i18next'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { DialogTitle } from '@radix-ui/react-dialog'
import { IconCheckCircleSolid } from '../icon'
import { Button } from '../ui/button'
import { TransactionType } from '@/@generated/gql/graphql-future.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { SmartMoneyFilterType } from '@/types/monitoring.ts'
import { setRealtimeTxFilterTxType } from '@/redux/modules/monitoringPcSlice.ts'

export interface TransactionTypeFilterProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onChange: (value: TransactionType | undefined) => void
}

export default function TransactionTypeFilter(props: TransactionTypeFilterProps) {
  const { open, setOpen } = props
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = useState<TransactionType | undefined>(undefined)
  const confirmedItem = useAppSelector((state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType).transactionType)
  const dispatch = useAppDispatch()

  useEffect(() => {
    setSelectedItem(confirmedItem)
  }, [confirmedItem])

  const items = useMemo(() => {
    return [
      {
        label: t('detail.smartMoney.buy'),
        value: TransactionType.Buy,
      },
      {
        label: t('detail.smartMoney.sell'),
        value: TransactionType.Sell,
      },
      {
        label: t('detail.smartMoney.addLiquidity'),
        value: TransactionType.Add,
      },
      {
        label: t('detail.smartMoney.removeLiquidity'),
        value: TransactionType.Remove,
      },
    ]
  }, [])

  const selectedLabel = items.find((item) => item.value === confirmedItem)?.label || t('detail.smartMoney.transactionTypeShortName')

  const onSelect = (value: TransactionType | undefined) => {
    setSelectedItem(value)
  }

  const handleApply = () => {
    setOpen(false)
    dispatch(setRealtimeTxFilterTxType(selectedItem))
  }

  const handleClear = () => {
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="rounded-[6px] border-[0.8px] border-[#ECECED1F] flex items-center justify-between gap-[6px] p-2 cursor-pointer w-1/3 min-w-36">
          <span className="text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-[#FFFFFFCC] whitespace-nowrap">
            {selectedLabel}
          </span>
          <img src="/images/icons/icon-chevron-down.svg" className="w-[6.67px] h-[4.67px]" alt="" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-[768px] mx-auto bg-[#23232a]">
        <DrawerHeader className="px-3.5 flex w-full items-center justify-between">
          <DialogTitle className="mb-0.5 flex items-center justify-between w-full">
            <div className="flex gap-2 items-end">
              <span className="text-[calc(18rem/16)] leading-[calc(18rem/16)] app-font-medium text-[#FFFFFF]">
                {t('detail.smartMoney.transactionType')}
              </span>
              <span
                className="text-[calc(14rem/16)] leading-[calc(14rem/16)] text-[#00FFF6]  cursor-pointer"
                onClick={handleClear}
              >
                {t('detail.smartMoney.clear')}
              </span>
            </div>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogTitle>
        </DrawerHeader>
        <div className="px-3.5">
          <div
            key={'all'}
            className="py-4 border-b-[0.5px] border-[#ECECED0A] text-[1rem] font-medium flex items-center justify-between cursor-pointer"
            onClick={() => onSelect(undefined)}
          >
            <span className="text-[1rem] leading-[1rem]">{t('detail.smartMoney.all')}</span>
            {selectedItem === undefined && <IconCheckCircleSolid className="!size-4" />}
          </div>
          {items.map((item) => (
            <div
              key={item.value}
              className="py-4 border-b-[0.5px] border-[#ECECED0A] text-[1rem] font-medium flex items-center justify-between cursor-pointer"
              onClick={() => onSelect(item.value)}
            >
              <span className="text-[1rem] leading-[1rem]">{item.label}</span>
              {selectedItem === item.value && <IconCheckCircleSolid className="!size-4" />}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 p-4">
          <Button
            variant="close"
            className="rounded-full flex-1 bg-[#ECECED1F]"
            onClick={() => setOpen(false)}
          >
            {t('detail.smartMoney.cancel')}
          </Button>
          <Button variant="gradient" className="rounded-full flex-1 text-[#141414]" onClick={handleApply}>
            {t('detail.smartMoney.confirm')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
