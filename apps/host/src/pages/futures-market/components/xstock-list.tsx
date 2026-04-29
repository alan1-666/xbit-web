import { useMemo } from 'react'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext'
import { useXStockTokens } from '@/components/xstocks/hooks/useXStockTokens'
import { ChainIds } from '@/types/enums'
import XStockPopularTab from './xstock-popular-tab'

const XStockList = () => {
  const { tokens, isLoading } = useXStockTokens({ chainId: ChainIds.Solana })

  const contextValue = useMemo(
    () => ({
      tokens,
      isLoading,
    }),
    [tokens, isLoading],
  )

  return (
    <div className="flex flex-col h-full -mx-[14px]">
      <StockTokensContext.Provider value={contextValue}>
        <XStockPopularTab />
      </StockTokensContext.Provider>
    </div>
  )
}

export default XStockList
