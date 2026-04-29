import { xBuilderInfo } from '../types'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'


export const submitMarketCloseOrder = async ({
  coinIndex,
  isBuy,
  price,
  size,
  builder,
  agentWallet,
  allMeta
}: {
  coinIndex: number
  isBuy: boolean
  price: string
  size: string
  builder: xBuilderInfo,
  agentWallet: any
  allMeta: any
}) => {

  const order = {
    a: coinIndex,
    b: isBuy,
    p: price,
    s: size,
    r: true,
    t: { limit: { tif: 'FrontendMarket' } },
  }

  const action = {
    type: 'order',
    orders: [order],
    grouping: 'na',
    builder
  }


  const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)
  const response = await hanleHyperliquidAction({
    agentPrivateKey: realAgentWallet.privateKey, 
    action: action, 
    dispatch: null, 
    showError: false,
    walletAddress: agentWallet.id,
    allMeta
  });


  return response
}
