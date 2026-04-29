import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

export const useIsDebug = () => {
  const [searchParams] = useSearchParams()
  return useMemo(() => {
    if (!searchParams) return false
    const debugParam = searchParams.get('debug')
    if (!debugParam) return false
    const debugValue = debugParam.toLowerCase()
    return debugValue === 'true' || debugValue === '1'
  }, [searchParams])
}
