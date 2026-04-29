
import FundingFeeDesc from './FundingFeeDesc'
import { ReactNode, useMemo, useState, useEffect, useCallback } from 'react'
import { RootState, useAppSelector, useAppDispatch } from '@/redux/store'
import { futuresTradeConfigActions, futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { baseCoinSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { PositionModeValue } from './types'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { mutationUserSymbolPreference } from '@/services/symbol.dex.service'
import { toast } from 'sonner'
import { selectAllPerpMeta, selectMaxLeverageBySymbol } from '@/redux/modules/futuresMeta.slice'
import { agentWalletSelector, isAuthorizedSelector } from '@/redux/modules/futuresUserInfo.slice'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import { useToast } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { useTranslation } from 'react-i18next'
import { PredictedFunding } from '@/types/hyperliquid.ts'
import { getPredictedFundings } from '@/api/hyperliquid'
import FeeCountdown from './FeeCountdown'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'











interface FundingRate {
	fundingRate: string
	nextFundingTimeStr: string | ReactNode,
}


interface HeaderSettingProps {
}
interface UpdateUserSymbolPreferenceParams {
	leverage: number,
	isCross: boolean
}

const HeaderSetting = () => {
	const { t } = useTranslation()
	const [isOpenFundingFeeDesc, setIsOpenFundingFeeDesc] = useState<boolean>(false)
  const { showToast } = useToast()
	const baseCoin = useAppSelector(baseCoinSelector)
	const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
	const maxLeverage = useAppSelector(selectMaxLeverageBySymbol(baseCoin)) || ''
	const [mode,setMode] = useState(tradeConfigs.positionMode)

	const { funding } = useAppSelector(symbolInfoSelector)


	const allMeta = useAppSelector(selectAllPerpMeta)

	const agentWallet = useAppSelector(agentWalletSelector)
	const isApproveAgent = useAppSelector(isAuthorizedSelector)

	const isLogin = useCheckLoginOnArb()

	const [nextFunding, setNextFunding] = useState<PredictedFunding>({
		fundingRate: '',
		nextFundingTime: 0,
	})



	const dispatch = useAppDispatch()


	const updateUserSymbolPreference = async ({ leverage, isCross }: UpdateUserSymbolPreferenceParams) => {
		const coinIndex = allMeta.findIndex((item: any) => baseCoin === item.name)
		const orderAction = {
			type: "updateLeverage",
			asset: coinIndex,
			isCross,
			leverage,
		}
		if (!isApproveAgent) {
			dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
				symbol: baseCoin, config: {
					positionMode: isCross ? 'cross' : 'isolated',
					leverage: leverage.toString(),
				}
			}))
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
			allMeta
		});
  	if (result === 'fail') return;




		const { data } = await symbolDexClient.mutate({
			mutation: mutationUserSymbolPreference,
			variables: {
				input: {
					symbol: baseCoin,
					isCross,
					leverage
				}
			},
		})
		if (data?.updateUserSymbolPreference) {
			
			const { leverage, isCross, isFavorite } = data.updateUserSymbolPreference
			dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
				symbol: baseCoin, config: {
					positionMode: isCross ? 'cross' : 'isolated',
					leverage: leverage.toString(),
					isFavorite
				}
			}))
			showToast({
				type: 'success',
				title: t('futuresDetails.tips.modifySuccess'),
    	})
		}

	}

	const handleModeChange = (mode: PositionModeValue) => {
		if (isLogin) {
			updateUserSymbolPreference({
				leverage: Number(tradeConfigs.leverage),
				isCross: mode === 'cross' ? true : false
			})
		} else {
			dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
					symbol: baseCoin,
					config: {
						positionMode: mode === 'cross' ? 'cross' : 'isolated',
					}
			}))
		}
	}

	const handleLeverageChange = (leverage: string) => {
		// 如果当前设置杠杆大于最大杠杆，则不进行更新
		if (Number(leverage) > Number(maxLeverage)) {
			toast.error(`Invalid leverage value, the maximum supported leverage is ${maxLeverage} times`)
			return
		}
		// 如果杠杆值相同，则不进行更新
		if (leverage === tradeConfigs.leverage) return

		if (isLogin) {
			updateUserSymbolPreference({
				isCross: tradeConfigs.positionMode === 'cross' ? true : false,
				leverage: Number(leverage)
			})
		} else {
				dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
					symbol: baseCoin,
					config: {
						leverage: leverage
					}
			}))
		}
	}

	const formattedFundingRate = useMemo(() => {
		const rate = funding || parseFloat(nextFunding.fundingRate)
		return isNaN(rate) ? '--' : (rate * 100).toFixed(4)
	}, [nextFunding, funding])

	useEffect(() => {
		if (tradeConfigs.leverage === '' ) {
				dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({ symbol: baseCoin, config: { 
					leverage: maxLeverage ? maxLeverage.toString() : ''
				} }))
			} 
	},[maxLeverage, baseCoin, dispatch])

	useEffect(() => {
		setMode(tradeConfigs.positionMode)
	}, [tradeConfigs.positionMode])

	const fetchNextPredictedFunding = useCallback(async () => {

		try {
			const data = await getPredictedFundings()

			if (data?.length) {
				const item = data.find((item: any) => {
					return item[0] === baseCoin
				})
				const hourTs = 60 * 60 * 1000
				const fundingTimeItem = item?.[1]?.find((item: any) => {
					return item[0] === 'HlPerp'
				})
				if (fundingTimeItem) {
					fundingTimeItem[1].nextFundingTime = fundingTimeItem[1].nextFundingTime + hourTs
					setNextFunding(fundingTimeItem[1])
				}
			}
		} catch (err: any) {}
	}, [baseCoin])

	 const handleRefreshFundingTime = () => {
			const hourTs = 60 * 60 * 1000
			setNextFunding(prev => ({
			...prev,
			nextFundingTime: prev.nextFundingTime + hourTs,
		}));
	}


	 useEffect(() => {
			fetchNextPredictedFunding()
	}, [baseCoin])




	return (
		<div className="flex items-center justify-between py-1.5">
			<div>
				<div onClick={() => { setIsOpenFundingFeeDesc(true) }} className="text-[#908E98] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1 underline cursor-pointer">
					{t('futuresDetails.common.fundingRate')}
					<span className="text-[calc(8rem/16)] leading-[calc(8rem/16)]">/</span>
					{t('futuresDetails.common.countdown')}
				</div>

				<div className="leading-[calc(11rem/16)] flex items-center">
					<span className="text-rise text-[calc(11rem/16)] ">{formattedFundingRate}%</span>
					<span className="mx-0.5 text-[calc(9rem/16)] leading-[calc(9rem/16)]">/</span>
					<span className="text-[calc(11rem/16)] leading-[calc(11rem/16)]">
						<FeeCountdown targetTime={nextFunding?.nextFundingTime} onRefresh={handleRefreshFundingTime}/>
					</span>
				</div>
			</div>

			

			<FundingFeeDesc isOpen={isOpenFundingFeeDesc} onOpenChange={(status) => { setIsOpenFundingFeeDesc(status) }} />



		</div>
	)
}

export default HeaderSetting