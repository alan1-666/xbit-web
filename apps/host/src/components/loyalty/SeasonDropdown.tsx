import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useLoyalty } from './context/LoyaltyContext'
import Text from '../common/Text'
import { useResponsive } from '@/hooks/useResponsive'

const SeasonDropdown = () => {
  const { seasons, setSelectedSeason, selectedSeason } = useLoyalty()

  const { isDesktop } = useResponsive()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'w-[300px] bg-[#141418] rounded-t-[16px] h-[57px] z-10 bordure-indented relative flex justify-center cursor-pointer items-center',
            !isDesktop && 'h-[44px] w-fit px-5 rounded-t-[8px] relative',
          )}
        >
          <span className="text-center block leading-[57px]">{selectedSeason?.name ?? '--'}</span>
          <img src="/images/assets/vuesax/linear/arrow-down.svg" alt="" className="w-[12.14px] ml-2" />
          {!isDesktop && <div className="custom-clip-path-polygon" />}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isDesktop ? 'start' : 'center'}
        className="w-[80px] bg-[#18181B] p-[6px] border border-[#79778C29]"
        alignOffset={100}
        sideOffset={-10}
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

export default SeasonDropdown
