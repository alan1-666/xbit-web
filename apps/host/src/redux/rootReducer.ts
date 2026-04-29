import { browsingHistorySlice } from '@/redux/modules/browsingHistory.slice.ts'
import CachedAliasSlice from '@/redux/modules/cachedAlias.slice.ts'
import candleCacheReducer from '@/redux/modules/candleCacheSlice.slice.ts'
import followedHolderSlice from '@/redux/modules/followedHolder.slice.ts'
import { futuresBrowsingHistorySlice } from '@/redux/modules/futuresBrowsingHistory.slice.ts'
import holdingSlice from '@/redux/modules/holding.slice.ts'
import { homeReducer } from '@/redux/modules/home.slice.ts'
import lastTransactionSubscriptionSlice from '@/redux/modules/lastTransactionSubscription.slice.ts'
import latestFollowedSlice from '@/redux/modules/latestFollowed.slice.ts'
import monitoringPcSlice from '@/redux/modules/monitoringPcSlice.ts'
import orderBookSubscriptionReducer from '@/redux/modules/orderBookSubscription.slice.ts'
import ordersSubscriptionSlice from '@/redux/modules/ordersSubscription.slice.ts'
import pendingOrdersSlice from '@/redux/modules/pendingOrders.slice.ts'
import preferenceSlice from '@/redux/modules/preferences.slice.ts'
import routerSlice from '@/redux/modules/router.slice.ts'
import { tokenAvatarsSlice } from '@/redux/modules/tokenAvatars.slice.ts'
import tokenDetailSlice from '@/redux/modules/tokenDetail.slice.ts'
import tradeTabSlice from '@/redux/modules/tradeTab.slice.ts'
import transactionsHistorySlice from '@/redux/modules/transactionsHistory.slice.ts'
import exchangeSlice from '@/redux/modules/exchange.slice'
import txDetailSlice from '@/redux/modules/txDetail.slice.ts'
import { userSettingsSlice } from '@/redux/modules/userSettings.slice.ts'
import { xstocksReducer } from '@/redux/modules/xstocks.slice.ts'
import { combineReducers, Reducer } from '@reduxjs/toolkit'
import { PersistConfig, persistReducer } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import persistedSessionStorage from 'redux-persist/lib/storage/session'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import agentSlice from './modules/agent.slice'
import apiKeySlice from './modules/apiKey.slice'
import authSlice from './modules/auth.slice'
import chartSlice from './modules/chart.slice'
import errorMessagesSlice from './modules/errorMessages.slice'
import futuresCurrentSymbolSlice from './modules/futuresCurrentSymbol.slice'
import { futuresMetaSlice } from './modules/futuresMeta.slice'
import futuresTradeConfigsSlice from './modules/futuresTradeConfigs.slice'
import futuresTradePreferenceSlice from './modules/futuresTradePreferences.slice'
import futuresUserInfoSlice from './modules/futuresUserInfo.slice'
import maintenanceReducer from './modules/maintenance.slice'
import networkFeeSlice from './modules/networkFee.slice'
import newAuthSlice from './modules/newAuth.slice'
import newWalletSlice from './modules/newWallet.slice'
import orderSlice from './modules/order.slice'
import orderContractReducer from './modules/orderContract.slice'
import priceSlice from './modules/price.slice'
import quickBuyReducer from './modules/quickBuy.slice'
import symbolListSliceReducer from './modules/symbolList.slide'
import tokenSlice from './modules/tokens.slice'
import tradeConfigsSlice from './modules/tradeConfigs.slice'
import tradeSettingsReducer from './modules/tradeSettings.slice'
import userPositionSliceReducer from './modules/userPosition.Slice'
import walletSlice from './modules/wallet.slice'
import { memeTokenInfoSlice } from '@/redux/modules/memeTokenInfo.slice.ts'
import { quoteSymbolsSlice } from '@/redux/modules/quoteSymbols.slice.ts'
import { tokensChainsSlice } from './modules/tokensChains.slice'
import swapFormSliceReducer from './modules/swap.slice'
import { assetsReducer } from '@/redux/modules/assets.slice.ts'
import { predictionReducer } from '@/modules/prediction/slices/prediction.slice.ts'
import resolvedMarketsReducer from '@/redux/modules/resolvedMarkets.slice.ts'
import predictionClaimedBalanceReducer from '@/redux/modules/predictionClaimedBalance.slice.ts'
import claimStatusesReducer from '@/redux/modules/claimStatuses.slice'

type StateFromReducer<R> = R extends Reducer<infer S, any> ? S : never

const persistReducerWithTypedState = <R extends Reducer<any, any>>(
  config: PersistConfig<StateFromReducer<R>>,
  reducer: R,
) => {
  return persistReducer<StateFromReducer<R>>(config, reducer)
}

