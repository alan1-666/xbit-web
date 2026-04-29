import { useAppDispatch, useAppSelector } from '@/redux/store'
import { futuresTradeConfigActions } from '@/redux/modules/futuresTradeConfigs.slice'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { agentWalletSelector, isAuthorizedSelector } from '@/redux/modules/futuresUserInfo.slice'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { mutationUserSymbolPreference } from '@/services/symbol.dex.service'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'

interface UpdateUserSymbolPreferenceParams {
  leverage: number
  isCross: boolean
  baseCoin: string
}

export function useUpdateUserSymbolPreference() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const allMeta = useAppSelector(selectAllPerpMeta)
  const isApproveAgent = useAppSelector(isAuthorizedSelector)
  const agentWallet = useAppSelector(agentWalletSelector)

  const updateUserSymbolPreference = async ({ leverage, isCross, baseCoin }: UpdateUserSymbolPreferenceParams) => {
    const coinIndex = allMeta.findIndex((item: any) => baseCoin === item.name)
    const orderAction = {
      type: 'updateLeverage',
      asset: coinIndex,
      isCross,
      leverage,
    }

    if (!isApproveAgent) {
      dispatch(
        futuresTradeConfigActions.updateFuturesTradeConfig({
          symbol: baseCoin,
          config: {
            positionMode: isCross ? 'cross' : 'isolated',
            leverage: leverage.toString(),
          },
        }),
      )
      return
    }

    if (!agentWallet) return
    const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

    const result = await hanleHyperliquidAction({
      agentPrivateKey: realAgentWallet.privateKey,
      action: orderAction,
      dispatch: dispatch,
      showError: true,
      walletAddress: agentWallet.id,
      allMeta,
    })
    if (result === 'fail') return

    const { data } = await symbolDexClient.mutate({
      mutation: mutationUserSymbolPreference,
      variables: {
        input: {
          symbol: baseCoin,
          isCross,
          leverage,
        },
      },
    })

    if (data?.updateUserSymbolPreference) {
      const { leverage, isCross, isFavorite } = data.updateUserSymbolPreference
      dispatch(
        futuresTradeConfigActions.updateFuturesTradeConfig({
          symbol: baseCoin,
          config: {
            positionMode: isCross ? 'cross' : 'isolated',
            leverage: leverage.toString(),
            isFavorite,
          },
        }),
      )
      showToast({
        type: 'success',
        title: t('futuresDetails.tips.modifySuccess'),
      })
    }
  }

  return { updateUserSymbolPreference }
}
