import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@components/ui/dropdown-menu.tsx";
import {useTranslation} from "react-i18next";
import {SmartMoneySortType} from "@/@generated/gql/graphql-future.ts";
import {useState} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/redux/store";
import {setWalletSort} from "@/redux/modules/monitoringPcSlice.ts";

type FilterType = {
  label: string
  value: SmartMoneySortType
}

const FollowTypeDropdownPc = () => {
  const { t } = useTranslation()
  const {sort} = useAppSelector((state: RootState) => state?.monitoringPc?.wallets)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState<boolean>(false)

  const listFilter: FilterType[] = [
    {
      label: t('smartMoney.filter.latestAttention'),
      value: SmartMoneySortType.FollowTime,
    },
    {
      label: t('smartMoney.filter.7dayWinningRate'),
      value: SmartMoneySortType.WinRate_7d,
    },
  ]
  const [currentSelect, setCurrentSelect] = useState(listFilter?.find(item => item?.value === sort) ?? listFilter[0])

  const handleOnClickItem = (item: FilterType) => {
    setOpen(false)
    setCurrentSelect(item)
    dispatch(setWalletSort(item?.value))
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-2 rounded-[6px] border-[0.8px] border-[#212127]">
        <span className="text-[13px] leading-[1] font-normal text-[#FFFFFFCC]">{currentSelect.label}</span>
        <img src="/images/icons/icon-chevron-down.svg" alt="chevron down" className="w-2 h-2" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-[220px]'>
        <ul className="flex flex-col px-2">
          {listFilter.map((item) => (
            <li
              key={item.value}
              className="cursor-pointer py-4 border-b-[0.5px] border-[#ECECED0A] flex items-center justify-between"
              onClick={() => handleOnClickItem(item)}
            >
              <span className="text-[13px] leading-[14px]">{item.label}</span>
              {
                item?.value === currentSelect.value && (
                  <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="icon tick" />
                )
              }
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FollowTypeDropdownPc;
