import { SmartMoneyTradeHistories } from '@/types/tokenDetail'
import { TransactionType } from '@/types/enums.ts'
import { TYPE_CHAIN } from '@/lib/blockchain'

export const LIMIT_PER_PAGE = 20

export const REFETCH_WALLETS_FOLLOWING = 'REFETCH_WALLETS_FOLLOWING'

export const mockTradeHistories: SmartMoneyTradeHistories[] = [
  {
    address: '0xA1B2C3D4E5F6G7H8I9J0',
    timestamp: 1715200000,
    type: TransactionType.Buy,
    amount: 150,
    usdAmount: 3000,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress1',
      name: 'AlphaToken',
      logo: 'https://example.com/logo1.png',
      totalSupply: 1000000,
    },
  },
  {
    address: '0xB1C2D3E4F5G6H7I8J9K0',
    timestamp: 1715200600,
    type: TransactionType.Sell,
    amount: 75,
    usdAmount: 1500,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress2',
      name: 'BetaToken',
      logo: 'https://example.com/logo2.png',
      totalSupply: 500000,
    },
  },
  {
    address: '0xC3D4E5F6G7H8I9J0A1B2',
    timestamp: 1715201200,
    type: TransactionType.AddLiquidity,
    amount: 200,
    usdAmount: 4000,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress3',
      name: 'GammaToken',
      logo: 'https://example.com/logo3.png',
      totalSupply: 750000,
    },
  },
  {
    address: '0xD4E5F6G7H8I9J0A1B2C3',
    timestamp: 1715201800,
    type: TransactionType.RemoveLiquidity,
    amount: 100,
    usdAmount: 1900,
    usdPrice: 19,
    token: {
      address: '0xTokenAddress1',
      name: 'AlphaToken',
      logo: 'https://example.com/logo1.png',
      totalSupply: 1000000,
    },
  },
  {
    address: '0xE5F6G7H8I9J0A1B2C3D4',
    timestamp: 1715202400,
    type: TransactionType.Buy,
    amount: 250,
    usdAmount: 5000,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress4',
      name: 'DeltaToken',
      logo: 'https://example.com/logo4.png',
      totalSupply: 2000000,
    },
  },
  {
    address: '0xF6G7H8I9J0A1B2C3D4E5',
    timestamp: 1715203000,
    type: TransactionType.Sell,
    amount: 60,
    usdAmount: 1200,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress2',
      name: 'BetaToken',
      logo: 'https://example.com/logo2.png',
      totalSupply: 500000,
    },
  },
  {
    address: '0xG7H8I9J0A1B2C3D4E5F6',
    timestamp: 1715203600,
    type: TransactionType.AddLiquidity,
    amount: 300,
    usdAmount: 6000,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress5',
      name: 'EpsilonToken',
      logo: 'https://example.com/logo5.png',
      totalSupply: 900000,
    },
  },
  {
    address: '0xH8I9J0A1B2C3D4E5F6G7',
    timestamp: 1715204200,
    type: TransactionType.RemoveLiquidity,
    amount: 150,
    usdAmount: 2850,
    usdPrice: 19,
    token: {
      address: '0xTokenAddress3',
      name: 'GammaToken',
      logo: 'https://example.com/logo3.png',
      totalSupply: 750000,
    },
  },
  {
    address: '0xI9J0A1B2C3D4E5F6G7H8',
    timestamp: 1715204800,
    type: TransactionType.Buy,
    amount: 100,
    usdAmount: 2100,
    usdPrice: 21,
    token: {
      address: '0xTokenAddress4',
      name: 'DeltaToken',
      logo: 'https://example.com/logo4.png',
      totalSupply: 2000000,
    },
  },
  {
    address: '0xJ0A1B2C3D4E5F6G7H8I9',
    timestamp: 1715205400,
    type: TransactionType.Sell,
    amount: 80,
    usdAmount: 1600,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress5',
      name: 'EpsilonToken',
      logo: 'https://example.com/logo5.png',
      totalSupply: 900000,
    },
  },
  {
    address: '0x1234567890ABCDEF1234',
    timestamp: 1715206000,
    type: TransactionType.Buy,
    amount: 110,
    usdAmount: 2200,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress6',
      name: 'ZetaToken',
      logo: 'https://example.com/logo6.png',
      totalSupply: 3000000,
    },
  },
  {
    address: '0x234567890ABCDEF12345',
    timestamp: 1715206600,
    type: TransactionType.AddLiquidity,
    amount: 220,
    usdAmount: 4400,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress7',
      name: 'EtaToken',
      logo: 'https://example.com/logo7.png',
      totalSupply: 850000,
    },
  },
  {
    address: '0x34567890ABCDEF123456',
    timestamp: 1715207200,
    type: TransactionType.RemoveLiquidity,
    amount: 90,
    usdAmount: 1800,
    usdPrice: 20,
    token: {
      address: '0xTokenAddress1',
      name: 'AlphaToken',
      logo: 'https://example.com/logo1.png',
      totalSupply: 1000000,
    },
  },
  {
    address: '0x4567890ABCDEF1234567',
    timestamp: 1715207800,
    type: TransactionType.Sell,
    amount: 70,
    usdAmount: 1470,
    usdPrice: 21,
    token: {
      address: '0xTokenAddress6',
      name: 'ZetaToken',
      logo: 'https://example.com/logo6.png',
      totalSupply: 3000000,
    },
  },
  {
    address: '0x567890ABCDEF12345678',
    timestamp: 1715208400,
    type: TransactionType.Buy,
    amount: 130,
    usdAmount: 2730,
    usdPrice: 21,
    token: {
      address: '0xTokenAddress2',
      name: 'BetaToken',
      logo: 'https://example.com/logo2.png',
      totalSupply: 500000,
    },
  },
]

export const topTraders = {
  oneDayPnL: '39.12%',
  thirtyDayPnL: '16.23%',
  sevenDayAvgBuyCost: '$123.56K',
  walletName: 'GCiiiiTYK',
  walletType: 'new',
  createdTime: Date.now() - 1000 * 60 * 60,
  winRate: '+99.99%',
  marketCap: '+99999%',
  trend: 'up' as const,
  lineData: [10, 30, 50, 80, 60, 40, 30, 10, 1, 1],
  barData: [20, 40, 60, 70, 50, 45, 30, 10, 1, 1],
  token: 'TRUMP',
  defaultCollect: false,
  chainIcon: '/images/solana.webp',
  currencyIcon: '/images/tokenDetail/meme-icon.webp',
}

export const SMART_MONEY_ALLOWED_CHAINS: Array<TYPE_CHAIN> = [TYPE_CHAIN.SOLANA, TYPE_CHAIN.BSC, TYPE_CHAIN.MON]
export const SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS: Array<TYPE_CHAIN> = [TYPE_CHAIN.SOLANA]
export const SMART_MONEY_PUMP_SM_ALLOWED_CHAINS: Array<TYPE_CHAIN> = [TYPE_CHAIN.SOLANA]
export const SMART_MONEY_KOL_VC_ALLOWED_CHAINS: Array<TYPE_CHAIN> = [TYPE_CHAIN.SOLANA]
