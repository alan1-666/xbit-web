import {useTranslation} from "react-i18next";
import {useMemo, useState} from "react";
import {TransactionType} from "@/@generated/gql/graphql-future.ts";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@components/ui/dropdown-menu.tsx";
import {IconCheckCircleSolid} from "@components/icon";
import {RootState, useAppDispatch, useAppSelector} from "@/redux/store";
import {setRealtimeTxFilterTxType} from "@/redux/modules/monitoringPcSlice.ts";
import {SmartMoneyFilterType} from "@/types/monitoring.ts";

const TypeDropDown = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const selectedItem = useAppSelector((state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType).transactionType)
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
  }, [t])

  const onSelect = (value: TransactionType | undefined) => {
    dispatch(setRealtimeTxFilterTxType(value))
    setOpen(false)
  }
  const selectedLabel = items.find((item) => item.value === selectedItem)?.label || t('detail.filters.transactionType')


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="rounded-[6px] border-[0.8px] border-[#212127] flex items-center justify-between gap-[6px] p-2 cursor-pointer w-1/3 min-w-36">
          <span className="text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-[#FFFFFFCC] whitespace-nowrap">
            {selectedLabel}
          </span>
          <img src="/images/icons/icon-chevron-down.svg" className="w-[6.67px] h-[4.67px]" alt="" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-[160px] border-[#212127] bg-[#1a1a1d]'>
        <div className="w-full max-h-[400px] overflow-auto">
          <div className="px-2">
            <div
              key={'all'}
              className="py-4 border-b-[0.5px] border-[#ECECED0A] text-[1rem] font-medium flex items-center justify-between cursor-pointer"
              onClick={() => onSelect(undefined)}
            >
              <span className="text-[13px] leading-[14px]">{t('detail.smartMoney.all')}</span>
              {selectedItem === undefined && <IconCheckCircleSolid className="!size-3.5" />}
            </div>
            {items.map((item) => (
              <div
                key={item.value}
                className="py-4 border-b-[0.5px] border-[#ECECED0A] text-[1rem] font-medium flex items-center justify-between cursor-pointer"
                onClick={() => onSelect(item.value)}
              >
                <span className="text-[13px] leading-[14px]">{item.label}</span>
                {selectedItem === item.value && <IconCheckCircleSolid className="!size-3.5" />}
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TypeDropDown;
