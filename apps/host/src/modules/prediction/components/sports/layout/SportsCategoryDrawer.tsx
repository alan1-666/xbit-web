import AppDrawer from '@components/common/AppDrawer'
import { NavigationItem } from './SportsNavigationData'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SportsCategoryDrawerProps {
  open: boolean
  onClose: () => void
  category: NavigationItem | null
}

export const SportsCategoryDrawer = ({ open, onClose, category }: SportsCategoryDrawerProps) => {
  const { pathname } = useLocation()

  if (!category) return null

  return (
    <AppDrawer
      open={open}
      setOpen={(val) => {
        if (!val) onClose()
      }}
      title={category.label}
      drawerContent={
        <div className="flex flex-col gap-1 pb-4">
          {category.subItems?.map((subItem, index) => {
            const isActive = pathname === subItem.link || pathname.startsWith(subItem.link + '/')
            
            return (
              <Link
                key={index}
                to={subItem.link}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isActive ? "bg-white/10 text-white" : "hover:bg-white/5 text-text-primary"
                )}
              >
                {/* Placeholder for icon if needed, currently subItems don't have distinct icons in data usually, or null */}
                {subItem.icon && <span className="shrink-0">{subItem.icon}</span>}
                <span className="text-sm font-medium">{subItem.label}</span>
              </Link>
            )
          })}
        </div>
      }
      drawerClassName="bg-[#1C1F26] text-white border-t border-white/10"
    />
  )
}
