import { WsUserActiveAssetData } from "@/types/hyperliquid";
import { useMemo, useState, useEffect } from "react";
import { useWebSocketChannel } from "./useWebSocketChannel";
import { getActiveAssetData } from "@/api/hyperliquid";
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'


export function useActiveAssetData(symbol: string, address: string, channelName?: string) {

  const [activeAssetData, setActiveAssetData] = useState<WsUserActiveAssetData>()
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const channel = channelName || 'activeAssetData';
  const isLogin = useCheckLoginOnArb()
  

  const params = useMemo(() => {
    if (!address || !symbol || !isLogin) return null;
    return {
      coin: symbol,
      type: 'activeAssetData',
      user: address
    };
  }, [symbol, address, isLogin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const activeAsset: WsUserActiveAssetData = await getActiveAssetData(address, symbol);
      if (activeAsset) {
        setActiveAssetData(activeAsset)
      }

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address || !symbol || isLogin) {
      fetchData()
    }
    if (!isLogin) {
      setActiveAssetData((prev:any) => {
       return {
         ...prev,
        availableToTrade: [0, 0]
       }
      })
    }
  }, [symbol, address, isLogin]);

  useWebSocketChannel(channel, params, (data) => {
    if (!isLogin) return null
    setActiveAssetData(data)
  })

  return {
    activeAssetData,
    loading, 
    error
  }
}
