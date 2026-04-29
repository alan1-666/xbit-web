import { ChainIds } from '@/types/enums.ts'

export interface ChainSymbolToId {
  [key: string]: number
}

const chainSymbolToId: ChainSymbolToId = {
  eth: ChainIds.Ethereum,
  bsc: ChainIds.Bsc,
  avax: ChainIds.Avalanche,
  ftm: ChainIds.FantomOpera,
  arb: ChainIds.Arbitrum,
  matic: ChainIds.Polygon,
  pls: ChainIds.Pulse,
  bitrock: ChainIds.Bitrock,
  shib: ChainIds.Shibarium,
  cybria: ChainIds.Cybria,
  base: ChainIds.Base,
  sol: ChainIds.Solana,
  btc: ChainIds.BTC,
  ton: ChainIds.TON,
}

export default chainSymbolToId