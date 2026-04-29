import { TransactionType } from '@/@generated/gql/graphql-trading'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const SideSelector = ({
  selected,
  onSelect,
}: {
  selected: TransactionType
  onSelect: (side: TransactionType) => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="relative bg-[#18181b] rounded-full grid grid-cols-2 p-[2px]">
      <div
        className={cn(
          'relative z-10 flex items-center justify-center cursor-pointer py-2 font-[400] text-[14px] leading-none',
          selected === TransactionType.Buy ? 'text-white' : 'text-[#A6A4B3]',
          {
            'bg-[#00a85c] shadow-inset-green rounded-full': selected === TransactionType.Buy,
          },
        )}
        onClick={() => onSelect(TransactionType.Buy)}
      >
        {t('transaction.buy')}
      </div>
      <div
        className={cn(
          'relative z-10 flex items-center justify-center cursor-pointer py-2 font-[400] text-[14px] leading-none',
          selected === TransactionType.Sell ? 'text-white' : 'text-[#A6A4B3]',
          {
            'bg-[#EA3B4F] shadow-inset-red rounded-full': selected === TransactionType.Sell,
          },
        )}
        onClick={() => onSelect(TransactionType.Sell)}
      >
        {t('transaction.sell')}
      </div>
    </div>
  )
}

export default SideSelector
