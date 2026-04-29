import { useTranslation } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'

export const SmartMoneyToastMessage = (props: ToastProps) => {
  const { t } = useTranslation()
  return <BaseToastMessage {...props} className="sm:min-w-[200px]">{t('listCoin.tooltip.smartMoney')}</BaseToastMessage>
}

export default SmartMoneyToastMessage
