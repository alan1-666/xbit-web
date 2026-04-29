import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useLoyalty } from './context/LoyaltyContext'
import Text from '../common/Text'
import { useResponsive } from '@/hooks/useResponsive'

const SeasonDropdownRanking = () => {
  const { seasons, setSelectedSeason, selectedSeason } = useLoyalty()
  const { isDesktop } = useResponsive()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'w-fit flex justify-center cursor-pointer items-center gap-2 border border-[#79778C29] rounded-[8px] p-2 ',
            !isDesktop && 'bg-[#1A1A21] border-[#24242D] rounded-full',
          )}
        >
          <span className={cn('text-[#FBFBFB] text-[16px] font-[400]', !isDesktop && 'text-[11px]')}>
            {selectedSeason?.name ?? '--'}
          </span>
          <img src="/images/assets/vuesax/linear/arrow-down.svg" alt="" className="w-[12.14px] ml-2" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isDesktop ? 'center' : 'start'}
        alignOffset={-35}
        className="w-[80px] bg-[#18181B] p-[6px] border border-[#79778C29]"
      >
        {seasons?.map((item) => (
          <DropdownMenuItem
            className={cn(
              'focus:bg-[#79778C29] cursor-pointer',
              selectedSeason?.name === item.name && 'bg-[#79778C29]',
            )}
            onClick={() => {
              setSelectedSeason(item)
            }}
          >
            <Text
              text={item.name}
              className={cn(
                '!font-[330] text-left text-[#605E68]',
                selectedSeason?.name === item.name && 'text-[#FFFFFF]',
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SeasonDropdownRanking
