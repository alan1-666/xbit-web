import { useTranslation } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'

export const HolderToastMessage = (props: ToastProps) => {
  const { t } = useTranslation()
  return <BaseToastMessage {...props} className="w-[180px]">{t('listCoin.tooltip.holders')}</BaseToastMessage>
}

export default HolderToastMessage
