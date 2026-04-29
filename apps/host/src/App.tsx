import { ChartProvider } from '@/components/chart/ChartProvider'
import { ToastProvider } from '@/components/toast/ToastContext'
import { AddressGroupsProvider } from '@/providers/AddressGroupsProvider'
import { PageWrapperProps, useAuth, wrapper } from '@/components/wrapper'
import i18n from '@/i18n'
import { registerServiceWorker } from '@/lib/firebase.ts'
import AssetsTokenDetailPage from '@/pages/assets/token'
import AssetsWalletDetailPage from '@/pages/assets/WalletDetailPage'
import CopyTradeWalletSettings from '@/pages/copy-trading/wallet-settings'
import PositionPage from '@/pages/position'
import PriceChart from '@/pages/webview/PriceChart'
import { ApolloProvider } from '@apollo/client'
import Seo from '@components/common/Seo.tsx'
import { CheckTurnKeySession, UserSettingsFetcher } from '@components/common/UserSettingsFetcher.tsx'
import CategoryDetailPage from '@pages/category-detail'
import CopyTradingDetailsPage from '@pages/copy-trading/details'
import DebugPage from '@pages/debug'
import FormatRulesPage from '@pages/debug/format-rules'
import DepositPage from '@pages/deposit'
import FuturesDetailPage from '@pages/futures'
import MemeDemoPage from '@pages/meme-demo'
import { NotificationsPage } from '@pages/notifications'
import RangoPage from '@pages/rango'
import { AboutUsPage } from '@pages/settings/about-us.tsx'
import { BrowsingHistoryPage } from '@pages/settings/browsing-history.tsx'
import { ColorsSettingsPage } from '@pages/settings/colors-settings.tsx'
import { GoogleAuthenticatorPage } from '@pages/settings/google-authenticator.tsx'
import { LanguagesSettingsPage } from '@pages/settings/languages.tsx'
import { NotificationsSettingsPage } from '@pages/settings/notifications-settings.tsx'
import { ResetGoogleAuthenticatorPage } from '@pages/settings/reset-google-authenticator.tsx'
import { UserFeedbackViewProgressPage } from '@pages/settings/user-feedback-view-progress.tsx'
import { UserFeedbackPage } from '@pages/settings/user-feedback.tsx'
import SmartMoneyPage from '@pages/smart-money'
import { TransferPage } from '@pages/transfer'
import { AssetChartWebView } from '@pages/webview/AssetChartWebView.tsx'
import PrivacyPolicyWebView from '@pages/webview/PrivacyPolicyWebView'
import TermsOfUseWebView from '@pages/webview/TermsOfUseWebView'
import { darkTheme, lightTheme, Locale, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { TurnkeyProvider, TurnkeyThemeProvider } from '@turnkey/sdk-react'
import { EthereumWallet } from '@turnkey/wallet-stamper'
import { I18nextProvider } from 'react-i18next'
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import SolanaProviders from './components/solana-providers'
import { ThemeProvider } from './components/theme-provider'
import { APP_PATH } from './lib/constant'
import { gqlClient } from './lib/gql/apollo-client'
import { configWagmi } from './lib/wagmiClient'
import CrossChainBridgePage from './pages/cross-chain-bridge'
import CrossChainBridgeStatusPage from './pages/cross-chain-bridge/exchange-status'
import Deposit from './pages/crypto-deposit'
import CryptoTransferStatus from './pages/crypto-deposit/crypto-transfer-status'
import FuturesDiscover from './pages/futures-discover'
import FuturesMarket from './pages/futures-market'
import EditFavoritesPage from './pages/edit-favorites'
import GoogleAuth from './pages/google-auth'
import GooglePinCode from './pages/google-auth/GooglePinCode'
import GoogleWhiteList from './pages/google-auth/GoogleWhiteList'
import HyDemo from './pages/hy-demo'
import RangoDemo from './pages/rango-demo'
import TelegramCallbackHandler from './pages/telegram'
import { default as TermsOfUseAndPrivacyPolicyPage, default as TermsOfUsePage } from './pages/terms-of-use'
import VaultDetail from './pages/vault-detail'
import Withdrawal from './pages/withdrawal'
// import MnemonicPromptPage from './pages/wallet-backup/mnemonic-prompt'
// import MnemonicBackupChecklistPage from './pages/wallet-backup/mnemonic-backup-checklist'
import { analytics } from '@/lib/firebase'
import AgentRewards from '@/pages/agent/agent-rewards'
import NodeAgentDataOverview from '@/pages/agent/data-overview'
import InviteUser from '@/pages/invite-friends/invite-user'
import TradeRewards from '@/pages/trade-rewards'
import FuturesChart from '@/pages/webview/FuturesChart'
import FuturesTrendChart from '@/pages/webview/FuturesTrendChart'
import { useAppSelector } from '@/redux/store'
import { Toaster } from '@components/ui/sonner.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import AssetsPage from '@pages/assets/index.tsx'
import { FundingRecords } from '@pages/assets/overview/FundingRecords.tsx'
import SmartMoney from '@pages/smart-money-pc'
import SmartMoneyAddressDetail from '@/pages/smart-money-pc/AddressDetail'
import Supervisory from '@pages/supervisory'
import { GrowthBookProvider } from '@growthbook/growthbook-react'
import { growthbook } from './lib/growthbook'
import { DepositSharePage } from '@pages/deposit/share.tsx'
import MemeDetailPageWrapper from '@pages/detail/wrapper.tsx'
import { DownloadPage } from '@pages/download'
import MemePage from '@pages/meme'
import { MonitoringPageWrapper } from '@pages/monitoring/wrapper.tsx'
import { SystemSettingsPage } from '@pages/settings/system-settings.tsx'
import HoldingShare from '@pages/share/holding'
import React, { useEffect, useState } from 'react'
import NodeAgent from './pages/agent'
import RedpacketPage from './pages/redpacket'
import DevProjectPage from './pages/ai/dev-projects'
import InviteFriends from './pages/invite-friends'
import LoginPage from './pages/login'
import RequireLogin from './pages/login/RequireLogin'
import XStocks from './pages/xstocks'
import PerpsDeposit from '@pages/deposit/perps-deposit'
import PerpsWithdraw from '@/pages/withdrawal/perps-withdraw'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { _activeWallet } from './redux/modules/newWallet.slice'
import { LoyaltyPage } from '@pages/loyalty'
import AssetHistory from '@/pages/assets/asset-history'
import TradeHistory from '@/pages/assets/trade-history'
import PredictionPortfolio from '@/pages/assets/PredictionPortfolio'

import { MaintenanceGuard } from './components/maintenance/MaintenanceGuard'
import Rankings from './pages/loyalty/Rankings'
import FundingRatePage from './pages/funding-rate'
import BackupPrivateKey from '@components/assets/notice/BackupPrivateKey.tsx'
import { prefetchRedPacketFeatures } from '@/services/redpacket-prefetch.service'
import ApproveAgentDialog from '@/components/futuresDetails/trade/ButtonApproveAgent.tsx'
import { PredictionRoutes } from '@/modules/prediction/routes.tsx'
import { PredictionDepositPage } from '@/modules/prediction/pages/DepositPage.tsx'
import { PredictionWithdrawPage } from '@/modules/prediction/pages/WithdrawPage.tsx'
import { AutoEnableTrading } from '@/modules/prediction/components/shared/AutoEnableTrading.tsx'
import HomePage from '@/pages/home-2'
import { NotificationConfig } from '@components/common/notification/NotificationConfig.tsx'

const appleItunesAppId = import.meta.env.VITE_APPLE_ITUNES_APP_ID

type AppRoute = {
  path: string
  element: React.ReactNode
} & PageWrapperProps

const authPages: AppRoute[] = [
  {
    path: APP_PATH.MEME_TREND,
    element: <></>,
  },
]

const DefaultRoute = () => {
  const { isDesktop } = useResponsive()
  if (isDesktop) return <Navigate to={APP_PATH.FUTURES + '/BTC'} replace />
  return <HomePage />
}

const MarketRoute = () => {
  const { isDesktop } = useResponsive()
  if (isDesktop) {
    const path = window.location.pathname
    if (path.startsWith('/market/prediction')) {
      return <Navigate to={APP_PATH.PREDICTION.ROOT} replace />
    }
    if (path.startsWith('/market/meme')) {
      return <Navigate to={APP_PATH.MEME_DISCOVER} replace />
    }
    return <Navigate to={'/'} replace />
  }
  return <FuturesMarket />
}

const publicPages: AppRoute[] = [
  {
    path: '/',
    element: <DefaultRoute />,
    showNotifications: true,
    isScrollable: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.MEME_TELEGRAM_AUTH,
    element: <TelegramCallbackHandler />,
  },
  {
    path: APP_PATH.MEME_DISCOVER + '/*',
    element: <MemePage />,
    showNotifications: true,
    isScrollable: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.MEME_NEW_PAIRS_DEMO,
    element: <MemeDemoPage />,
  },
  {
    path: APP_PATH.MEME_TOKEN_DETAIL,
    element: <MemeDetailPageWrapper />,
    showHeader: false,
    isScrollable: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.X_STOCK_DETAIL,
    // element: <MemeDetailPage />,
    element: <MemeDetailPageWrapper />,
    showHeader: false,
    isScrollable: false,
    isXStock: true,
    fullscreen: true,
  },
  {
    path: '/hy',
    element: <HyDemo />,
  },
  {
    path: '/rango',
    element: <RangoPage />,
  },
  {
    path: '/debug',
    element: <DebugPage />,
  },
  {
    path: '/debug/format-rules',
    element: <FormatRulesPage />,
  },
  {
    path: APP_PATH.COPY_TRADING_WALLET_SETTINGS,
    element: <CopyTradeWalletSettings />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.COPY_TRADING_WALLET_SETTINGS + '/:id',
    element: <CopyTradeWalletSettings />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.WALLET_COPY + '/:address',
    element: <CopyTradingDetailsPage />,
    showHeader: false,
    isShowFooter: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.WEBVIEW_FUTURES_CHART,
    element: <FuturesChart />,
    isWebview: true,
  },
  {
    path: APP_PATH.WEBVIEW_FUTURES_TREND_CHART,
    element: <FuturesTrendChart />,
    isWebview: true,
  },
  {
    path: APP_PATH.WEBVIEW_PRICE_CHART,
    element: <PriceChart />,
    isWebview: true,
  },
  {
    path: APP_PATH.WEBVIEW_PRICE_CHART_2,
    element: <PriceChart />,
    isWebview: true,
  },
  {
    path: APP_PATH.WEBVIEW_ASSET_CHART,
    element: <AssetChartWebView />,
    isWebview: true,
  },
  {
    path: APP_PATH.WEBVIEW_PRIVACY_POLICY,
    element: <PrivacyPolicyWebView />,
    isWebview: true,
  },
  {
    path: APP_PATH.WEBVIEW_TERMS_OF_USE,
    element: <TermsOfUseWebView />,
    isWebview: true,
  },
  {
    path: APP_PATH.CATEGORY_DETAIL,
    element: <CategoryDetailPage />,
    showHeader: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_GOOGLE_AUTH,
    element: <GoogleAuthenticatorPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_RESET_GOOGLE_AUTH,
    element: <ResetGoogleAuthenticatorPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_LANGUAGE,
    element: <LanguagesSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_COLORS_SETTINGS,
    element: <ColorsSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_NOTIFICATION_SETTINGS,
    element: <NotificationsSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_SYSTEM_SETTINGS,
    element: <SystemSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_ABOUT_US,
    element: <AboutUsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_BROWSING_HISTORY,
    element: <BrowsingHistoryPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_USER_FEEDBACK,
    element: <UserFeedbackPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_USER_FEEDBACK_PROGRESS,
    element: <UserFeedbackViewProgressPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_GOOGLE_AUTH,
    element: <GoogleAuthenticatorPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_RESET_GOOGLE_AUTH,
    element: <ResetGoogleAuthenticatorPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_LANGUAGE,
    element: <LanguagesSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_COLORS_SETTINGS,
    element: <ColorsSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_NOTIFICATION_SETTINGS,
    element: <NotificationsSettingsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_ABOUT_US,
    element: <AboutUsPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.ASSETS + '/funding-records',
    element: <FundingRecords />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
  },
  {
    path: APP_PATH.ASSETS + '/*',
    element: <AssetsPage />,
    showHeader: false,
    isScrollable: false,
    fullscreen: true,
    footerWithNonePadding: true,
  },
  {
    path: APP_PATH.MEME_POSITION + '/:id',
    element: <PositionPage />,
    showHeader: false,
  },
  /* {
    path: APP_PATH.FUTURES_POSITION + '/:id',
    element: <FuturesPositionPage />,
    showHeader: false,
    isShowFooter: false,
  }, */
  {
    path: APP_PATH.ASSETS_TOKEN + '/:address',
    element: <AssetsTokenDetailPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_WALLET + '/:address',
    element: <AssetsWalletDetailPage />,
    showHeader: false,
    isShowFooter: false,
    fullscreen: true,
  },
  // {
  //   path: APP_PATH.TERMS_OF_USE,
  //   element: <TermsOfUseAndPrivacyPolicyPage />,
  //   showHeader: false,
  // },
  {
    path: APP_PATH.PRIVACY_POLICY,
    element: <TermsOfUseAndPrivacyPolicyPage />,
    showHeader: false,
    isShowFooter: false,
    fullscreenWithoutHeader: true,
  },
  {
    path: APP_PATH.TERMS_OF_USE,
    element: <TermsOfUsePage />,
    showHeader: false,
    isShowFooter: false,
    fullscreenWithoutHeader: true,
  },
  {
    path: APP_PATH.WITHDRAWAL,
    element: <Withdrawal />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.DEPOSIT,
    element: <DepositPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.PERPS_DEPOSIT,
    element: <PerpsDeposit />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.PERPS_WITHDRAW,
    element: <PerpsWithdraw />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.DEPOSIT_SHARE,
    element: <DepositSharePage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.TRANSFER,
    element: <TransferPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_NOTIFICATIONS,
    element: <NotificationsPage />,
    showHeader: false,
    isShowFooter: false,
    isScrollable: false,
  },
  {
    path: APP_PATH.MEME_NOTIFICATIONS,
    element: <NotificationsPage />,
    showHeader: false,
    isShowFooter: false,
    isScrollable: false,
  },
  {
    path: APP_PATH.MEME_CROSS_CHAIN_BRIDGE,
    element: <CrossChainBridgePage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_CROSS_CHAIN_BRIDGE_STATUS + '/:txId',
    element: <CrossChainBridgeStatusPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SMART_MONEY,
    element: <SmartMoneyPage />,
    isShowBackgroundImage: false,
    isShowAuthWarning: false,
    isScrollable: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.MEME_SETTINGS_CONNECT_GOOGLE_AUTH,
    element: <GoogleAuth />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_VERIFY_GOOGLE_AUTH,
    element: <GooglePinCode />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.MEME_SETTINGS_WHITELIST_GOOGLE_AUTH,
    element: <GoogleWhiteList />,
    showHeader: false,
    isShowFooter: false,
  },
  // {
  //   path: APP_PATH.MEME_WALLET_BACKUP_MNEMONIC_PROMPT,
  //   element: <MnemonicPromptPage />,
  //   showHeader: false,
  //   isShowFooter: false,
  // },
  // {
  //   path: APP_PATH.MEME_WALLET_BACKUP_MNEMONIC_CHECKLIST,
  //   element: <MnemonicBackupChecklistPage />,
  //   showHeader: false,
  //   isShowFooter: false,
  // },
  {
    path: APP_PATH.MEME_MONITORING,
    element: <MonitoringPageWrapper />,
    fullscreen: true,
  },
  // sharing
  {
    path: APP_PATH.SHARE_HOLDING,
    element: <HoldingShare />,
    isShowFooter: false,
  },
  // invite friends
  {
    path: APP_PATH.INVITE_FRIENDS,
    element: <InviteFriends />,
    isShowFooter: false,
    showHeader: false,
  },

  // crypto
  /**
   * TODO: 🛑 Pages that belong to dex and display bottom nav must add prop isDex = true 🛑
   */
  // {
  //   path: APP_PATH.FUTURES_DISCOVER,
  //   element: <FuturesDiscover />,
  //   isDex: true,
  //   showNotifications: true,
  //   footerWithNonePadding: true,
  //   isHorizontalFlip: true,
  //   bgColor: '#121214',
  // },
  {
    path: APP_PATH.FUTURES,
    element: <Navigate to={getFuturesTradePath()} replace />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
  },
  {
    path: APP_PATH.FUTURES + '/:baseCoin',
    element: <FuturesDetailPage />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
  },

  /* {
    path: APP_PATH.TRANSACTION_HISTORY,
    element: <CryptoTransactionHistory />,
    showHeader: false,
    isHorizontalFlip: true,
    isShowFooter: false,
    isDex: true,
  }, */
  /* {
    path: APP_PATH.ALL_ALERTS,
    element: <AllAlerts />,
    showHeader: false,
    isDex: true,
    isShowFooter: false,
    isShowBackgroundImage: false,
  }, */
  {
    path: APP_PATH.MARKET + '/*',
    element: <MarketRoute />,
    showHeader: false,
    isHorizontalFlip: true,
    isDex: true,
    isScrollable: false,
    footerWithNonePadding: true,
  },
  {
    path: APP_PATH.EDIT_FAVORITES,
    element: <EditFavoritesPage />,
    showHeader: false,
    isShowFooter: false,
    isDex: true,
  },
  {
    path: APP_PATH.PREDICTION_ASSETS,
    element: <AssetsPage />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
    isScrollable: false,
    footerWithNonePadding: true,
  },
  {
    path: APP_PATH.ASSET_HISTORY,
    element: <AssetHistory />,
    showHeader: false,
    isDex: true,
    isShowFooter: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.TRADE_HISTORY,
    element: <TradeHistory />,
    showHeader: false,
    isDex: true,
    isShowFooter: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.PREDICTION_PORTFOLIO,
    element: <PredictionPortfolio />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
    isShowFooter: false,
  },
  {
    path: '/vault-detail/:address',
    element: <VaultDetail />,
    showHeader: false,
    isShowFooter: false,
    isDex: true,
  },
  {
    path: APP_PATH.CRYPTO_DEPOSIT,
    element: <Deposit />,
    showHeader: false,
    isDex: true,
    isShowFooter: false,
  },
  {
    path: APP_PATH.CRYPTO_DEPOSIT_STATUS,
    element: <CryptoTransferStatus />,
    showHeader: false,
    isShowFooter: false,
    isDex: true,
  },
  {
    path: '/rango-demo',
    element: <RangoDemo />,
    showHeader: false,
    isDex: true,
  },
  /* {
    path: APP_PATH.FUTURES_TRANSFER,
    element: <FuturesTransfer />,
    isDex: true,
    showHeader: false,
  }, */
  {
    path: APP_PATH.MEME_DEV_PROJECTS,
    element: <DevProjectPage />,
    showHeader: false,
    isShowFooter: false,
  },
  {
    path: APP_PATH.XSTOCKS,
    element: <XStocks />,
    showHeader: true,
    isXStock: true,
    fullscreen: true,
  },
  {
    path: APP_PATH.REDPACKET,
    element: <RedpacketPage />,
    isShowFooter: false,
    showHeader: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.NODE_AGENT,
    element: <NodeAgent />,
    isShowFooter: false,
    showHeader: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.NODE_AGENT_DATA_OVERVIEW,
    element: <NodeAgentDataOverview />,
    isShowFooter: false,
    showHeader: false,
  },
  {
    path: APP_PATH.INVITE_FRIENDS_USER,
    element: <InviteUser />,
    isShowFooter: false,
    showHeader: false,
  },
  {
    path: APP_PATH.NODE_AGENT_REWARDS,
    element: <AgentRewards />,
    isShowFooter: false,
    showHeader: false,
  },
  {
    path: APP_PATH.TRADE_REWARDS,
    element: <TradeRewards />,
    isShowFooter: false,
    showHeader: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.LOYALTY,
    element: <LoyaltyPage />,
    isShowFooter: false,
    showHeader: false,
    fullscreen: true,
  },
  {
    path: APP_PATH.LOYALTY_RANKINGS,
    element: <Rankings />,
    // isShowFooter: false,
    showHeader: false,
    // fullscreen: true,
  },
  {
    path: APP_PATH.MAINTENANCE,
    element: <MaintenanceGuard />,
    fullscreenWithoutHeader: true,
    isShowFooter: false,
    showHeader: false,
  },

  // funding-rate
  {
    path: APP_PATH.FUNDING_RATE,
    element: <FundingRatePage />,
    showHeader: false,
    isShowFooter: false,
    fullscreen: true,
    isDex: true,
  },
  {
    path: APP_PATH.SMART_MONEY,
    element: <SmartMoney />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
    footerWithNonePadding: true,
  },
  {
    path: APP_PATH.SMART_MONEY_Address_Detail,
    element: (
      <AddressGroupsProvider>
        <SmartMoneyAddressDetail />
      </AddressGroupsProvider>
    ),
    showHeader: false,
    isDex: true,
    fullscreen: true,
    footerWithNonePadding: true,
    isShowFooter: false,
  },
  {
    path: APP_PATH.SUPERVISORY,
    element: <Supervisory />,
    showHeader: false,
    isDex: true,
    fullscreen: true,
    footerWithNonePadding: true,
    isShowFooter: false,
  },
  {
    path: APP_PATH.PREDICTION_DEPOSIT,
    element: <PredictionDepositPage />,
    isShowFooter: false,
    showHeader: false,
    isScrollable: false,
  },
  {
    path: APP_PATH.PREDICTION_WITHDRAW,
    element: <PredictionWithdrawPage />,
    isShowFooter: false,
    showHeader: false,
    isScrollable: false,
  },
  {
    path: APP_PATH.PREDICTION.ROOT + '/*',
    element: <PredictionRoutes />,
    fullscreen: true,
    isShowFooter: true,
    showHeader: true,
    isScrollable: false,
  },
]

// useEffect(() => {
//   // Lock orientation to portrait
//   if ('orientation' in screen && 'lock' in screen.orientation) {
//     screen.orientation.lock('portrait-primary').catch((err) => {
//       console.log('Orientation lock failed:', err)
//     })
//   }

//   // Prevent zoom on orientation change
//   const viewport = document.querySelector('meta[name=viewport]')
//   if (viewport) {
//     viewport.setAttribute(
//       'content',
//       'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, orientation=portrait',
//     )
//   }
// }, [])

function RouteHandler() {
  const location = useLocation()
  const [inviteCode, setInviteCode] = useState<string>('')

  useEffect(() => {
    const fullpath = location.pathname + location.search
    // handle futures invitation path
    const match = fullpath.match(/\/@(\w+)$/)
    if (match) {
      const inviteCode = match[1]
      setInviteCode(inviteCode)
      // ls.set('futures_inviteCode', inviteCode)
    }
  }, [location])

  // const pathname = location.pathname
  // // handle futures invitation path
  // const match = pathname.match(/^\/@([^/]+)$/)
  // if (match) {
  //   const inviteCode = match[1]
  //   return wrapper({
  //     children: <MemeDiscoverPage inviteCode={inviteCode} />,
  //     isDex: false,
  //     showNotifications: true,
  //     isScrollable: false,
  //   })
  // }

  return <Navigate to={`/futures/BTC`} replace />
}

function App() {
  const { isDesktop } = useResponsive()

  const config = {
    apiBaseUrl: 'https://api.turnkey.com',
    defaultOrganizationId: '58b93d40-2540-4f00-9824-8eca60069376',
    iframeUrl: 'https://auth.turnkey.com',
    // serverSignUrl: 'http://localhost:3002/',
    // wallet: new EthereumWallet(),
    wallet: new EthereumWallet(),
  }
  const headerTab = useAppSelector((state) => state.router.headerTab)
  const isDex = headerTab === 'crypto'

  useEffect(() => {
    const lang = i18n.language
    document.body.classList.remove('font-noto', 'font-noto-sc', 'font-noto-tc')
    if (lang === 'zh') {
      document.body.classList.add('font-noto-sc')
    } else if (lang === 'hk') {
      document.body.classList.add('font-noto-tc')
    } else {
      document.body.classList.add('font-noto')
    }
  }, [i18n.language])

  useEffect(() => {
    console.log('Firebase Analytics ready:', analytics)
  }, [])

  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.init({ streaming: false })

    // 预加载红包配置
    prefetchRedPacketFeatures()
  }, [])

  return (
    <>
      <GrowthBookProvider growthbook={growthbook}>
        <Seo
          url={window?.location.href || ''}
          image={`${window?.location.origin || ''}/images/og-image-large2.png`}
          imgHeight={630}
          imgWidth={1200}
        >
          <meta name="apple-itunes-app" content={`app-id=${appleItunesAppId}, app-argument=xbitapp://`} />
        </Seo>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TurnkeyThemeProvider>
            <TurnkeyProvider config={config}>
              <WagmiProvider config={configWagmi}>
                <SolanaProviders>
                  <ApolloProvider client={gqlClient}>
                    <QueryClientProvider client={queryClient}>
                      <I18nextProvider i18n={i18n}>
                        <ToastProvider>
                          <ChartProvider>
                            <RainbowKitProvider
                              theme={{
                                lightMode: lightTheme(),
                                darkMode: darkTheme(),
                              }}
                              locale={i18n?.language as Locale}
                            >
                              <Router>
                                <Routes>
                                  {authPages.map((route) => (
                                    <Route
                                      key={route.path}
                                      {...route}
                                      element={
                                        <RequireLogin>
                                          {wrapper({
                                            children: useAuth(route.element),
                                            showHeader: route?.showHeader,
                                            isWebview: route?.isWebview,
                                          })}
                                        </RequireLogin>
                                      }
                                    />
                                  ))}
                                  {publicPages.map((route) => (
                                    <Route
                                      key={route.path}
                                      {...route}
                                      element={
                                        <RequireLogin>
                                          {wrapper({
                                            children: route.element,
                                            showHeader: isDesktop ? false : route?.showHeader,
                                            isWebview: route?.isWebview,
                                            isHorizontalFlip: route?.isHorizontalFlip,
                                            isShowFooter: isDesktop ? false : route?.isShowFooter,
                                            isShowBackgroundImage: route?.isShowBackgroundImage,
                                            isDex: route?.isDex,
                                            showNotifications: route?.showNotifications,
                                            isScrollable: route?.isScrollable,
                                            footerWithNonePadding: route?.footerWithNonePadding,
                                            isXStock: route?.isXStock,
                                            fullscreen: route.fullscreen,
                                            fullscreenWithoutHeader: route.fullscreenWithoutHeader,
                                          })}
                                        </RequireLogin>
                                      }
                                    />
                                  ))}
                                  <Route
                                    path={APP_PATH.FUTURES_DISCOVER}
                                    element={
                                      <RequireLogin>
                                        {isDesktop ? (
                                          <Navigate to={APP_PATH.FUTURES} replace />
                                        ) : (
                                          wrapper({
                                            children: <FuturesDiscover />,
                                            isDex: true,
                                            showNotifications: true,
                                            footerWithNonePadding: true,
                                            isHorizontalFlip: true,
                                            bgColor: '#121214',
                                          })
                                        )}
                                      </RequireLogin>
                                    }
                                  />
                                  <Route path={APP_PATH.DOWNLOAD_APP} element={<DownloadPage />} />
                                  <Route path="/app" element={<DownloadPage />} />
                                  <Route path={APP_PATH.LOGIN} element={<LoginPage />} />
                                  <Route path="*" element={<RouteHandler />} />
                                </Routes>
                                {/*<FCMListener />*/}
                                <NotificationConfig />
                                <UserSettingsFetcher />
                                <CheckTurnKeySession />
                                <ApproveAgentDialog />
                                <AutoEnableTrading />
                                <Toaster />
                                <BackupPrivateKey />
                              </Router>
                            </RainbowKitProvider>
                          </ChartProvider>
                        </ToastProvider>
                      </I18nextProvider>
                    </QueryClientProvider>
                  </ApolloProvider>
                </SolanaProviders>
              </WagmiProvider>
            </TurnkeyProvider>
          </TurnkeyThemeProvider>
        </ThemeProvider>
      </GrowthBookProvider>
    </>
  )
}

registerServiceWorker()

export default App
