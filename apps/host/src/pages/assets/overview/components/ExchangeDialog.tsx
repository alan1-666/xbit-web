import { Dialog, DialogTitle, DialogContent } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { ExchangeCard } from '@pages/assets/overview/components/ExchangeCard.tsx'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import { _activeWallet } from '@/redux/modules/newWallet.slice'



const ExchangeDialog = () => {
  const dispatch = useAppDispatch()
  const exchangeDialogOpen = useAppSelector((state) => state.exchange.exchangeDialogOpen)
  const exchangeDialogConfig = useAppSelector((state) => state.exchange.exchangeDialogConfig)

  const [tab, setTab] = useState<string>(exchangeDialogConfig.defaultTab || 'deposit')
  const [chainId, setChainId] = useState<number | undefined>(exchangeDialogConfig.defaultChainId)


  useEffect(() => {
    if (exchangeDialogOpen && exchangeDialogConfig.defaultTab) {
      setTab(exchangeDialogConfig.defaultTab)
    }
  }, [exchangeDialogOpen, exchangeDialogConfig.defaultTab])

  useEffect(() => {
    if (exchangeDialogOpen && exchangeDialogConfig.defaultChainId) {
      setChainId(exchangeDialogConfig.defaultChainId)
    }
  }, [exchangeDialogOpen, exchangeDialogConfig.defaultChainId])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(exchangeActions.closeExchangeDialog())
    }
  }

  useEffect(() => {
    if (exchangeDialogOpen && tab === 'deposit') {
      logEvent2(ACTIONS.deposit_click)
    }
  }, [exchangeDialogOpen])

  return (
    <Dialog open={exchangeDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-w-md !rounded-xl p-0 border-none overflow-hidden"
        showDialogPrimitiveClose={false}
      >
        <DialogTitle className="hidden"></DialogTitle>
        <ExchangeCard
          defaultTab={tab}
          defaultChainId={chainId}
          className="bg-[#212127]"
          onWithdrawSuccess={() => dispatch(exchangeActions.closeExchangeDialog())}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ExchangeDialog
