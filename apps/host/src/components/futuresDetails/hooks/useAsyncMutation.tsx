import { useMutation } from '@tanstack/react-query'
import { builderSelector } from '@/redux/modules/futuresUserInfo.slice'
import {  useAppSelector } from '@/redux/store'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import { EditMarginType } from '@/components/futuresDetails/trade/MyPositionList/EditMargin.tsx'



type Order = Record<string, any> 
type SubmitParams = { orders: Order[], agentWallet:any, allMeta: any}

export const useTpslMutation = () => {
  
  const builder = useAppSelector(builderSelector)
  
  return useMutation({
    mutationFn: async ({ orders, agentWallet, allMeta }: SubmitParams) => {
      const action = {
        type: 'order',
        orders,
        grouping: 'positionTpsl',
        builder
      }
      const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

      const response = await hanleHyperliquidAction({
        agentPrivateKey: realAgentWallet.privateKey,
        action: action,
        dispatch: null,
        showError: false,
        walletAddress: agentWallet.id,
        allMeta: allMeta
      });

      return response
    }
  })
}

type EditMarginParams = { coinIndex: number, agentWallet:any, allMeta: any, ntli: string, type: EditMarginType}
export const useEditMarginMutation = () => {
  
  return useMutation({
    mutationFn: async ({ coinIndex, agentWallet, allMeta, ntli, type }: EditMarginParams) => {
      const action = {
        type: 'updateIsolatedMargin',
        asset: coinIndex,
        isBuy: true,
        ntli: Number(ntli) * (type === 'add' ? 1000000 : -1000000),
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
  })
}
