import Text from '@/components/common/Text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTradingDashboardContext } from './context/TradingDashboardContext'
import { FilterSideOption, OrderSide } from '../../trade/types'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { FilterSelectOption } from '@/components/common/FilterSelect'

const DropdownDirection = ({ directionsOptionsProps }: { directionsOptionsProps?: FilterSelectOption[] | undefined }) => {
  const { setSide, side } = useTradingDashboardContext()
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

  const listDierction = useMemo(() => {
    if (directionsOptionsProps) {
      return directionsOptionsProps
    }
    return directionsOptions
  }, [directionsOptionsProps])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <Button variant="ghost" className='focus-visible:shadow-[none]'>
        </Button> */}
        <img
          src={
            side !== listDierction[0].value
              ? '/images/icons/icon-filter-solid.svg'
              : '/images/icons/icon-filter.svg'
          }
          className="w-[10px] h-[13px] mr-4 cursor-pointer !pointer-events-auto"
          alt=""
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[80px] bg-[#232329] p-[6px] border border-[#ECECED0A]"
        onChange={(e) => {
          console.log(e)
        }}
      >
        {listDierction.map((e) => (
          <DropdownMenuItem
            className={cn('focus:bg-[#ECECED14] cursor-pointer', side === e.value && 'bg-[#ECECED14]')}
            onClick={() => {
              setSide(e.value as OrderSide | "All")
            }}
          >
            <Text text={e.label as string} className="!font-[330] text-center mx-auto" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownDirection
