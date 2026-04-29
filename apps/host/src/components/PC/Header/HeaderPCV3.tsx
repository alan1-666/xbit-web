import Search from '@components/PC/Search'
import { AccountArea } from '@components/PC/Header/AccountArea.tsx'
import { NavigationArea } from '@components/PC/Header/NavigationArea.tsx'
import { BrandArea } from '@components/PC/Header/BrandArea.tsx'

export const HeaderPCV3 = () => {
  return (
    <div className="flex items-center px-4 h-15 justify-between min-w-0 z-10 relative bg-[#141418] overflow-hidden">
      <BrandArea />
      <div className="flex items-center gap-1.5 2xl:gap-3 flex-1 min-w-0 ml-4 pc:ml-8 nav-bar-header overflow-hidden">
        <NavigationArea />
        <div className="shrink-0 relative z-[60]">
          <Search />
        </div>
        <div className="shrink-0 relative z-[60]">
          <AccountArea />
        </div>
      </div>
    </div>
  )
}