const persistedUAuthReducer = persistReducerWithTypedState(
  { key: 'auth', storage, stateReconciler: autoMergeLevel2 },
  authSlice.reducer,
)
const persistedUNewAuthReducer = persistReducerWithTypedState(
  { key: 'newAuth', storage, stateReconciler: autoMergeLevel2 },
  newAuthSlice.reducer,
)
const persistedWalletReducer = persistReducerWithTypedState(
  { key: 'wallet', storage, stateReconciler: autoMergeLevel2 },
  walletSlice.reducer,
)
const persistedNewWalletReducer = persistReducerWithTypedState(
  { key: 'newWallet', storage, stateReconciler: autoMergeLevel2 },
  newWalletSlice.reducer,
)

const persistedTradeConfigsReducer = persistReducerWithTypedState(
  { key: 'tradeConfigSetting', storage, stateReconciler: autoMergeLevel2 },
  tradeConfigsSlice.reducer,
)

const persistedFuturesTradeConfigsReducer = persistReducerWithTypedState(
  { key: 'futuresTradeConfigSetting', storage, stateReconciler: autoMergeLevel2 },
  futuresTradeConfigsSlice.reducer,
)

const persistedFuturesTradePreferencesReducer = persistReducerWithTypedState(
  { key: 'futuresTradePreferencesSetting', storage, stateReconciler: autoMergeLevel2 },
  futuresTradePreferenceSlice.reducer,
)

const persistedFuturesUserInfoReducer = persistReducerWithTypedState(
  { key: 'futuresUserInfo', storage, stateReconciler: autoMergeLevel2 },
  futuresUserInfoSlice.reducer,
)

const persistedPreferenceReducer = persistReducerWithTypedState(
  { key: 'preference', storage, stateReconciler: autoMergeLevel2 },
  preferenceSlice.reducer,
)

const persistedTradeSettingsReducer = persistReducerWithTypedState(
  { key: 'tradeSettings_v3', storage, stateReconciler: autoMergeLevel2 },
  tradeSettingsReducer,
)

const persistedQuickBuyReducer = persistReducerWithTypedState(
  { key: 'quickBuy', storage, stateReconciler: autoMergeLevel2 },
  quickBuyReducer,
)

const persistedUserSettingsReducer = persistReducerWithTypedState(
  { key: 'userSettings', storage, stateReconciler: autoMergeLevel2 },
  userSettingsSlice.reducer,
)

const persistedBrowsingHistoryReducer = persistReducerWithTypedState(
  { key: 'browsingHistory', storage, stateReconciler: autoMergeLevel2 },
  browsingHistorySlice.reducer,
)

const persistedFuturesBrowsingHistoryReducer = persistReducerWithTypedState(
  { key: 'futuresBrowsingHistory', storage, stateReconciler: autoMergeLevel2 },
  futuresBrowsingHistorySlice.reducer,
)

const chartReducer = persistReducerWithTypedState(
  { key: 'chart', storage, stateReconciler: autoMergeLevel2 },
  chartSlice.reducer,
)

const traceTabReducer = persistReducerWithTypedState(
  { key: 'tradeTab', storage, stateReconciler: autoMergeLevel2 },
  tradeTabSlice,
)

const holdingReducer = persistReducerWithTypedState(
  { key: 'holding', storage, stateReconciler: autoMergeLevel2 },
  holdingSlice.reducer,
)

const persistedTokenReducer = persistReducerWithTypedState(
  { key: 'tokens', storage, stateReconciler: autoMergeLevel2 },
  tokenSlice.reducer,
)

const persistedNetworkFeeReducer = persistReducerWithTypedState(
  { key: 'networkFee', storage, stateReconciler: autoMergeLevel2 },
  networkFeeSlice,
)

const persistedHomeReducer = persistReducerWithTypedState(
  {
    key: 'home',
    storage,
    stateReconciler: autoMergeLevel2,
    version: 9,
    migrate: (state, currentVersion) => {
      if (!state) return Promise.resolve(undefined)
      if (state._persist.version !== currentVersion) {
        // migration needed
        return Promise.resolve(undefined)
      }
      return Promise.resolve(state)
    },
  },
  homeReducer,
)

const persistedApiKeyReducer = persistReducerWithTypedState(
  { key: 'apiKey', storage, stateReconciler: autoMergeLevel2 },
  apiKeySlice,
)

