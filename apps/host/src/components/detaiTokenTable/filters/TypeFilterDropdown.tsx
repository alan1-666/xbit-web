import { EventType } from '@/@generated/gql/graphql-meme2.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu.tsx'
import { cn } from '@/lib/utils.ts'
import Text from '@components/common/Text.tsx'
import { useTranslation } from 'react-i18next'

export interface TypeFilterDropdownProps {
  value: EventType | undefined
  onChange: (value: EventType | undefined) => void
}

const typeOptions = [
  { value: undefined, i18nKey: 'detail.tabs.all' },
  { value: EventType.Buy, i18nKey: 'detail.tabs.payOrder' },
  { value: EventType.Sell, i18nKey: 'detail.tabs.sellOrder' },
  { value: EventType.Add, i18nKey: 'detail.tokenDetail.addLiquidity' },
  { value: EventType.Remove, i18nKey: 'detail.tokenDetail.removeLiquidity' },
  { value: EventType.Burnt, i18nKey: 'detail.tokenDetail.burn' },
]

export const TypeFilterDropdown = (props: TypeFilterDropdownProps) => {
  const { value, onChange } = props
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <img
          src={value !== typeOptions[0].value ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
          className="w-[10px] h-[13px] mr-4 cursor-pointer !pointer-events-auto"
          alt=""
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[140px] bg-[#212127] p-[6px] border border-[#212127]">
        {typeOptions.map((option) => (
          <DropdownMenuItem
            className={cn('focus:bg-[#ECECED14] cursor-pointer py-[11px]', value === option.value && 'bg-[#ECECED14]')}
            onClick={() => {
              onChange(option.value)
            }}
          >
            <Text text={t(option.i18nKey)} className="!font-[330] text-center mx-auto" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
