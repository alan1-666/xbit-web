import { useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useAppSelector } from '@/redux/store'

interface LastestTardeProps {
}

const LastestTarde = () => {
	const { baseCoin } = useAppSelector(symbolInfoSelector)
	const data = useOrderTradeData(baseCoin);

	return (
		<div className=" h-[calc(1rem*(146/16))]">
			<div className="flex items-center justify-center pt-2.5 pb-1.5 text-[calc(12rem/16)] leading-1">
				最新成交
				<img className="ml-1" src="/images/futuresDetail/arrow-down.svg" alt="arrow-down" />
			</div>
			<div className="overflow-y-auto max-h-[calc(1rem*(114/16))]">
				{
					data.map((item, index) => {
						return (
							<div key={index} className="py-1 text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] gap-0.5 flex items-center justify-between">
								<span className="text-[#FFFFFFCC] flex-1">{item.time}</span>
								<span className="text-rise flex-1">{item.price}</span>
								<span className="text-[#FFFFFFCC] flex-1 text-right">{item.quantity}</span>
							</div>
						)
					})
				}
			</div>
		</div>
	)
}
export default LastestTarde
