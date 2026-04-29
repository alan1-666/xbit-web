import { useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@components/ui/button.tsx'
import { useIsUSDCApproved } from '@/modules/prediction/hooks/useUSDCAllowance.ts'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { useContext, useMemo, useState } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import { useMarketConditionalTokenBalance } from '@/modules/prediction/components/shared/order-form/hooks/useMarketConditionalTokenBalance.ts'
import { DepositDialog } from '@/modules/prediction/components/home/DepositDialog.tsx'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { EnableTradingDialog } from '@/modules/prediction/components/shared/EnableTradingButton.tsx'
import { useTranslation } from 'react-i18next'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '@/components/RestrictRegiongDialog'
import { useHasPendingOrders } from '@/modules/prediction/components/shared/order-form/hooks/useHasPendingOrders.ts'

const useCheckBalanceIsValid = () => {
  const { control } = useFormContext<OrderFormData>()
  const side = useWatch({ control, name: 'side' })
  const orderType = useWatch({ control, name: 'orderType' })
  const amount = useWatch({ control, name: 'data.amount' })
  const size = useWatch({ control, name: 'data.size' })
  const price = useWatch({ control, name: 'data.price' })
  const { data: usdcBalance } = useMyUSDCBalance()
  const { data: tokenBalance } = useMarketConditionalTokenBalance()

  const availableBalance = useMemo(() => {
    return side === 'buy' ? usdcBalance : tokenBalance
  }, [side, usdcBalance, tokenBalance])

  const cost = useMemo(() => {
    if (orderType === 'market') return side === 'buy' ? (amount ?? 0) : (size ?? 0)
    if (orderType === 'limit') return side === 'buy' ? (size ?? 0) * (price ?? 0) : (size ?? 0)
    return 0
  }, [size, side, orderType, amount, price])

  return {
    isValidCost: availableBalance !== undefined && cost <= availableBalance,
  }
}

const EnableTradingButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <Button className="w-full rounded-full" variant="gradient" onClick={onClick}>
      {t('prediction.enableTrading.btnEnable')}
    </Button>
  )
}

const DepositButton = () => {
  const { t } = useTranslation()

  return (
    <DepositDialog>
      <Button className="w-full rounded-full" variant="gradient">
        {t('prediction.orderForm.deposit')}
      </Button>
    </DepositDialog>
  )
}

const PlaceOrderButton = ({
  side,
  outcome,
  outcomeLabel,
  disabled,
  isLoading,
}: {
  side: 'buy' | 'sell'
  outcome: 'yes' | 'no'
  outcomeLabel: string
  disabled: boolean
  isLoading: boolean
}) => {
  const { t } = useTranslation()
  const sideText = side === 'buy' ? t('prediction.orderForm.buy') : t('prediction.orderForm.sell')
  const outcomeText = outcomeLabel || (outcome === 'yes' ? t('prediction.common.yes') : t('prediction.common.no'))

  return (
    <Button className="w-full rounded-full" variant="gradient" disabled={disabled} isLoading={isLoading}>
      {sideText} {outcomeText}
    </Button>
  )
}

interface MainButtonRendererProps {
  side: 'buy' | 'sell'
  outcome: 'yes' | 'no'
  outcomeLabel: string
  isFormValid: boolean
  onEnableTrading: () => void
}

const MainButtonRenderer = ({ side, outcome, outcomeLabel, isFormValid, onEnableTrading }: MainButtonRendererProps) => {
  const proxyWallet = useProxyWallet()
  const isApproved = useIsUSDCApproved()
  const { isValidCost } = useCheckBalanceIsValid()
  const { isProcessing, clobTokenIds } = useContext(OrderFormContext)
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const enablePredictionByZone = useFeatureIsOn('enable_prediction_trading')
  const { t } = useTranslation()
  const tokenId = outcome === 'yes' ? clobTokenIds[0] : clobTokenIds[1]
  const hasPendingOrder = useHasPendingOrders(tokenId)
  const isDisabledByPendingOrder = hasPendingOrder && side === 'sell'

  if (!proxyWallet) {
    return <EnableTradingButton onClick={onEnableTrading} />
  }

  if (side === 'buy' && !isValidCost) {
    return <DepositButton />
  }

  const sideText = side === 'buy' ? t('prediction.orderForm.buy') : t('prediction.orderForm.sell')
  const outcomeText = outcomeLabel || (outcome === 'yes' ? t('prediction.common.yes') : t('prediction.common.no'))
  const buttonLabel = `${sideText} ${outcomeText}`

  // If region is restricted, show button that opens restriction dialog instead of submitting
  if (!enablePredictionByZone) {
    return (
      <>
        <Button
          type="button"
          className="w-full rounded-full"
          variant="gradient"
          onClick={() => setOpenRestrictRegiongDialog(true)}
        >
          {buttonLabel}
        </Button>
        <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
      </>
    )
  }

  return (
    <PlaceOrderButton
      side={side}
      outcome={outcome}
      outcomeLabel={outcomeLabel}
      disabled={!isApproved || !isFormValid || !isValidCost || isDisabledByPendingOrder}
      isLoading={isProcessing}
    />
  )
}

export const OrderButton = () => {
  const { control, formState } = useFormContext<OrderFormData>()
  const side = useWatch({ control, name: 'side' })
  const outcome = useWatch({ control, name: 'outcome' })
  const { outcomeLabels = [] } = useContext(OrderFormContext)
  const [enableDialogOpen, setEnableDialogOpen] = useState(false)

  const outcomeLabel = outcome === 'yes' ? outcomeLabels[0] : outcomeLabels[1]

  return (
    <>
      <MainButtonRenderer
        side={side}
        outcome={outcome || 'yes'}
        outcomeLabel={outcomeLabel || ''}
        isFormValid={formState.isValid}
        onEnableTrading={() => setEnableDialogOpen(true)}
      />
      <EnableTradingDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen} />
    </>
  )
}
