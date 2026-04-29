import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { NavigationLinkItem } from '@components/PC/Header/NavigationMenuItem.tsx'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { AnimatedGradientButton } from '@components/ui/AnimatedGradientButton'

const LinkItem = (props: { enabled: boolean }) => {
  const { enabled } = props
  const { t } = useTranslation()
  return (
    <AnimatedGradientButton className="rounded-full">
      <div className="rounded-full">
        <div className="px-3 py-1.5 rounded-full">
          <NavigationLinkItem
            menuItem={{
              key: 'airdrop',
              title: t('header.airdrop'),
              href: NAVIGATIONS.airdrop(),
              disabled: !enabled,
            }}
            className={cn(
              'h-4 px-0 bg-transparent focus:bg-transparent hover:bg-transparent',
              enabled ? 'text-white hover:text-white' : 'text-white/70 hover:text-white/70',
            )}
          />
        </div>
      </div>
    </AnimatedGradientButton>
  )
}

export const AirdropNavigationLinkItem = () => {
  const enabled = useFeatureIsOn('show_loyalty')
  if (!enabled) {
    // return (
    //   <TooltipProvider>
    //     <SimpleTooltip content={t('liquidityChart.comingSoon')}>
    //       <div>
    //         <LinkItem enabled={enabled} />
    //       </div>
    //     </SimpleTooltip>
    //   </TooltipProvider>
    // )
    return null // Hide the link entirely when disabled
  }
  return <LinkItem enabled={true} />
}
