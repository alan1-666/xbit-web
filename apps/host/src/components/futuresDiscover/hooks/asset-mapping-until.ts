export const ASSET_INDEX_MAP: Record<string, string> = {
  '@1': 'BTC', // Bitcoin
  '@2': 'ETH', // Ethereum
  '@3': 'SOL', // Solana
  '@4': 'XRP', // XRP
  '@5': 'DOGE', // Dogecoin
  '@6': 'ATOM', // Cosmos
  '@7': 'AVAX', // Avalanche
  '@8': 'MATIC', // Polygon
  '@9': 'DOT', // Polkadot
  '@10': 'LINK', // Chainlink
  '@11': 'UNI', // Uniswap
  '@12': 'FTM', // Fantom
  '@13': 'ALGO', // Algorand
  '@14': 'NEAR', // NEAR Protocol
  '@15': 'ICP', // Internet Computer
  '@16': 'ETC', // Ethereum Classic
  '@17': 'CRV', // Curve DAO
  '@18': 'GMX', // GMX
  '@19': 'ARB', // Arbitrum
  '@20': 'APE', // ApeCoin
  '@21': 'GRT', // The Graph
  '@22': 'SNX', // Synthetix
  '@23': 'AAVE', // Aave
  '@24': 'MKR', // Maker
  '@25': 'COMP', // Compound
  '@26': 'YFI', // Yearn.finance
  '@27': 'SUSHI', // SushiSwap
  '@28': 'BAL', // Balancer
  '@29': 'LDO', // Lido DAO
  '@30': 'STX', // Stacks
  '@31': 'FLOW', // Flow
  '@32': 'APT', // Aptos
  '@33': 'SUI', // Sui
  '@34': 'LUNA', // Terra Luna
  '@35': 'FIL', // Filecoin
  '@36': 'LTC', // Litecoin
  '@37': 'BCH', // Bitcoin Cash
  '@38': 'PEPE', // Pepe
  '@39': 'SHIB', // Shiba Inu
  '@40': 'ADA', // Cardano
  '@41': 'EOS', // EOS
  '@42': 'ENS', // Ethereum Name Service
  '@43': 'OP', // Optimism
  '@44': 'CAKE', // PancakeSwap
  '@45': 'IMX', // Immutable X
  '@46': 'BONK', // Bonk
  '@47': 'XLM', // Stellar Lumens
  '@48': 'BNB', // Binance Coin
  '@49': 'TRX', // TRON
  '@50': 'BIT', // BitDAO
  '@51': 'USDC', // USD Coin
  '@52': 'USDT', // Tether
  '@53': 'DAI', // Dai
}

export const calculatePriceChange = (oldPrice: number, newPrice: number): number => {
  if (oldPrice === 0) return 0
  return Number((((newPrice - oldPrice) / oldPrice) * 100).toFixed(2))
}

export const processMidsData = (midsData: Record<string, string>): Array<{ symbol: string; price: string }> => {
  return Object.entries(midsData)
    .map(([key, value]) => {
      const symbol = ASSET_INDEX_MAP[key] || key.replace('@', 'Asset ')
      return {
        symbol,
        price: value,
      }
    })
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
}

export const formatPrice = (priceString: string): string => {
  const price = parseFloat(priceString)

  // Handle different price ranges with appropriate formatting
  if (price < 0.001) {
    return `$${price.toFixed(8)}`
  } else if (price < 1) {
    return `$${price.toFixed(6)}`
  } else if (price < 10) {
    return `$${price.toFixed(4)}`
  } else if (price < 1000) {
    return `$${price.toFixed(2)}`
  } else {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}
