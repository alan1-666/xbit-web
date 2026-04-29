import { Link } from 'react-router-dom'
import { NavigationItemData } from '@components/PC/Header/NavigationItemData.ts'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useTranslation } from 'react-i18next'

interface ThirdLevelItemProps {
  menuItem: NavigationItemData
}

export const ThirdLevelItem = (props: ThirdLevelItemProps) => {
  const { menuItem } = props
  const { t } = useTranslation()
  const { key: itemKey, title, href, external, disabled } = menuItem
  const resolvedHref = typeof href === 'function' ? href() : href
  const isDisabled = disabled === true

  return (
    <li key={itemKey}>
      <div className="rounded-[8px] hover:bg-[#2A2839] mx-2">
        <div
          className={cn(
            'cursor-pointer p-2 rounded-[8px] transition-colors',
            isDisabled ? 'opacity-50' : 'hover:bg-[#2A2A30]',
          )}
        >
          <div className={cn('text-[calc(14rem/16)] w-full', isDisabled ? 'text-[#FFFFFF50]' : 'text-white')}>
            {isDisabled ? (
              <TooltipProvider>
                <SimpleTooltip content={t('liquidityChart.comingSoon')} side="right" sideOffset={24}>
                  <span>{title}</span>
                </SimpleTooltip>
              </TooltipProvider>
            ) : resolvedHref ? (
              external ? (
                <a href={resolvedHref} target="_blank" rel="noopener noreferrer">
                  {title}
                </a>
              ) : (
                <Link to={resolvedHref}>{title}</Link>
              )
            ) : (
              <span>{title}</span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
