import { useMutation } from '@tanstack/react-query'
import { xOpenOrders } from '../trade/types'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'



type CancelAllParams = {
  orders: xOpenOrders[]
  allMeta: any[]
  agentWallet: any
}

export const useCancelOrdersMutation = () => {
  return useMutation({
    mutationFn: async ({ orders, allMeta, agentWallet }: CancelAllParams) => {
      if (!orders.length) throw new Error('无有效订单可取消')

      const cancels = orders.map(order => ({
        a: allMeta.findIndex(item => order.coin === item.name),
        o: order.oid,
      }))

      const action = { type: 'cancel', cancels }

      const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

      const response  = await hanleHyperliquidAction({
        agentPrivateKey: realAgentWallet.privateKey, 
        action: action, 
        dispatch: null, 
        showError: false,
        walletAddress: agentWallet.id,
        allMeta: allMeta
      });
 
    
      return response

    },
  })
}
