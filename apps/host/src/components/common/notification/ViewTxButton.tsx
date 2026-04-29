import { useTranslation } from 'react-i18next'
import { CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'

export interface ViewTxButtonProps {
  txId?: string
}

export const ViewTxButton = (props: ViewTxButtonProps) => {
  const { txId } = props
  const { t } = useTranslation()
  if (!txId) return null
  return (
    <a
      href={`${CHAIN_EXPLORER_TX_URLS[ChainIds.Solana]}/${txId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 text-[12px] pt-1 hover:underline"
    >
      {t('notifications.viewTx')}
    </a>
  )
}
