import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { useMemo, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { selectFuturesTradePreferences, futuresTradePreferencesActions } from '@/redux/modules/futuresTradePreferences.slice'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { futuresTradeConfigActions, futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'

type DepthLayoutLocal = 'showAll' | 'showAsks' | 'showBids'



const layoutImg = [
	{
		url: '/images/futuresDetail/depth-show-all-icon.svg',
		value: 'showAll',
	},
	{
		url: '/images/futuresDetail/depth-show-asks-icon.svg',
		value: 'showAsks',
	},
	{
		url: '/images/futuresDetail/depth-show-bids-icon.svg',
		value: 'showBids',
	},
]

const LeftSetting = () => {
	const dispatch = useAppDispatch()

	const { depthLayout } = useAppSelector(selectFuturesTradePreferences)
	const { baseCoin } = useAppSelector(symbolInfoSelector)

	const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))

  const tick = Number(tradeConfigs.depthTick)

	const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
	const depthOptions = useMemo(() => {
		if (!tiers?.length) return []
		return tiers?.map(item => {
			return {
				label: item.tick,
				value: item.tick,
			}
		})
	}, [tiers])




	const handleTickChange = (tick: string) => {
		dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
			symbol: baseCoin,
			config: {
				depthTick: (Number(tick))
			}
		}))
	}

	const layoutItem = useMemo(() => {
		return layoutImg.find(item => {
			return item.value === depthLayout
		})
	}, [depthLayout])

	// 根据全局涨跌颜色偏好决定是否互换买卖图标显示
	const priceChangeColor = useAppSelector((state: any) => state.preference?.priceChangeColor)
	const isInverse = priceChangeColor === 'inverse'
	const layoutIconUrl = useMemo(() => {
		if (!layoutItem) {
			return undefined
		}
		if (!isInverse) {
			return layoutItem.url
		}
		if (layoutItem.value === 'showAsks') {
			return layoutImg.find(i => i.value === 'showBids')?.url
		}
		if (layoutItem.value === 'showBids') {
			return layoutImg.find(i => i.value === 'showAsks')?.url
		}
		return layoutItem.url
	}, [layoutItem, isInverse])

	const handleLayoutChange = (value: DepthLayoutLocal) => {
		let nextLayout
		if (value === 'showAll') nextLayout = 'showBids'
		if (value === 'showBids') nextLayout = 'showAsks'
		if (value === 'showAsks') nextLayout = 'showAll'

		dispatch(futuresTradePreferencesActions.updateTradePreferences({
			depthLayout: nextLayout as DepthLayoutLocal
		}))

	}
	useEffect(() => {
		if (depthLayout === 'showAsks') {
		  console.log('showAsks layout active');
		  // 可以在这里添加DOM检查代码
		}
	  }, [depthLayout]);

	useEffect(() => {
		if (!tick && depthOptions.length > 0) {

			dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
				symbol: baseCoin,
				config: {
					depthTick: Number(depthOptions[0].value)
				}
			}))

		}
	}, [depthOptions, tick]);

	return (
		<div className='flex items-center pt-[4px] h-[24px]'>
			 {tick !== 0 && depthOptions.length > 0 ? <DrawerCheckSelect
					childrenTrigger={
						<div className='flex-1 flex items-center justify-between  py-1 px-2 rounded-[4px] bg-[#ECECED14] 
							text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] text-[#FFFFFFB2] cursor-pointer'>
							{tick}
							<img className='ml-2' src="/images/futuresDetail/s-down-arrow-icon.svg" alt="s-down-arrow-icon" />
						</div>
					}
					optionClassName="border-b-[0.5px] border-solid border-[#ECECED14]"
					options={depthOptions as any}
					value={tick as any}
					onChange={handleTickChange}
				/>
			: <></>}
			<img className='ml-1.5 cursor-pointer' src={layoutIconUrl} onClick={() => { handleLayoutChange(layoutItem?.value as DepthLayoutLocal) }}  alt="depth-layout-icon" />
		</div>
	)
}
export default LeftSetting