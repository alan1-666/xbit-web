export const TOPICS = {
  migratedProgress: (chainId: number) => `public/migrated_progress/${chainId}`,
  tokenInfo: (chainId: number, address: string) => `public/meme/token_info/${chainId}/${address}`,
  prediction: {
    eventNew: () => `public/event/new`,
    eventUpdate: () => `public/event/update`,
    marketNew: () => `public/market/new`,
    marketUpdated: (id: string) => `public/market/${id}/update`,
    marketPriceUpdated: (marketId: string) => `public/market/${marketId}/price`,
    marketOrderBook: (marketId: string) => `public/market/${marketId}/orderbook`,
    marketOrderBookUpdate: (marketId: string) => `public/market/${marketId}/orderbook/update`,
    marketTrade: (marketId: string) => `public/market/${marketId}/trade`,
    marketResolved: (marketId: string) => `public/market/${marketId}/resolved`,
    cryptoPrice: (source: string, symbol: string) => `public/${source}/price/${symbol}`,
    eventVolume: (eventSlug: string) => `public/crypto-event/${eventSlug}/volume`,
    comments: (entityType: 'event' | 'series' | 'market', entityId: string) =>
      `public/comment/${entityType}/${entityId}`,
    isMarketUpdate: (topic: string) =>
      topic.startsWith(`public/market/`) && topic.endsWith(`/update`) && !topic.includes(`/orderbook`),
    isMarketPriceUpdated: (topic: string) => topic.startsWith(`public/market/`) && topic.endsWith(`/price`),
    isMarketOrderBook: (topic: string) =>
      topic.startsWith(`public/market/`) && topic.endsWith(`/orderbook`) && !topic.includes(`/update`),
    isMarketOrderBookUpdate: (topic: string) =>
      topic.startsWith(`public/market/`) && topic.endsWith(`/orderbook/update`),
    isMarketTrade: (topic: string) => topic.startsWith(`public/market/`) && topic.endsWith(`/trade`),
    isMarketResolved: (topic: string) => topic.startsWith(`public/market/`) && topic.endsWith(`/resolved`),
    isEventVolume: (topic: string) => topic.startsWith(`public/crypto-event/`) && topic.endsWith(`/volume`),
  },
}
