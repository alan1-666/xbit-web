import { Button } from '@components/ui/button.tsx'
import { SearchBox } from '@/modules/prediction/components/home/SearchBox.tsx'
import { Link, useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useMemo } from 'react'
import { EnableTradingButton } from '@/modules/prediction/components/home/EnableTradingButton.tsx'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { Portfolio } from '@/modules/prediction/components/home/Portfolio.tsx'
// Auto-enable trading disabled — user must manually enable via EnableTradingButton
// import { useAutoRetrieveProxyWallet } from '@/modules/prediction/hooks/useAutoRetrieveProxyWallet.ts'

export const Header = () => {
  const location = useLocation()
  const showPortfolio = useMemo(() => {
    const pathname = location.pathname
    return !pathname.startsWith('/prediction/portfolio')
  }, [location.pathname])

  const proxyWallet = useProxyWallet()
  // useAutoRetrieveProxyWallet()

  return (
    <div className="flex flex-col gap-4 px-4 py-4 border-b md:flex-row md:items-center md:justify-between md:py-5">
      {/* Left Section - Title and Search */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-white md:text-[calc(24rem/16)]">Predictions</h1>
        <h2 className="mb-2 text-sm md:text-base">Trade on real-world events and outcomes</h2>
        <div className="w-full md:w-96">
          <SearchBox />
        </div>
      </div>

      {/* Right Section - Portfolio Card (Hidden on mobile when on portfolio page) */}
      {showPortfolio && (
        <div className="bg-[#121212] px-3 py-3 rounded-lg md:px-4 md:py-2 md:rounded-[8px]">
          <Portfolio />

          {proxyWallet ? (
            <div className="w-full">
              <Link to={NAVIGATIONS.prediction.portfolio()}>
                <Button variant="gradient" className="w-full">
                  My profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full">
              <EnableTradingButton />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
