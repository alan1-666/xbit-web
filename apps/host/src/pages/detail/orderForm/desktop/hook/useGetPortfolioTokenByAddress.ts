import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { getPortfolio } from '@/services/tokens.service'
import { gqlClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { PortfolioDTO } from '@/types/holding'
import useHoldingSubscription from '@/components/mqtt/HoldingSubscription'

export const useGetPortfolioTokenByAddress = (tokenAddress: string) => {
  const activeWallet = useSelector(_activeWallet)
  const [portfolioData, setPortfolioData] = useState<PortfolioDTO | null>(null)
  const { data: dataPortfolio } = useQuery(getPortfolio, {
    variables: {
      input: {
        chainId: activeWallet?.chainId,
        userAddress: activeWallet?.walletAddress,
        token: tokenAddress,
        hideSmallBalance: false,
        hideSmallLiquidity: false,
        limit: 1,
        page: 0,
      },
    },
    skip: !activeWallet?.isConnected || !ServiceConfig.token || !tokenAddress,
    client: gqlClient,
  })

  const dataPortfolioToken: any = dataPortfolio?.getPortfolio?.data?.[0] ?? null
  
  useEffect(() => {
    if (dataPortfolioToken) {
      setPortfolioData(dataPortfolioToken)
    }
  }, [dataPortfolioToken])

  const newPortfolio = useHoldingSubscription(activeWallet?.walletAddress, tokenAddress, activeWallet?.chainId)

  useEffect(() => {
    if (!newPortfolio || !newPortfolio?.token) return
    setPortfolioData((prev: any) => {
      return {
        ...prev,
        avgPriceUsd: newPortfolio?.avgPriceUsd ?? prev?.avgPriceUsd,
        realizedPnL: newPortfolio?.realizedPnL ?? prev?.realizedPnL,
        totalBuyQty: newPortfolio?.totalBuyQty ?? prev?.totalBuyQty,
        totalBuyUsd: newPortfolio?.totalBuyUsd ?? prev?.totalBuyUsd,
        totalSellUsd: newPortfolio?.totalSellUsd ?? prev?.totalSellUsd,
        totalSellQty: newPortfolio?.totalSellQty ?? prev?.totalSellQty,
      }
    })
  }, [newPortfolio])

  return { portfolioData: portfolioData }
}
