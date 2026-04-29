import { useCountdown } from '@/hooks/useCountdown'
import React, { useEffect } from 'react'

interface FeeCountdownProps {
  targetTime: number;
  onRefresh?: () => void

}

const FeeCountdown = React.memo(({ targetTime, onRefresh }: FeeCountdownProps) => {
  const { format, remaining } = useCountdown(targetTime);

  useEffect(() => {
    if (remaining === 0 && onRefresh) onRefresh()
  }, [remaining]) 

  return <span>{format}</span>;
});

export default FeeCountdown;
