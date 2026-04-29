import {useEffect, useState} from 'react';
import {timeFromNow} from "@/utils/helpers.ts";
import {cn} from "@/lib/utils.ts";

type Props = {
  timestamp: number;
  className?: string;
}

const ItemDuration = ({timestamp, className}: Props) => {
  // ✅ Force re-render every 1 second
  const [_, setTick] = useState<number>(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("text-[14px] leading-[1] text-[#FFF]", className)}>
      {timeFromNow(timestamp)}
    </div>
  );
};

export default ItemDuration;