// const persistedXStockReducer = persistReducerWithTypedState(
//   {
//     key: 'xStock',
//     storage,
//     stateReconciler: autoMergeLevel2,
//     version: 2,
//     migrate: (state, currentVersion) => {
//       if (!state) return Promise.resolve(undefined)
//       if (state._persist.version !== currentVersion) {
//         // migration needed
//         return Promise.resolve(undefined)
//       }
//       return Promise.resolve(state)
//     },
//   },
//   xstocksReducer,
// )

const persistedAgentReducer = persistReducerWithTypedState(
  {
    key: 'agent',
    storage,
    stateReconciler: autoMergeLevel2,
  },
  agentSlice,
)
const persistedMonitoringPCReducer = persistReducerWithTypedState(
  {
    key: 'monitoringPC',
    storage,
    stateReconciler: autoMergeLevel2,
  },
  monitoringPcSlice,
)

const persistedNativeTokenPriceReducer = persistReducerWithTypedState(
  { key: 'price', storage, stateReconciler: autoMergeLevel2 },
  priceSlice.reducer,
)

const persistedCachedAliasReducer = persistReducerWithTypedState(
  {
    key: 'cachedAlias',
    storage,
    stateReconciler: autoMergeLevel2,
  },
  CachedAliasSlice,
)

const persistedTokensChainsReducer = persistReducerWithTypedState(
  { key: 'tokensChains', storage, stateReconciler: autoMergeLevel2 },
  tokensChainsSlice.reducer,
)

const persistedAssetsReducer = persistReducerWithTypedState(
  { key: 'assets', storage: persistedSessionStorage, stateReconciler: autoMergeLevel2 },
  assetsReducer,
)

const persistedPredictionReducer = persistReducerWithTypedState(
  {
    key: 'prediction',
    storage,
    stateReconciler: autoMergeLevel2,
  },
  predictionReducer,
)

const rootReducer = combineReducers({
  auth: persistedUAuthReducer,
  assets: persistedAssetsReducer,
  newAuth: persistedUNewAuthReducer,
  wallet: persistedWalletReducer,
  newWallet: persistedNewWalletReducer,
  tradeConfigs: persistedTradeConfigsReducer,
  futuresTradeConfigs: persistedFuturesTradeConfigsReducer,
  futuresTradePreferences: persistedFuturesTradePreferencesReducer,
  futuresCurrentSymbol: futuresCurrentSymbolSlice.reducer,
  futuresUserInfo: persistedFuturesUserInfoReducer,
  futuresMeta: futuresMetaSlice.reducer,
  price: persistedNativeTokenPriceReducer,
  order: orderSlice.reducer,
  holding: holdingReducer,
  preference: persistedPreferenceReducer,
  tokenDetail: tokenDetailSlice,
  latestFollowed: latestFollowedSlice,
  followedHolder: followedHolderSlice,
  home: persistedHomeReducer,
  ordersSubscription: ordersSubscriptionSlice.reducer,
  lastTransactionSubscription: lastTransactionSubscriptionSlice.reducer,
  orderContract: orderContractReducer,
  quickBuy: persistedQuickBuyReducer,
  tradeSettings: persistedTradeSettingsReducer,
  browsingHistory: persistedBrowsingHistoryReducer,
  futuresBrowsingHistory: persistedFuturesBrowsingHistoryReducer,
  userSettings: persistedUserSettingsReducer,
  chart: chartReducer,
  tradeTab: traceTabReducer,
  candleCache: candleCacheReducer,
  symbolListSlice: symbolListSliceReducer,
  networkFee: persistedNetworkFeeReducer,
  userPosition: userPositionSliceReducer,
  tokens: persistedTokenReducer,
  apiKey: persistedApiKeyReducer,
  orderBookSubscription: orderBookSubscriptionReducer,
  xstocks: xstocksReducer,
  pendingOrders: pendingOrdersSlice.reducer,
  router: routerSlice.reducer,
  transactionsHistory: transactionsHistorySlice.reducer,
  errorMessages: errorMessagesSlice,
  agent: persistedAgentReducer,
  monitoringPc: persistedMonitoringPCReducer,
  maintenance: maintenanceReducer,
  cachedAlias: persistedCachedAliasReducer,
  tokenAvatars: tokenAvatarsSlice.reducer,
  txDetail: txDetailSlice.reducer,
  memeTokenInfo: memeTokenInfoSlice.reducer,
  tokenSymbols: quoteSymbolsSlice.reducer,
  exchange: exchangeSlice.reducer,
  tokensChains: persistedTokensChainsReducer,
  swapInfo: swapFormSliceReducer,
  prediction: persistedPredictionReducer,
  resolvedMarkets: resolvedMarketsReducer,
  predictionClaimedBalance: predictionClaimedBalanceReducer,
  claimStatuses: claimStatusesReducer,
})

export default rootReducer
