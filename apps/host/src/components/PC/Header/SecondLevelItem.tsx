import { NavigationItemData } from '@components/PC/Header/NavigationItemData.ts'
import { cn } from '@/lib/utils'
import { NavLink } from '@components/PC/Header/NavLink.tsx'
import { useTranslation } from 'react-i18next'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'

interface SecondLevelItemProps {
  menuItem: NavigationItemData
}

export const SecondLevelItem = (props: SecondLevelItemProps) => {
  const { menuItem } = props
  const { title, subTitle, href, external, disabled } = menuItem
  const resolvedHref = typeof href === 'function' ? href() : href
  const isDisabled = disabled === true
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'rounded-[8px] hover:bg-[#2A2839] w-full cursor-pointer group/nav relative p-2',
        isDisabled && 'opacity-50',
      )}
    >
      <div className="flex items-center flex-row">
        {menuItem.icon ? (
          <div className="text-[#908E98] group-hover/nav:text-white transition-colors mr-1">{menuItem.icon}</div>
        ) : null}
        <div className="flex-1">
          <div className={cn('cursor-pointer size-full')}>
            {!isDisabled && resolvedHref ? (
              <NavLink href={resolvedHref} external={external} className="absolute inset-0 z-2" />
            ) : null}
            {isDisabled ? (
              <TooltipProvider>
                <SimpleTooltip className="w-full" content={t('liquidityChart.comingSoon')} side="right" sideOffset={24}>
                  <div className="text-[#FFFFFF50] cursor-pointer w-full">{title}</div>
                </SimpleTooltip>
              </TooltipProvider>
            ) : (
              <div className={cn('text-[calc(14rem/16)] text-white')}>{title}</div>
            )}
            {subTitle ? <div className="text-[calc(10rem/16)] text-[#908E98]">{subTitle}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
