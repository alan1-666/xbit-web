import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { preferenceActions, PreferenceState } from '@/redux/modules/preferences.slice.ts'

export const usePreference = () => {
  const preference: PreferenceState = useAppSelector((state: RootState) => state.preference)
  const dispatch = useAppDispatch()
  const updatePreference = (newPreference: Partial<PreferenceState>) => {
    dispatch(preferenceActions.updatePreference(newPreference))
  }
  return {
    preference,
    updatePreference,
  }
}
