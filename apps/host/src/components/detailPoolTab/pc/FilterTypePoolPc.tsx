import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@components/ui/dropdown-menu.tsx";
import {RootState, useAppDispatch, useAppSelector} from "@/redux/store";
import {setFollowedPoolFilter, setPoolFilter, TradeTabState} from "@/redux/modules/tradeTab.slice.ts";
import {useMemo, useState} from "react";
import {PlatformType, PoolTransactionType, SortByCreateAtType} from "@/types/enums.ts";
import {useTranslation} from "react-i18next";
import {Button} from "@components/ui/button.tsx";
import {TransactionClassification} from "@/@generated/gql/graphql-future.ts";
import {FilterState} from "@components/detailPoolTab";

type FilterTypeProps = {
  isFollowing?: boolean;
}

const DEFAULT_STATE = {
  transactionType: PoolTransactionType.All,
  platform: PlatformType.All,
  holder: undefined,
  sortBy: SortByCreateAtType.DESC,
  timestampFrom: undefined,
  timestampTo: undefined,
  minQuantity: undefined,
  maxQuantity: undefined,
  minTotalValue: undefined,
  maxTotalValue: undefined,
  classification: TransactionClassification.All,
}

const FilterTypePoolPc = ({isFollowing = false}: FilterTypeProps) => {
  const {t} = useTranslation()

  const dispatch = useAppDispatch()

  const { poolFilter, followedPoolFilter } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  const currentFilter = useMemo(
    () => isFollowing ? followedPoolFilter?.transactionType : poolFilter?.transactionType,
    [isFollowing, followedPoolFilter?.transactionType, poolFilter?.transactionType]
  )

  const [open, setOpen] = useState<boolean>(false)
  const [selectedFilter, setSelectedFilter] = useState(currentFilter ?? PoolTransactionType.All)
  const [confirmedFilter, setConfirmedFilter] = useState(currentFilter)

  const listType: PoolTransactionType[] = [
    PoolTransactionType.All,
    PoolTransactionType.AddLiquidity,
    PoolTransactionType.RemoveLiquidity,
    //PoolTransactionType.SingleSideLiquidity
  ]

  const getTransactionTypeLabel = (tx: PoolTransactionType) => {

    switch (tx) {
      case PoolTransactionType.All:
        return t('detail.tabs.all')
      case PoolTransactionType.AddLiquidity:
      case PoolTransactionType.Add:
        return t('detail.pool.add')
      case PoolTransactionType.Remove:
      case PoolTransactionType.RemoveLiquidity:
        return t('detail.pool.remove')
      case PoolTransactionType.SingleSideLiquidity:
        return t('history.singleSideLiquidity')
      default:
        return tx
    }
  }

  const handleClickItem = (item: PoolTransactionType) => {
    setSelectedFilter(item)
  }

  const createNewState = (item: PoolTransactionType, state: FilterState | undefined): FilterState => {
    if (state) {
      return {...state, transactionType: item}
    } else {
      return {...DEFAULT_STATE, transactionType: item}
    }
  }

  const handleConfirmClick = (item: PoolTransactionType) => {
    setConfirmedFilter(item)
    // dispatch state
    const newState = isFollowing ? createNewState(item, followedPoolFilter) : createNewState(item, poolFilter)
    dispatch(isFollowing? setFollowedPoolFilter(newState) : setPoolFilter(newState))
    //close
    setOpen(false)
  }


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button size="xs" className="rounded-full bg-transparent p-0">
          <img src={
            confirmedFilter && confirmedFilter !== PoolTransactionType.All
              ? '/images/icons/icon-filter-solid.svg'
              : '/images/icons/icon-filter.svg'
          } alt="icon filter" className='w-3.5 h-3.5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className='p-1 rounded-[4px]'>
          <ul className="flex flex-col gap-2" >
            {
              listType?.map(item => {
                return (
                  <li className="flex items-center justify-between gap-2 px-2 py-3 cursor-pointer hover:bg-[#18181B] min-w-[172px]" onClick={() => handleClickItem(item)}>
                    <span className='text-[14px] leading-[1] font-light '>
                      {getTransactionTypeLabel(item)}
                    </span>
                    {selectedFilter === item && (
                      <img src="/images/icons/icon-tick-rounded.svg?v=2" className='size-3.5' alt="ic tick" />
                    )}
                  </li>
                )
              })
            }
          </ul>
          <div className="flex justify-end items-center flex-row gap-2.5 pt-4 ">
            <Button
              size="lg"
              // disabled={isConfirmDisabled()}
              variant="gradient"
              className="text-[14px] leading-[1] font-normal text-[#261236] rounded-[50px] h-8"
              onClick={() => handleConfirmClick(selectedFilter)}
            >
              {t('chart.buttons.confirm')}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterTypePoolPc;
