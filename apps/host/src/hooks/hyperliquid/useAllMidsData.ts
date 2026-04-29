import { AllMids } from "@/types/hyperliquid";
import { useMemo, useState } from "react";
import { useWebSocketChannel } from "./useWebSocketChannel";

export function useAllMidsData() {
  const [allMids, setAllMids] = useState<AllMids>({});

  const channel = 'allMids'

  const params = useMemo(() => {
    return {
      type: channel
    }
  }, []);

  useWebSocketChannel(channel, params, (data) => {
    setAllMids(data)
  })

  return allMids
}