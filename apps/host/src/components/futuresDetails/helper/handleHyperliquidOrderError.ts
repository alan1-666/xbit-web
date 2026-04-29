import { toast } from 'sonner'
import { futuresUserInfoActions } from '@/redux/modules/futuresUserInfo.slice'
import { AppDispatch } from '@/redux/store'
import { tConst } from '@/utils/helpers.ts'
import eventBus from '@/lib/eventBus.ts'

export const NEED_APPROVE = 'approveFirst'

export const handleHyperliquidOrderError = (
  error: string,
  dispatch: AppDispatch
) => {
  if (error?.includes('User or API Wallet') || error?.includes('Builder fee has not been approved')) {
    dispatch(futuresUserInfoActions.updateAuthorizationStatus(false))
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('approve_expired_ts')) {
        localStorage.removeItem(key)
      }
    }
    toast.error(tConst('futuresDetails.loginAuth.pleaseApprove'))
     eventBus.dispatch(NEED_APPROVE, {
      data: {
      },
    })
    return
  }
  toast.error(error || tConst('futuresDetails.loginAuth.operationFailed'))
}
