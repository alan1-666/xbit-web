import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { MemeDiscoverDesktopPage } from '@pages/meme/discover/desktop'
import { MemeDiscoverPage } from '@pages/meme/new-discover.tsx'
import PcAdBanner from '@/components/PC/PcAdBanners'

const MemePage = () => {
  const { isDesktop } = useResponsive()
  if (isDesktop) {
    return (
      <>
        <MemeDiscoverDesktopPage />
        <PcAdBanner scene="meme" />
      </>
    )
  }
  return <MemeDiscoverPage />
}

export default MemePage
