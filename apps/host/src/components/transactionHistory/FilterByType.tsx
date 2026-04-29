import { TransactionType } from '@/@generated/gql/graphql-trading'
import BottomSheet from '@/components/common/BottomSheet'
import { useTranslation } from 'react-i18next'

type FilterByTypeProps = {
  open: boolean
  setOpen: (open: boolean) => void
  showTitle?: boolean
  typeFilter?: TransactionType
  onFilterByTypeChange: (value?: TransactionType) => void
}

const FilterByType = ({ open, setOpen, showTitle = true, typeFilter, onFilterByTypeChange }: FilterByTypeProps) => {
  const { t } = useTranslation()
  const TRANSACTION_TYPES: { name: string; value?: TransactionType }[] = [
    { name: t('history.all'), value: undefined },
    { name: t('history.buy'), value: TransactionType.Buy },
    { name: t('history.sell'), value: TransactionType.Sell },
    // { name: 'Add Liquidity', value: TransactionType.AddLiquidity },
    // { name: 'Remove Liquidity', value: TransactionType.RemoveLiquidity },
  ]

  return (
    <BottomSheet open={open} setOpen={setOpen} title={showTitle ? t('history.filterByType') : undefined} hiddenBgImg>
      <div className={`overflow-y-auto no-scrollbar gap-2 flex-col flex ${showTitle ? '' : 'mt-2'}`}>
        {TRANSACTION_TYPES.map((type) => (
          <div
            key={type.name}
            className="flex justify-between items-center py-[18px] cursor-pointer rounded-[10px] px-4 bg-[#2B2B33]"
            onClick={() => {
              onFilterByTypeChange(type.value)
              setOpen(false)
            }}
          >
            <div className="text-[16px] font-[500] text-white">{type.name}</div>
            {typeFilter === type.value ? (
              <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" className="size-[25px]" />
            ) : (
              <div className="border border-[#37363D] rounded-full size-[25px]" />
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

export default FilterByType
