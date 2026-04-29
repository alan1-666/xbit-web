import { ChainIds } from "@/types/enums";

export enum ACCOUNT_TYPE {
  MEME = "Meme",
  Perps = "Perps",
}


export const TOKEN_CONFIG = {
  USDC: {
    chainId: ChainIds.Hyperliquid,
    sourceChainId: '1337',
    isShow: false,
  },
  BNB: {
    chainId: ChainIds.Bsc,
    sourceChainId: '56',
    isShow: true,
  },
  SOL: {
    chainId: ChainIds.Solana,
    sourceChainId: '792703809',
    isShow: true,
  },
  MON: {
    chainId: ChainIds.Mon,
    sourceChainId: '143',
    isShow: true,
  },
}