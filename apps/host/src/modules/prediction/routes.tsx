import { APP_PATH } from '@/lib/constant.ts'
import { TrendingPage } from '@/modules/prediction/pages/TrendingPage.tsx'
import { BreakingPage } from '@/modules/prediction/pages/BreakingPage.tsx'
import { NewPage } from '@/modules/prediction/pages/NewPage.tsx'
import { FavoritesPage } from '@/modules/prediction/pages/FavoritesPage.tsx'
import { EventsPage } from '@/modules/prediction/pages/EventsPage.tsx'
import { EventDetailsPage } from '@/modules/prediction/pages/EventDetailsPage.tsx'
import { SearchPage } from '@/modules/prediction/pages/SearchPage.tsx'
import { Route, Routes, Navigate } from 'react-router-dom'
import { HomePage } from '@/modules/prediction/pages/HomePage.tsx'
import { PortfolioPage } from '@/modules/prediction/pages/PortfolioPage.tsx'
import { UserProfilePage } from '@/modules/prediction/pages/UserProfilePage.tsx'
import Sports from './pages/sports/Sports.tsx'
import { SportsMainContent } from './components/sports/SportsMainContent'
import { SportEventPage } from '@/modules/prediction/pages/sports/SportEventPage.tsx'
import { Layout } from '@/modules/prediction/components/layouts/Layout.tsx'
import Earnings from './pages/Earnings'
import { CryptoPage } from '@/modules/prediction/pages/CryptoPage.tsx'
import FinancePage from './pages/FinancePage'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { ElectionsPage } from '@/modules/prediction/pages/ElectionsPage.tsx'
import { SportsFuturesPage } from '@/modules/prediction/pages/sports/SportsFuturesPage.tsx'
import { SportsLivePage } from '@/modules/prediction/pages/sports/SportsLivePage.tsx'
import { LeagueLayout } from '@/modules/prediction/components/sports/layout/LeagueLayout.tsx'
import { SportsLeagueGamesPage } from '@/modules/prediction/pages/sports/SportsLeagueGamesPage.tsx'
import { SportsLeaguePropsPage } from '@/modules/prediction/pages/sports/SportsLeaguePropsPage.tsx'

const SportsRoutes = () => {
  return (
    <Routes>
      <Route element={<Sports />}>
        <Route index element={<SportsMainContent />} />
        <Route path="/event/:eventId" element={<SportEventPage />} />
        <Route path="/futures/:slug" element={<SportsFuturesPage />} />
        <Route path="/live" element={<SportsLivePage />} />
        <Route element={<LeagueLayout />}>
          <Route path="/:slug" element={<SportsLeagueGamesPage />} />
          <Route path="/:slug/games" element={<SportsLeagueGamesPage />} />
          <Route path="/:slug/props" element={<SportsLeaguePropsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export const PredictionRoutes = () => {
  const { isDesktop } = useResponsive()
  const marketPredictionPath = APP_PATH.MARKET + '/prediction'
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<HomePage />}>
          <Route index={true} element={isDesktop ? <TrendingPage /> : <Navigate to={marketPredictionPath} replace />} />
          <Route
            path={APP_PATH.PREDICTION.BREAKING}
            element={isDesktop ? <BreakingPage /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={APP_PATH.PREDICTION.NEW}
            element={isDesktop ? <NewPage /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={APP_PATH.PREDICTION.FAVORITES}
            element={isDesktop ? <FavoritesPage /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path="/elections"
            element={isDesktop ? <ElectionsPage /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={APP_PATH.PREDICTION.EVENTS}
            element={isDesktop ? <EventsPage /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={`${APP_PATH.PREDICTION.SPORTS}/*`}
            element={isDesktop ? <SportsRoutes /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={APP_PATH.PREDICTION.EARNINGS}
            element={isDesktop ? <Earnings /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={APP_PATH.PREDICTION.CRYPTO}
            element={isDesktop ? <CryptoPage /> : <Navigate to={marketPredictionPath} replace />}
          />
          <Route
            path={APP_PATH.PREDICTION.FINANCE}
            element={isDesktop ? <FinancePage /> : <Navigate to={marketPredictionPath} replace />}
          />
        </Route>
        <Route path={APP_PATH.PREDICTION.SEARCH} element={<SearchPage />} />
        <Route path={APP_PATH.PREDICTION.PORTFOLIO} element={<PortfolioPage />} />
        <Route path={APP_PATH.PREDICTION.USER_PROFILE} element={<UserProfilePage />} />
        <Route path={APP_PATH.PREDICTION.SEARCH} element={<SearchPage />} />
        <Route path={APP_PATH.PREDICTION.EVENT_DETAILS} element={<EventDetailsPage />} />
      </Route>
    </Routes>
  )
}
