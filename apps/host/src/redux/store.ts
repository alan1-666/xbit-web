import rootReducer from '@/redux/rootReducer'
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import {
  PersistConfig,
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import middlewares from './middlewares'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'

const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage: storage,
  whitelist: [
    'auth',
    'wallet',
    'tradeConfigSetting',
    'futuresTradeConfigSetting',
    'futuresTradePreferencesSetting',
    'tokens',
    'networkFee',
    'orderContract', // 添加订单状态持久化，防止Safari内存管理导致状态重置
    'apiKey',
  ],
  stateReconciler: autoMergeLevel2,
  migrate: (state) => Promise.resolve(state),
}

const persistedReducer: typeof rootReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(middlewares),
})
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
