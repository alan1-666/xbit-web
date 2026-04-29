import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

export const useIsXStockPath = () => {
  const location = useLocation()
  return useMemo(() => {
    return location.pathname.startsWith('/xstocks')
  }, [location.pathname])
}
