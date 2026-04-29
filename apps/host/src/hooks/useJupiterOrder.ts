import { fetchJupiterOrder, JupiterOrderResponse, PreOrder } from '@/services/onchain.service'
import { RefObject, useEffect, useRef } from 'react'

export function useJupiterOrder(order: PreOrder, ref: RefObject<JupiterOrderResponse | null>) {
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const start = async () => {
      const res = await fetchJupiterOrder(order)
      ref.current = res
    }

    setInterval(start, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [order])
}
