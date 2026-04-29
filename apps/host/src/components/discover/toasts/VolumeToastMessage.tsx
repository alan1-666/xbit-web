import { useTranslation } from 'react-i18next'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'

export interface VolumeToastMessageProps extends ToastProps {
  timeframe: TimeframeOption
}
export const VolumeToastMessage = (props: VolumeToastMessageProps) => {
  const { timeframe, ...rest } = props
  const { t } = useTranslation()
  return <BaseToastMessage {...rest}>{t('listCoin.toasts.volume', { time: timeframe })}</BaseToastMessage>
}

export default VolumeToastMessage
