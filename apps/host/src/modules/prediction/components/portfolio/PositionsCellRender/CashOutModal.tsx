import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useResponsive } from '@/hooks/useResponsive'
import { formatAmount, formatBalance, formatPrice } from '@/lib/format'
import { IPortfolioPosition } from '@/modules/prediction/models/PortfolioModel'
import { X } from 'lucide-react'
import { useState } from 'react'
import { usePlaceOrderMutation } from '../../shared/order-form/hooks/usePlaceOrder'
import { toast } from 'sonner'
import { useMarketsByIds } from '@/modules/prediction/hooks/useMarketsByIds'
import { useTranslation } from 'react-i18next'
import { PayoutIcon } from '../../icons'
import { getFromIndexedDB } from '@/utils/indexedDB/errorMessagesDB'
import { getErrorMessage } from '@/utils/helpers'
import { LanguageCode } from '@/redux/modules/errorMessages.slice'
import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch } from '@/redux/store'
import { addPendingPayout } from '@/redux/modules/predictionClaimedBalance.slice'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'

interface CashOutModalProps {
  position: IPortfolioPosition
  children: React.ReactNode
}

export const CashOutModal = ({ position, children }: CashOutModalProps) => {
  const [open, setOpen] = useState(false)
  const { isDesktop } = useResponsive()
  const { data: markets } = useMarketsByIds(position.conditionId ? [position.conditionId] : [])
  const market = markets?.[0]
  const marketId = market?.providerId || ''
  const fee = market?.feeEnable ? Number(market.takerBaseFee || 0) : 0
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const proxyWallet = useProxyWallet()

  const { isPending, mutateAsync } = usePlaceOrderMutation()

  const currentPrice = position?.curPrice || 0
  const currentValue = currentPrice * +position.size

  const handleCashOut = async () => {
    if (!marketId) {
      toast.error(t('prediction.portfolio.marketNotFound'))
      return
    }
    try {
      const res = await mutateAsync({
        marketId: marketId,
        orderType: 'market',
        side: 'sell',
        outcome: position.outcomeIndex === 0 ? 'yes' : 'no',
        data: {
          size: position.size,
        },
        tokenId: position.tokenId,
        conditionId: position.conditionId || '',
        feeRateBps: fee,
        outcomeLabels: market?.outcomes || ['Yes', 'No'],
      })

      if (res?.transactionHash && proxyWallet) {
        const oldUsdcBalance = queryClient.getQueryData<number>(['prediction', 'usdc-balance', proxyWallet]) || 0
        const oldTotalPositionValue =
          queryClient.getQueryData<number>(['prediction', 'users', proxyWallet, 'position-total']) || 0

        dispatch(
          addPendingPayout({
            walletAddress: proxyWallet,
            amount: currentValue, // Using the full calculated cash out value
            transactionHash: res.transactionHash,
            conditionId: position.conditionId || '',
            tokenId: position.tokenId || '',
            oldUsdcBalance,
            oldTotalPositionValue,
            isConfirmed: true,
          }),
        )
      }

      toast.success(t('prediction.portfolio.cashOutSuccess'))
      setOpen(false)
    } catch (error) {
      const firstError = Array.isArray(error) ? error[0] : error
      const errorCode = firstError.code
      const errorMessages = await getFromIndexedDB('errorMessages')

      const lang = i18n.language

      const errorMessage = getErrorMessage(errorMessages, errorCode, lang as LanguageCode) || firstError.message
      toast.error(errorMessage, { duration: 5000, closeButton: true })
    }
  }

  const Content = (
    <div className="flex flex-col w-full pt-3 gap-6 max-w-[425px] mx-auto xl:pb-6">
      {/* Header */}
      <div className="flex flex-col items-center relative gap-4 mt-6">
        {/* Market Image */}
        <Avatar className="h-[60px] w-[60px] min-h-[60px] min-w-[60px] shrink-0 rounded-md shadow-sm">
          <AvatarImage src={position.icon} alt={t('prediction.portfolio.marketIconAlt')} className="object-cover" />
          <AvatarFallback className="rounded-full">P</AvatarFallback>
        </Avatar>

        {/* Title & Subtitle */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xl font-semibold leading-6 tracking-[0.15px] text-white">
            {t('prediction.portfolio.sellOutcome', { outcome: position.outcome })}
          </span>
          <span className="text-sm font-medium text-gray-500 leading-snug tracking-[0.15px] line-clamp-2 px-4">
            {position.title}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-4 w-full">
        {/* Receive Info Box */}
        <div className="flex flex-col justify-center items-center gap-2 bg-emerald-900/10 rounded-lg min-h-[100px] py-4 border border-emerald-500/20">
          <span className="text-sm font-medium text-emerald-400">{t('prediction.portfolio.receive')}</span>
          <div className="flex items-center gap-2">
            <PayoutIcon className="shrink-0 h-6 w-6" />
            <span className="text-2xl font-bold text-emerald-400">
              {formatBalance(currentValue, { showCurrency: true })}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-500">
            {t('prediction.portfolio.sellingSharesPrice', {
              size: formatAmount(position.size),
              price: formatPrice(currentPrice * 100, { showCurrency: false }),
            })}
          </span>
        </div>

        {/* Cash Out Button */}
        <Button
          variant="gradient"
          className="mt-2 mb-3 h-12 rounded-[6px] bg-fall shadow-[0px_-4px_0px_0px_#0000004D_inset]"
          onClick={handleCashOut}
          isLoading={isPending}
          // loadingText={t('prediction.portfolio.cashingOut')}
        >
          {t('prediction.orderForm.sell')}
        </Button>

        {/* Edit Order Button */}
        {/* <Button
          variant="ghost"
          className="w-full h-9 text-sm font-medium text-gray-400 hover:text-white hover:bg-transparent underline decoration-gray-300 underline-offset-4"
        >
          Edit order
        </Button> */}
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px] p-0 bg-[#1C1C1E] border-none shadow-2xl rounded-2xl overflow-hidden gap-0"
          showDialogPrimitiveClose={false}
        >
          <div className="absolute right-4 top-4 z-10">
            <div
              onClick={() => setOpen(false)}
              className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </div>
          </div>
          {Content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-[#1C1C1E] border-t border-white/10 text-foreground pb-6 max-w-[768px] mx-auto">
        {Content}
      </DrawerContent>
    </Drawer>
  )
}
