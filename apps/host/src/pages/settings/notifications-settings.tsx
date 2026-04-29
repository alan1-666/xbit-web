import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { Switch } from '@components/ui/switch.tsx'
import { ReactNode, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNotificationEnabledV2 } from '@hooks/useNotificationsEnabled.ts'
import { EnableManuallyGuide } from '@/components/settings/EnableManuallyGuide'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { fetchUserSettings, NotificationPreference, updateUserSettings } from '@/redux/modules/userSettings.slice.ts'
import { NotificationTypeCategoryCode } from '@/@generated/gql/graphql-user.ts'
import { useMutation } from '@apollo/client'
import { updateNotificationPreferences } from '@services/userSettings.service.ts'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'
import { NotSupportedNotificationDialog } from '@components/settings/NotSupportedNotificationDialog.tsx'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator
}

export const NotificationsEnabledChecker = () => {
  const [showAlert, setShowAlert] = useState(false)
  const { notificationsEnabled, requestNotificationPermission } = useNotificationEnabledV2({
    onDenied: () => toast.custom((id) => <EnableManuallyGuide id={id} />, { duration: 3000 }),
  })
  const { t } = useTranslation()

  const handleClick = () => {
    if (!isNotificationSupported()) {
      setShowAlert(true)
      return
    }
    requestNotificationPermission()
  }

  if (notificationsEnabled) return null
  return (
    <div className="bg-[linear-gradient(43.83deg,#9035FF_0%,#EE69FF_103.57%)] rounded-[8px] p-[1px]">
      <NotSupportedNotificationDialog open={showAlert} onOpenChange={setShowAlert} />
      <div className="flex px-3 py-4 bg-[#232329] rounded-[8px] gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-2.5">
            <img src="/images/icons/settings/ic-info.svg" alt="" className="size-5" />
            <span className="text-white font-medium text-[calc(14rem/16)] leading-3.5">
              {t('appSettings.notifications.enablePushNotifications')}
            </span>
          </div>
          <div className="text-white text-[calc(12rem/16)] leading-3">
            {t('appSettings.notifications.enablePushNotificationsSubtitle')}
          </div>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleClick}>
          <span className="text-white text-[calc(13rem/16)]">{t('appSettings.notifications.enableBtn')}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.61935 12.0465L10.666 7.99979L6.61935 3.95312"
              stroke="#878787"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export type Item = {
  key: 'smartMoneyAlert' | 'tokenPrice' | 'tradingSignal' | 'copyTrade' | 'others'
  title: string
  subTitle: string
  icon: ReactNode
  disabled: boolean
}

export const useItems = () => {
  const { t } = useTranslation()
  return useMemo(() => {
    return [
      {
        key: 'smartMoneyAlert',
        title: t('appSettings.notifications.smartMoneyTitle'),
        subTitle: t('appSettings.notifications.smartMoneySubtitle'),
        icon: <img src="/images/icons/settings/ic-dollar-circle.svg" alt="" className="size-4" />,
        disabled: false,
      },
      {
        key: 'copyTrade',
        title: t('appSettings.notifications.copyTrade'),
        subTitle: t('appSettings.notifications.copyTradeSubtitle'),
        icon: <img src="/images/icons/settings/copy-trade-icon.svg" alt="" className="size-4" />,
        disabled: false,
      },
      {
        key: 'tokenPrice',
        title: t('appSettings.notifications.priceAlertTitle'),
        subTitle: t('appSettings.notifications.priceAlertSubtitle'),
        icon: <img src="/images/icons/settings/ic-wallet-check.svg" alt="" className="size-4" />,
        disabled: true,
      },
      {
        key: 'tradingSignal',
        title: t('appSettings.notifications.tradingTitle'),
        subTitle: t('appSettings.notifications.tradingSubtitle'),
        icon: <img src="/images/icons/settings/ic-alert.svg" alt="" className="size-4" />,
        disabled: true,
      },
      {
        key: 'others',
        title: t('appSettings.notifications.othersTitle'),
        subTitle: t('appSettings.notifications.othersSubtitle'),
        icon: <img src="/images/icons/settings/ic-bell.svg" alt="" className="size-4" />,
        disabled: false,
      },
    ] as Item[]
  }, [t])
}

export const mapTypeCode: Record<string, NotificationTypeCategoryCode> = {
  smartMoneyAlert: NotificationTypeCategoryCode.SmartMoneyActivity,
  tokenPrice: NotificationTypeCategoryCode.PriceChange,
  tradingSignal: NotificationTypeCategoryCode.FuturesSignal,
  copyTrade: NotificationTypeCategoryCode.CopyTrade,
  others: NotificationTypeCategoryCode.Others,
}

export const DEFAULT_COPY_TRADE_ENABLED = true

// Helper function to get setting value from Redux
const getSettingValue = (
  notificationSettings: NotificationPreference[],
  typeCode: NotificationTypeCategoryCode,
  defaultValue: boolean = false,
): boolean => {
  return notificationSettings.find((item) => item.notificationTypeCode === typeCode)?.isEnabled ?? defaultValue
}

export const NotificationsSettingsPage = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const items = useItems()

  const [mutate] = useMutation(updateNotificationPreferences, {
    client: userGqlClient,
  })

  // Get notification settings from Redux
  const notificationSettings = useAppSelector(
    (state) => state.userSettings.notificationPreferences as NotificationPreference[],
  )

  // Calculate settings from Redux store
  const settings = useMemo(
    () => ({
      smartMoneyAlert: getSettingValue(notificationSettings, NotificationTypeCategoryCode.SmartMoneyActivity),
      tokenPrice: getSettingValue(notificationSettings, NotificationTypeCategoryCode.PriceChange),
      tradingSignal: getSettingValue(notificationSettings, NotificationTypeCategoryCode.FuturesSignal),
      copyTrade: getSettingValue(
        notificationSettings,
        NotificationTypeCategoryCode.CopyTrade,
        DEFAULT_COPY_TRADE_ENABLED,
      ),
      others: getSettingValue(notificationSettings, NotificationTypeCategoryCode.Others),
    }),
    [notificationSettings],
  )

  const handleChange = async (key: string, newValue: boolean) => {
    // Optimistic update to Redux
    const updatedPreferences = notificationSettings.map((pref) =>
      pref.notificationTypeCode === mapTypeCode[key] ? { ...pref, isEnabled: newValue } : pref,
    )

    // If preference doesn't exist, add it
    if (!notificationSettings.find((pref) => pref.notificationTypeCode === mapTypeCode[key])) {
      updatedPreferences.push({
        id: '',
        userId: '',
        notificationTypeCode: mapTypeCode[key],
        channel: '',
        isEnabled: newValue,
      })
    }

    // Update Redux immediately (optimistic update)
    dispatch(updateUserSettings({ notificationPreferences: updatedPreferences }))

    try {
      // Call API
      await mutate({
        variables: {
          input: {
            notificationTypeCode: mapTypeCode[key],
            isEnabled: newValue,
          },
        },
      })

      // Fetch latest data from server to ensure sync
      dispatch(fetchUserSettings())
    } catch (error) {
      console.error('Failed to update notification preference:', error)
      // Revert on error by fetching again
      dispatch(fetchUserSettings())
    }
  }

  // Fetch user settings on mount
  useEffect(() => {
    dispatch(fetchUserSettings())
  }, [dispatch])

  return (
    <div className="w-full h-dvh flex flex-col">
      <HeaderWithBack
        title={t('appSettings.notifications.title')}
        className="bg-transparent"
        backHref={location.state?.callbackState?.from}
      />
      <div className="px-3 pb-6 pt-1 space-y-4">
        <NotificationsEnabledChecker />
        <div>
          {items.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-2 justify-between px-3 py-3 border-b border-[#ECECED14] last:border-b-0 ${
                item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              onClick={() => {
                if (item.disabled) return
                handleChange(item.key, !settings[item.key])
              }}
            >
              <div className="size-9 flex items-center justify-center bg-[#ECECED14] mr-2 rounded-full">
                {item.icon}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[calc(15rem/16)] text-[#FFFFFF]">{item.title}</span>
                <span className="text-[calc(14rem/16)] text-[#FFFFFF80]">{item.subTitle}</span>
              </div>
              <Switch
                checked={settings[item.key]}
                disabled={item.disabled}
                className="data-[state=checked]:bg-[#6A2AE0]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
