import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'
import { ALL_SPORTS, FUTURES_ICON, LIVE_ICON, NavigationItem, POPULAR_ITEMS } from './SportsNavigationData'
import { SportsCategoryDrawer } from './SportsCategoryDrawer'

export const SportsMobileTopNav = () => {
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<NavigationItem | null>(null)

  const handleCategoryClick = (item: NavigationItem) => {
    if (item.subItems && item.subItems.length > 0) {
      setSelectedCategory(item)
      setIsDrawerOpen(true)
    }
  }

  const isLiveActive = pathname.includes('/live')
  const isFuturesActive = pathname.includes('/futures')

  return (
    <div className="w-full bg-background border-b border-border/40">
      <div 
        ref={scrollRef}
        className="flex items-center gap-4 px-2 py-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {/* Live */}
        <Link 
          to={NAVIGATIONS.prediction.sports.live()}
          className="flex flex-col items-center gap-1.5 min-w-[50px] shrink-0 group"
        >
          <div className={cn(
            "p-2.5 rounded-full transition-colors",
            isLiveActive ? "bg-white/10 text-primary" : "bg-muted/30 text-muted-foreground group-hover:text-foreground"
          )}>
            {LIVE_ICON}
          </div>
          <span className={cn(
            "text-[11px] font-medium whitespace-nowrap",
            isLiveActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            Live
          </span>
        </Link>

        {/* Futures */}
        <Link 
          to={NAVIGATIONS.prediction.sports.futures('nfl')}
          className="flex flex-col items-center gap-1.5 min-w-[50px] shrink-0 group"
        >
          <div className={cn(
            "p-2.5 rounded-full transition-colors",
            isFuturesActive ? "bg-white/10 text-primary" : "bg-muted/30 text-muted-foreground group-hover:text-foreground"
          )}>
            {FUTURES_ICON}
          </div>
          <span className={cn(
            "text-[11px] font-medium whitespace-nowrap",
            isFuturesActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            Futures
          </span>
        </Link>

        <div className="w-px h-8 bg-border/40 shrink-0 mx-1" />

        {/* Popular Items */}
        {POPULAR_ITEMS.map((item, idx) => (
            <TopNavItem key={`pop-${idx}`} item={item} currentPath={pathname} onSelect={handleCategoryClick} />
        ))}
        
         <div className="w-px h-8 bg-border/40 shrink-0 mx-1" />

        {/* All Sports */}
        {ALL_SPORTS.map((item, idx) => (
             <TopNavItem key={`all-${idx}`} item={item} currentPath={pathname} onSelect={handleCategoryClick} />
        ))}

      </div>

      <SportsCategoryDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        category={selectedCategory} 
      />
    </div>
  )
}

const TopNavItem = ({ item, currentPath, onSelect }: { item: NavigationItem; currentPath: string; onSelect: (item: NavigationItem) => void }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isActive = hasSubItems 
        ? item.subItems?.some(sub => currentPath === sub.link || currentPath.startsWith(sub.link + '/'))
        : (item.link !== '#' && (currentPath === item.link || currentPath.startsWith(item.link + '/')))

    const handleClick = (e: React.MouseEvent) => {
        if (hasSubItems) {
            e.preventDefault()
            onSelect(item)
        }
    }

    return (
        <Link 
          to={hasSubItems ? '#' : item.link}
          onClick={handleClick}
          className="flex flex-col items-center gap-1.5 min-w-[50px] shrink-0 group"
        >
          <div className={cn(
            "p-2.5 rounded-full transition-colors relative",
            isActive ? "bg-white/10 text-foreground" : "bg-muted/30 text-muted-foreground group-hover:text-foreground"
          )}>
            {item.icon}
             {/* {item.count && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 border border-background">
                    {item.count}
                </span>
            )} */}
          </div>
          <span className={cn(
            "text-[11px] font-medium whitespace-nowrap max-w-[70px] truncate text-center",
            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {item.label}
          </span>
        </Link>
    )
}
