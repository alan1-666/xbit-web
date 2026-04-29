import { useEffect, useMemo, useState } from 'react'
import { TokenDetail } from '@/@generated/gql/graphql-future'
// import { useQuery } from '@apollo/client'
// import { useSubscription } from '@/lib/mqtt'
// import { getPortfolio } from '@/services/tokens.service'
// import { gqlClient } from '@/lib/gql/apollo-client'
// import { ServiceConfig } from '@/lib/gql/service-config'
// import { useSelector } from 'react-redux'
// import isEmpty from 'lodash-es/isEmpty'
// import useWatchWalletTokenBalance from '@/hooks/useWatchWalletTokenBalance'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import Decimal from 'decimal.js'
import { useNewHoldingData } from '@/components/myPositions/hook/useNewHoldingData'
import { useParams } from 'react-router-dom'
Decimal.set({ precision: 100 })

export const useGetHoldingToken = (tokenDetail: TokenDetail) => {
  const [totalToken, setTotalToken] = useState('0')
  // const activeWallet = useSelector(_activeWallet)
  // const userId = useSelector(_userInfo)?.userId

  // const { message: _orderMessage } = useSubscription(`users/${userId}/order_submit_failed`, {
  //   shouldSkip: !userId,
  // })

  // useEffect(() => {
  //   if (!_orderMessage || !userId) return
  //   try {
  //     const message = _orderMessage?.message
  //     const data = JSON.parse(message?.toString() || '')
  //     const orderFailed = data?.order
  //     console.warn('_orderMessage failed: ', orderFailed)
  //     if (orderFailed?.baseAddress === tokenDetail?.address) {
  //       setTotalToken((prev) => {
  //         const total = new Decimal(prev).add(orderFailed?.baseAmount)
  //         return total.toString()
  //       })
  //     }
  //   } catch (error) {
  //     console.warn('_orderMessage error: ', error)
  //   }
  // }, [_orderMessage, userId])

  // const { data: dataPortfolio } = useQuery(getPortfolio, {
  //   variables: {
  //     input: {
  //       chainId: activeWallet?.chainId,
  //       userAddress: activeWallet?.walletAddress,
  //       token: tokenDetail?.address,
  //       hideSmallBalance: false,
  //       hideSmallLiquidity: false,
  //     },
  //   },
  //   skip: !activeWallet?.isConnected || !ServiceConfig.token || !tokenDetail?.address,
  //   client: gqlClient,
  // })

  // const dataPortfolioToken: any = dataPortfolio?.getPortfolio?.data?.[0] ?? {}

  // useEffect(() => {
  //   if (!isEmpty(dataPortfolioToken)) {
  //     setTotalToken(dataPortfolioToken?.totalBaseAmount)
  //   }
  // }, [dataPortfolioToken])

  // const newHoldingToken = useWatchWalletTokenBalance({
  //   address: activeWallet?.walletAddress,
  //   token: tokenDetail?.address ?? '',
  //   chainId: activeWallet?.chainId,
  // })

  // useEffect(() => {
  //   if (newHoldingToken) {
  //     setTotalToken(newHoldingToken?.balance.toString())
  //   }
  // }, [newHoldingToken])
  const { address: tokenAddress } = useParams()
  const { currentData } = useNewHoldingData()
  const portfolioData = useMemo(
    () => currentData.find((item) => item.token === tokenAddress),
    [currentData, tokenAddress],
  )

  const totalBaseEstimate = portfolioData?.estimateOrderValue
    ? new Decimal(portfolioData?.totalBaseAmount).add(portfolioData?.estimateOrderValue).toString()
    : portfolioData?.totalBaseAmount
      ? new Decimal(portfolioData?.totalBaseAmount).toString()
      : '0'

  //Has handle logic MQTT current position data in Component NewDetailStatistic
  return { totalToken: totalBaseEstimate, setTotalToken: setTotalToken }
}
