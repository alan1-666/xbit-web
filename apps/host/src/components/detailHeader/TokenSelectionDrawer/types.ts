/**
 * Token interface used within the TokenSelectionDrawer components
 */
export interface Token {
  id: string
  name: string
  symbol: string
  address: string
  logo: string
  chainLogo: string
  marketCap: string
  priceChange: number
  launchpad?: string
  isFavorite?: boolean
}

/**
 * Chain option interface for the chain selector
 */
export interface ChainOption {
  id: string
  name: string
  image: string
  chainId: number
  value: string
}
