import { useState } from 'react'

const useForceUpdate = () => {
  const [, setTick] = useState(0)
  return () => setTick(t => t + 1)
}

export default useForceUpdate
