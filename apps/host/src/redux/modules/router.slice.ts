import { APP_PATH } from '@/lib/constant.ts'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type HeaderTab = 'crypto' | 'meme' | 'xstocks'

export interface RouterState {
  headerTab: HeaderTab
}

const getDefaultTab = () => {
  const pathname = window.location.pathname
  if (pathname === '/') return 'meme'
  if (pathname.startsWith(APP_PATH.FUTURES)) return 'crypto'
  if (pathname.startsWith(APP_PATH.XSTOCKS)) return 'xstocks'
  return 'meme'
}

const initialState: RouterState = {
  headerTab: getDefaultTab(),
}

const routerSlice = createSlice({
  name: 'router',
  initialState,
  reducers: {
    setHeaderTab(state, action: PayloadAction<HeaderTab>) {
      state.headerTab = action.payload
    },
  },
})

export const routerActions = routerSlice.actions
export default routerSlice
