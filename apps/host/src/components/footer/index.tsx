import { BottomNav, BottomNavDex } from '@components/common/bottomNav'
import { PredictionBottomNav } from '@components/common/bottomNav/PredictionBottomNav'
import { XStockBottomNav } from '@components/common/bottomNav/XStockBottomNav.tsx'
import { useLocation } from 'react-router-dom'
import GlassLiquidNav from '@components/common/bottomNav/GlassLiquidNav.tsx'

// interface FooterProps {
//   isDex?: boolean
//   isXStock?: boolean
// }

// const Navigation = () => {
//   const location = useLocation()
//   const pathname = location.pathname
//   const mainApp = new URLSearchParams(location.search).get('main') || ''

//   if (pathname.startsWith('/prediction') || mainApp === 'prediction') {
//     return <PredictionBottomNav />
//   }

//   if (pathname.startsWith('/futures') || mainApp === 'futures') {
//     return <BottomNavDex />
//   }

//   if (pathname.startsWith('/xstock') || mainApp === 'xstock') {
//     return <XStockBottomNav />
//   }
//   return <BottomNav />
// }

const Footer = () => {
  return (
    <>
      {/* <footer className="fixed bottom-0 left-0 right-0 z-20 touch-none" id="APP_FOOTER">
        <Navigation />
      </footer>
      <div className="bg-(--bottom-nav-bg) w-full h-[100px] fixed -bottom-[100px]"></div> */}
      <GlassLiquidNav />
    </>
  )
}
export default Footer
