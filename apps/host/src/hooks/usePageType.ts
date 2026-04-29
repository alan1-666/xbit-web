import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export const usePageType = (): 'meme' | 'xstocks' => {
  const { pathname } = useLocation()
  return useMemo(() => {
    const isMeme = pathname.startsWith('/meme')
    if (isMeme) return 'meme'
    return 'xstocks'
  }, [pathname])
}
