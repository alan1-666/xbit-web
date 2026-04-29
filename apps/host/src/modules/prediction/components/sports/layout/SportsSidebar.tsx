import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ALL_SPORTS, FUTURES_ICON, LIVE_ICON, NavigationItem, POPULAR_ITEMS, POPULAR_STAR_ICON } from './SportsNavigationData'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'

export const SportsSidebar = () => {
  const { pathname } = useLocation()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'all-Football': true,
    'all-Esports': false,
    'all-Cricket': false,
    'all-Tennis': false,
    'all-Hockey': false,
    'all-Rugby': false,
    'all-American Football': false,
    'all-Basketball': false,
    'all-Baseball': false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const isLiveActive = pathname.includes('/live')
  const isFuturesActive = pathname.includes('/futures')

  return (
    <div
      className="flex flex-col w-65 shrink-0 h-full py-8 overflow-y-auto px-2 border-r border-border-secondary _hidescrollbar"
      id="sports-sidebar"
    >
      {/* Live */}
      <div className="group/sports-item">
        <Link className="block" to={NAVIGATIONS.prediction.sports.live()}>
          <div className={cn("rounded-lg transition-colors py-2 px-3 cursor-pointer relative", isLiveActive ? "bg-white/10 text-white" : "hover:bg-white/5")}>
            <div className="flex items-center justify-between gap-x-2.5">
              <div className="flex items-center gap-x-2.5 min-w-0">
                <div className={cn("shrink-0", isLiveActive ? "text-primary" : "")}>
                  {LIVE_ICON}
                </div>
                <p className={cn("text-[13px] pr-4 whitespace-nowrap truncate font-medium", isLiveActive ? "text-white" : "text-text-primary")}>Live</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Futures */}
      <div className="group/sports-item">
        <Link className="block" to={NAVIGATIONS.prediction.sports.futures('nfl')}>
          <div className={cn("rounded-lg transition-colors py-2 px-3 cursor-pointer relative", isFuturesActive ? "bg-white/10 text-white" : "hover:bg-white/5")}>
            <div className="flex items-center justify-between gap-x-2.5">
              <div className="flex items-center gap-x-2.5 min-w-0">
                <div className={cn("shrink-0", isFuturesActive ? "text-primary" : "")}>
                  {FUTURES_ICON}
                </div>
                <p className={cn("text-[13px] pr-4 whitespace-nowrap truncate font-medium", isFuturesActive ? "text-white" : "text-text-primary")}>Futures</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="w-full h-px my-2 bg-border shrink-0"></div>

      {/* Popular Section */}
      <div>
        <div className="flex items-center justify-between pl-3 pr-3 mt-4 mb-3">
          <div className="flex items-center gap-1.5">
            {POPULAR_STAR_ICON}
            <p className="text-[11px] uppercase text-text-secondary font-medium tracking-wider">Popular</p>
          </div>
        </div>
      </div>

      {/* Popular Sports Items */}
      <div>
        {POPULAR_ITEMS.map((item, index) => (
          <SidebarItem
            key={`popular-${index}`}
            item={item}
            isExpanded={!!expandedSections[`popular-${item.label}`]}
            onToggle={() => toggleSection(`popular-${item.label}`)}
            currentPath={pathname}
          />
        ))}
      </div>

      {/* All Sports Header */}
      <div>
        <div className="flex items-center justify-between pl-3 pr-3 mt-4 mb-3">
          <p className="text-[11px] uppercase text-text-secondary font-medium tracking-wider">All Sports</p>
        </div>
      </div>

      {/* All Sports Items */}
      <div>
        {ALL_SPORTS.map((item, index) => (
          <SidebarItem
            key={`category-${index}`}
            item={item}
            isExpanded={!!expandedSections[`all-${item.label}`]}
            onToggle={() => toggleSection(`all-${item.label}`)}
            currentPath={pathname}
          />
        ))}
      </div>
    </div>
  )
}

const SidebarItem = ({
  item,
  isExpanded,
  onToggle,
  currentPath,
}: {
  item: NavigationItem
  isExpanded: boolean
  onToggle: () => void
  currentPath: string
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0
  const isActive = !hasSubItems && (currentPath === item.link || currentPath.startsWith(item.link + '/'))

  return (
    <div className="group/sports-item">
      {hasSubItems ? (
        // Collapsible Item
        <div>
          <div
            className="rounded-lg hover:bg-white/5 transition-colors py-2 px-3 cursor-pointer relative select-none"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between gap-x-2.5">
              <div className="flex items-center gap-x-2.5 min-w-0">
                <div className="shrink-0">{item.icon}</div>
                <p className="text-[13px] pr-4 whitespace-nowrap truncate font-medium text-text-primary">
                  {item.label}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={`size-3 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
                  <polyline points="1.75 4.25 6 8.5 10.25 4.25"></polyline>
                </g>
              </svg>
            </div>
          </div>
          {/* Sub Items - using grid transition for smooth height animation */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="pl-5">
                {item.subItems?.map((subItem, subIndex) => {
                    const isSubActive = currentPath === subItem.link || currentPath.startsWith(subItem.link + '/')
                    return (
                      <Link key={subIndex} className="block" to={subItem.link}>
                        <div className={cn("rounded-lg transition-colors py-2 px-3 cursor-pointer relative", isSubActive ? "bg-white/10 text-white" : "hover:bg-white/5")}>
                          <div className="flex items-center justify-between gap-x-2.5">
                            <div className="flex items-center gap-x-2.5 min-w-0">
                              <div className="shrink-0"></div>
                              <p className={cn("text-[13px] pr-4 whitespace-nowrap truncate font-medium", isSubActive ? "text-white" : "text-text-primary")}>
                                {subItem.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular Item
        <Link className="block" to={item.link}>
          <div className={cn("rounded-lg transition-colors py-2 px-3 cursor-pointer relative", isActive ? "bg-white/10 text-white" : "hover:bg-white/5")}>
            <div className="flex items-center justify-between gap-x-2.5">
              <div className="flex items-center gap-x-2.5 min-w-0">
                <div className="shrink-0">{item.icon}</div>
                <p className={cn("text-[13px] pr-4 whitespace-nowrap truncate font-medium", isActive ? "text-white" : "text-text-primary")}>
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
