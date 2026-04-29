import { To, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

export const useNavigateWithLocation = () => {
  const routerNavigate = useNavigate()
  return useCallback(
    (to: To | number, state?: any) => {
      if (typeof to === 'number') {
        routerNavigate(to)
      } else {
        routerNavigate(to, {
          state: {
            ...state,
            from: window.location.pathname + window.location.search + window.location.hash,
          },
        })
      }
    },
    [routerNavigate],
  )
}
