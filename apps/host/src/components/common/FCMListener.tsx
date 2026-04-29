import { CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { onMessageListener } from '@/lib/firebase'
import { LanguageCode } from '@/redux/modules/errorMessages.slice'
import { ChainIds } from '@/types/enums.ts'
import { getErrorMessage } from '@/utils/helpers'
import { getFromIndexedDB } from '@/utils/indexedDB/errorMessagesDB'
import { useFCMToken } from '@hooks/useNotificationsEnabled.ts'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const ViewTx = ({ txId }: { txId?: string }) => {
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

const handleConvertErrorMsg = async (errorCode: string) => {
  const errorMessages = await getFromIndexedDB('errorMessages')

  const params = new URLSearchParams(window.location.search)
  const langUrl = params.get('lang')
  const lang =
    langUrl || localStorage.getItem('i18nextLng')?.substring(0, 2) || navigator.language?.substring(0, 2) || 'en'

  return getErrorMessage(errorMessages, errorCode, lang as LanguageCode)
}

const renderDescription = async (payload: any) => {
  try {
    const data = payload?.data
    const templateCode = data?.template_code as string
    const notification = payload?.notification
    let message = notification.body
    const errorCodePattern = /\{\{([A-Za-z0-9_]+)\}\}/g

    if (errorCodePattern.test(message)) {
      const matches = message.match(errorCodePattern)
      if (matches) {
        for (const match of matches) {
          const errorCode = match.replace(/[{}]/g, '')
          const convertedMsg = await handleConvertErrorMsg(errorCode)
          message = message.replace(match, convertedMsg)
        }
      }
    }

    if (templateCode && templateCode === 'limit_order_buy_success') {
      return (
        <span>
          {message}
          <br />
          <ViewTx txId={data?.tx_id} />
        </span>
      )
    } else {
      return message
    }
  } catch (error) {
    return payload?.notification.body
  }
}

export const FCMListener = () => {
  useFCMToken()

  const queryClient = useQueryClient()
  useEffect(() => {
    const unsubscribe = onMessageListener().subscribe(async (payload: any) => {
      const notification = payload?.notification
      if (notification) {
        toast(notification.title, {
          description: await renderDescription(payload),
          duration: 5000,
        })
        queryClient.invalidateQueries({ queryKey: ['notificationsCount'] }).then(() => {})
      }
    })

    return () => {
      unsubscribe.unsubscribe()
    }
  }, [])

  return null
}
