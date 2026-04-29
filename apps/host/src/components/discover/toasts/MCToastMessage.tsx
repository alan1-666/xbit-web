import { useTranslation } from 'react-i18next'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'

export interface MCToastMessageMessageProps extends ToastProps {
  timeframe: TimeframeOption
}
export const MCToastMessageMessage = (props: MCToastMessageMessageProps) => {
  const { timeframe, ...rest } = props
  const { t } = useTranslation()
  return <BaseToastMessage {...rest}>{t('appSettings.browsingHistoryPage.columns.marketcap')}</BaseToastMessage>
}

export default MCToastMessageMessage
