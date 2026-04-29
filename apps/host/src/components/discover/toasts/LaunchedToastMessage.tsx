import { useTranslation } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'

export const LaunchedToastMessage = (props: ToastProps) => {
  const { t } = useTranslation()
  return <BaseToastMessage {...props}>{t('listCoin.tooltip.migratedTokens')}</BaseToastMessage>
}

export default LaunchedToastMessage
