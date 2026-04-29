// redux/modules/maintenance.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MaintenanceState {
  isDismissed: boolean
  shouldShowMaintenanceNotification: boolean
}

export const initialState: MaintenanceState = {
  isDismissed: false,
  shouldShowMaintenanceNotification: false,
}

export const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    dismissNotification: (state) => {
      state.isDismissed = true
    },
    setShouldShowMaintenanceNotification: (state, action: PayloadAction<boolean>) => {
      state.shouldShowMaintenanceNotification = action.payload
    },
  },
})

export const { dismissNotification, setShouldShowMaintenanceNotification } = maintenanceSlice.actions

export const selectIsDismissed = (state: { maintenance: MaintenanceState }) => state.maintenance.isDismissed
export const selectShouldShowMaintenanceNotification = (state: { maintenance: MaintenanceState }) =>
  state.maintenance.shouldShowMaintenanceNotification

export default maintenanceSlice.reducer
