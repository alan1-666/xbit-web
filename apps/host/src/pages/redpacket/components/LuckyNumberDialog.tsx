import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'

interface LuckyNumberDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	luckyNumber: string
	transactionHash: string
}

const LuckyNumberDialog: React.FC<LuckyNumberDialogProps> = ({
	open,
	onOpenChange,
	luckyNumber,
	transactionHash,
}) => {
	const { t } = useTranslation()

	const handleVerify = () => {
		if (transactionHash) {
			const url = `https://app.hyperliquid.xyz/explorer/tx/${transactionHash}`
			window.open(url, '_blank')
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="bg-[#18181B] border-none p-6 max-w-[400px] rounded-2xl"
				showDialogPrimitiveClose={false}
			>
				<div className="flex flex-col gap-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="text-white text-xl font-normal">{t('red.packet.lucky.number')}</div>
						<button
							onClick={() => onOpenChange(false)}
							className="text-white/60 hover:text-white transition-colors"
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>

					{/* Lucky Number */}
					<div className="flex justify-center">
						<div className="w-[40px] h-[40px] rounded-full bg-[#FFDC3E1A] cursor-pointer flex items-center justify-center text-[#FFD209]">{luckyNumber}</div>
					</div>

					{/* Today's Commitment */}
					<div className="flex flex-col items-center gap-2 px-4 py-3 bg-[#27272A] rounded-xl">
						<div className="text-white/60 text-sm font-normal">{t('red.packet.today.commitment')}</div>
						<div className="text-[#E4E4E4] text-sm font-normal break-all">{transactionHash || '--'}</div>
					</div>

					{/* Verify Button */}
					<div className="flex justify-center">
						<button
							onClick={handleVerify}
							disabled={!transactionHash}
							className="px-12 py-1.5 bg-gradient-to-r from-[#FF1654] to-[#FF3D00] rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{t('red.packet.verify')}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default LuckyNumberDialog
