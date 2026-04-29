import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { predictionActions, predictionSelectors } from '@/modules/prediction/slices/prediction.slice.ts'
import { useAppSelector } from '@/redux/store'

export const useFavoriteEventIds = () => {
  return useAppSelector(predictionSelectors.selectFavoriteEventIds)
}

export const useAddFavoriteEvent = () => {
  const dispatch = useDispatch()
  return useCallback((eventId: string) => {
    dispatch(predictionActions.addFavoriteEvent(eventId))
  }, [])
}

export const useRemoveFavoriteEvent = () => {
  const dispatch = useDispatch()
  return useCallback((eventId: string) => {
    dispatch(predictionActions.removeFavoriteEvent(eventId))
  }, [])
}

export const useModifyFavoriteEvents = () => {
  const addFavoriteEvent = useAddFavoriteEvent()
  const removeFavoriteEvent = useRemoveFavoriteEvent()
  return {
    addFavoriteEvent,
    removeFavoriteEvent,
  }
}

export const useIsEventFavorite = (eventId: string) => {
  const favoriteEventIds = useFavoriteEventIds()
  return favoriteEventIds.includes(eventId)
}
