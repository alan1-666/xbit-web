import { LoginSection } from '@components/loyalty/LoginSection.tsx'
import { Header as DesktopHeader } from '@components/loyalty/desktop/Header.tsx'
import LoyaltyFAQ from '@components/loyalty/faq.tsx'
import { Header as MobileHeader } from '@components/loyalty/mobile/Header.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'

export const NotLoggedIn = () => {
  const { isDesktop } = useResponsive()
  const Header = isDesktop ? DesktopHeader : MobileHeader
  return (
    <div className="py-6 max-w-[1200px] mx-auto">
      {isDesktop && <img src="/images/loyalty/bg-header-loyalty.webp" alt="" className="absolute inset-0 z-0" />}
      <Header avatarUrl="" isConnected={false} userAddress="--" invitationCode="" totalPoints={0}  />
      <LoginSection />
      {!isDesktop && (
        <div className="px-3">
          <LoyaltyFAQ />
        </div>
      )}
      <div className="h-16"></div>
    </div>
  )
}
