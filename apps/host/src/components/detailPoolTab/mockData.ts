// Mock data for liquidity chart and pool information
export interface LiquidityDataPoint {
  time: string
  value: number
  hour: number
  timestamp: number
}

export interface PoolMockData {
  id: string
  token: string
  pair: string
  currentPrice: number
  initialPrice: number
  totalLiquidity: number
  volume24h: number
  liquidity: string
  logo: string
  chainId: number
}

// Generate realistic liquidity data with some volatility
export const generateLiquidityData = (hours: number = 8): LiquidityDataPoint[] => {
  const data: LiquidityDataPoint[] = []
  const startHour = 13
  const baseValue = 20000
  
  for (let i = 0; i < hours * 2; i++) { // Every 30 minutes
    const hour = startHour + (i * 0.5)
    const time = `${Math.floor(hour).toString().padStart(2, '0')}:${hour % 1 === 0 ? '00' : '30'}`
    
    // Add some realistic volatility
    const volatility = Math.sin(i * 0.5) * 10000 + Math.random() * 8000 - 4000
    const value = Math.max(5000, baseValue + volatility)
    
    data.push({
      time,
      value: Math.round(value),
      hour,
      timestamp: Date.now() + (i * 30 * 60 * 1000) // 30 minutes apart
    })
  }
  
  return data
}

// Static mock data that matches the image
export const staticLiquidityData: LiquidityDataPoint[] = [
  { time: '13:00', value: 14000, hour: 13, timestamp: 1633507200000 },
  { time: '13:30', value: 32000, hour: 13.5, timestamp: 1633509000000 },
  { time: '14:00', value: 8500, hour: 14, timestamp: 1633510800000 },
  { time: '14:30', value: 20000, hour: 14.5, timestamp: 1633512600000 },
  { time: '15:00', value: 14500, hour: 15, timestamp: 1633514400000 },
  { time: '15:30', value: 33000, hour: 15.5, timestamp: 1633516200000 },
  { time: '16:00', value: 20500, hour: 16, timestamp: 1633518000000 },
  { time: '16:30', value: 14000, hour: 16.5, timestamp: 1633519800000 },
  { time: '17:00', value: 20000, hour: 17, timestamp: 1633521600000 },
  { time: '17:30', value: 20500, hour: 17.5, timestamp: 1633523400000 },
  { time: '18:00', value: 20000, hour: 18, timestamp: 1633525200000 },
  { time: '18:30', value: 14500, hour: 18.5, timestamp: 1633527000000 },
  { time: '19:00', value: 20000, hour: 19, timestamp: 1633528800000 },
  { time: '19:30', value: 20500, hour: 19.5, timestamp: 1633530600000 },
  { time: '20:00', value: 20000, hour: 20, timestamp: 1633532400000 },
  { time: '20:30', value: 13500, hour: 20.5, timestamp: 1633534200000 },
  { time: '21:00', value: 14500, hour: 21, timestamp: 1633536000000 }
]

// Mock pool data
export const mockPoolData: PoolMockData[] = [
  {
    id: '1',
    token: 'TRUMP',
    pair: '20.04K / 432.32',
    currentPrice: 20.04,
    initialPrice: 432.32,
    totalLiquidity: 138.5,
    volume24h: 1250000,
    liquidity: '$18.5B',
    logo: '/images/tokenDetail/trump.png',
    chainId: 1
  },
  {
    id: '2',
    token: 'PEPE',
    pair: '15.2K / 285.1',
    currentPrice: 15.2,
    initialPrice: 285.1,
    totalLiquidity: 95.3,
    volume24h: 890000,
    liquidity: '$12.8B',
    logo: '/images/tokenDetail/pepe.png',
    chainId: 1
  },
  {
    id: '3',
    token: 'DOGE',
    pair: '32.1K / 180.5',
    currentPrice: 32.1,
    initialPrice: 180.5,
    totalLiquidity: 205.7,
    volume24h: 2100000,
    liquidity: '$24.2B',
    logo: '/images/tokenDetail/doge.png',
    chainId: 1
  },
  {
    id: '4',
    token: 'SHIB',
    pair: '8.7K / 125.9',
    currentPrice: 8.7,
    initialPrice: 125.9,
    totalLiquidity: 67.2,
    volume24h: 650000,
    liquidity: '$8.9B',
    logo: '/images/tokenDetail/shib.png',
    chainId: 1
  },
  {
    id: '5',
    token: 'FLOKI',
    pair: '12.4K / 95.3',
    currentPrice: 12.4,
    initialPrice: 95.3,
    totalLiquidity: 45.8,
    volume24h: 340000,
    liquidity: '$5.2B',
    logo: '/images/tokenDetail/floki.png',
    chainId: 1
  }
]

// Helper function to format currency values
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`
  }
  return `$${value.toFixed(2)}`
}

// Helper function to calculate percentage change
export const calculatePercentageChange = (current: number, initial: number): number => {
  return ((current - initial) / initial) * 100
}
