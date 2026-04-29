import { SearchFundingWalletTransferHistory } from '@/@generated/gql/graphql-core'
import { Notification } from '@/@generated/gql/graphql-notification.ts'
import { useTxDetail } from '@/hooks/useTxDetail'
import { APP_PATH, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { gqlClient, notificationClient } from '@/lib/gql/apollo-client.ts'
import { cn } from '@/lib/utils.ts'
import { ChainIds } from '@/types/enums.ts'
import { replaceErrorCode } from '@/utils/helpers'
import IconLoadingSpin from '@components/icon/stroke/IconLoadingSpin.tsx'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { readNotification } from '@services/notifications.service.ts'
import { getFundingWalletHistory } from '@services/wallet.service.ts'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/hi'
import 'dayjs/locale/ja'
import { Ref, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { NAVIGATIONS } from '@/lib/navigations.ts'

export interface NotificationItemProps {
  notification: Notification
  ref?: Ref<HTMLDivElement>
  setOpenPoper?: ((value: boolean) => void) | undefined
}

const formatCreatedAt = (createdAt: string, language: string) => {
  const now = dayjs()
  const date = dayjs(createdAt)
  if (now.diff(date, 'hour') < 24) {
    return date.locale(language).fromNow()
  } else {
    return date.locale(language).format('YYYY/MM/DD HH:mm')
  }
}

const useReadNotification = () => {
  const { mutate: markRead } = useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationClient.mutate({
        mutation: readNotification,
        variables: { id: notificationId },
      })
    },
  })
  return markRead
}

export const NotificationItem = (props: NotificationItemProps) => {
  const { notification, ref, setOpenPoper } = props
  const { t, i18n } = useTranslation()
  const navigate = useNavigateWithLocation()
  const markRead = useReadNotification()
  const [read, setRead] = useState(notification.read)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const { openTxDetail } = useTxDetail()

  const fetchRecordByTxId = async (txId: string) => {
    try {
      const input: SearchFundingWalletTransferHistory = {
        txid: txId,
      }
      const response = await gqlClient.query({
        query: getFundingWalletHistory,
        variables: {
          input,
        },
      })

      const fundingRecords = response.data.getFundingWalletHistory
      return fundingRecords.length > 0 ? fundingRecords[0] : null
    } catch (error) {
      console.error('Error fetching funding record by ID:', error)
      return null
    }
  }

  const handleClick = () => {
    if (!notification.read) {
      markRead(notification.id)
      setRead(true)
    }
    if (notification.type === 'SmartMoneyActivity') {
      setOpenPoper?.(false)
      const metadata = notification.metadata ? JSON.parse(notification.metadata) : {}
      const url = APP_PATH.MEME_WALLET + '/' + metadata.wallet_address
      navigate(url, {
        state: {
          fromNotification: true,
          notificationId: notification.id,
        },
      })
    }
    if (notification.type === 'CopyTrade') {
      setOpenPoper?.(false)
      const metadata = notification.metadata ? JSON.parse(notification.metadata) : {}
      const config_id = metadata.config_id
      const url = APP_PATH.WALLET_COPY + '/' + config_id
      navigate(url, {
        state: {
          fromNotification: true,
          notificationId: notification.id,
        },
      })
    }
    if (notification.type === 'Others') {
      const metadata = notification.metadata ? JSON.parse(notification.metadata) : {}
      const templateCode = metadata.template_code

      // Handle for prediction market related notifications


      if (templateCode.startsWith('pred_limit_order_') || templateCode.startsWith('pred_order_')) {
        setOpenPoper?.(false)
        const eventSlug = metadata.event_slug
        if (!eventSlug) return
        navigate(NAVIGATIONS.prediction.eventDetails(eventSlug))
      }

      // Handle for limit orders due to order_id is only available for limit orders
      const orderId = metadata.order_id

      if (orderId) {
        setOpenPoper?.(false)
        if (metadata.tx_id) {
          window.open(`${CHAIN_EXPLORER_TX_URLS[ChainIds.Solana]}/${metadata.tx_id}`, '_blank')
        }
        return
      }

      // Others for Meme Assets
      const txid = metadata.txid || metadata.txHash
      if (txid) {
      setLoadingDetail(true)
      fetchRecordByTxId(txid).then((record) => {
        if (record) {
          setLoadingDetail(false)
          setOpenPoper?.(false)
          openTxDetail(record as FundingRecord)
        } else {
          setLoadingDetail(false)
          setOpenPoper?.(false)
          console.error('No funding record found for txid:', txid)
        }
      })
      }
    }
  }

  const showShouldViewDetails = useMemo(() => {
    if (notification.type === 'Others') {
      const metadata = notification.metadata ? JSON.parse(notification.metadata) : {}
      if(metadata.template_code === 'claim_red_packet_failed') {
        return false
      }
      if (metadata.order_id && !metadata.tx_id) {
        // Limit order without tx_id, e.g. order placed but not filled
        return false
      }

    }
    return true
  }, [notification])

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start p-4 rounded-[8px] shadow-md relative transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r  cursor-pointer',
        'bg-[#232329]',
      )}
      onClick={handleClick}
    >
      <div className="flex-1">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <h3 className="text-[calc(16rem/16)] text-white">{notification.title}</h3>
          </div>
          <div className="flex items-center">
            {!read && <span className="w-2.5 h-2.5 bg-[#6A2AE0] rounded-full ml-2 shrink-0 animate-pulse"></span>}
            {loadingDetail && <IconLoadingSpin className="size-3 text-[#6A2AE0] animate-spin" />}
          </div>
        </div>
        <p className="text-[#FFFFFFB2] text-[calc(13rem/16)] mb-3 w-full">
          {replaceErrorCode(notification.description, t)}
        </p>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[#FFFFFFB2] text-[calc(11rem/16)] shrink-0">
            {formatCreatedAt(notification.createdAt, i18n.language)}
          </p>
          {showShouldViewDetails && (
            <div className="text-[#1890FF] text-[calc(11rem/16)] underline">{t('notifications.viewDetails')} &gt;</div>
          )}
        </div>
      </div>
    </div>
  )
}
