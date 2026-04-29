import { NewDiscoverHeader } from '@/components/discover/NewDiscoverHeader'
import { useResponsive } from '@/hooks/useResponsive'
import { HeaderTags } from '@/modules/prediction/components/shared/HeaderTags.tsx'
import { Outlet } from 'react-router-dom'

export const HomePage = () => {
  const { isDesktop } = useResponsive()

  return (
    <div>
      {!isDesktop && (
        <div className="mt-2">
          <NewDiscoverHeader />
        </div>
      )}
      <HeaderTags />
      <div className="px-2.5 lg:px-5">
        <Outlet />
      </div>
    </div>
  )
}
