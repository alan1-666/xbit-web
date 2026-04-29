import { mainnet, bsc, arbitrum } from "viem/chains";

export const HOST = 'https://unstable-api.xbit.live/api/dex'

export const ITEMS_PER_PAGE = 20

export const ERC20ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export const USDC_ADDRESS_ARBITRUM = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
export const USDC_ADDRESS_HYPERLIQUID = '0x00000000000000000000000000000000'
export const HYPERLIQUID_BRIDGE_ADDRESS = '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7'
export const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
]

export const CHAIN_CONFIGS = {
  ETH: {
    chainId: '0x1',
    name: 'Ethereum',
    rpc: 'https://ethereum-rpc.publicnode.com',
    symbol: 'ETH',
    decimals: 18
  },
  BSC: {
    chainId: '0x38',
    name: 'BSC',
    rpc: 'https://bsc-dataseed.binance.org/',
    symbol: 'BNB',
    decimals: 18
  },
  ARBITRUM: {
    chainId: '0xa4b1',
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    decimals: 18
  },
  SOLANA: {
    chainId: '',
    name: 'Solana',
    rpc: '',
    symbol: 'SOL',
    decimals: 9
  },
  TRON: {
    chainId: '',
    name: 'Tron',
    rpc: '',
    symbol: 'TRX',
    decimals: 6
  }
}

export const PopularTokenList = {
  ethereum: {
    chain: mainnet,
    name: 'Ethereum',
    chainId: '0x1',
    native: 'ETH',
    tokens: [
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
      { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
      { symbol: 'BUSD', address: '0x4fabb145d64652a948d72533023f6e7a623c7c53', decimals: 18 },
      { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
    ],
  },
  bsc: {
    chain: bsc,
    name: 'BSC',
    chainId: '0x38',
    native: 'BNB',
    tokens: [
      { symbol: 'ETH', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', decimals: 18 },
      { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
      { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
      { symbol: 'AVAX', address: '0x1CE0c2827e2EF14d5c4F29A091d735a204794041', decimals: 18 },
    ],
  },
  arbitrum: {
    chain: arbitrum,
    name: 'Arbitrum',
    chainId: '0xa4b1',
    native: 'ETH',
    tokens: [
      { symbol: 'USDT', address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 },
      { symbol: 'USDC', address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', decimals: 6 },
      { symbol: 'WBTC', address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', decimals: 8 },
      { symbol: 'WETH', address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', decimals: 18 },
    ],
  },
  solana: {
    native: 'SOL',
    name: 'Solana',
    chainId: 'mainnet-beta',
    address: 'https://api.mainnet-beta.solana.com',
    tokens: [
      { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
      { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      { symbol: 'WSOL', mint: 'So11111111111111111111111111111111111111111', decimals: 9 },
      { symbol: 'BTC', mint: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', decimals: 6 },
    ],
  },
  tron: {
    native: 'TRX',
    name: 'Tron',
    chainId: '0x2b6653dc',
    fullHost: 'https://api.trongrid.io',
    tokens: [
      { symbol: 'USDT', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6 },
      { symbol: 'WTRX', address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', decimals: 6 },
      { symbol: 'BTC', address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', decimals: 6 },
      { symbol: 'USDC', address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', decimals: 6 },
    ],
  },
};

export const TRANSFER_CONFIG = {
  MIN_PRICE: 10, // should be 10, now is 0 for testing
  MIN_ARB_ETH: 0, // should be 0, now is 100 for testing
  DEFAULT_DELAY: 5000,
  USDC_ADDRESS: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // Arbitrum USDC address
}

export const HYPERLIQUID_DEPOSIT_MIN_AMOUNT: number = 10 // should be 10, now set to 0 for testing