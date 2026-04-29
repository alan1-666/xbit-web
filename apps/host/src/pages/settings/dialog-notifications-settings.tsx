import { NotificationTypeCategoryCode } from '@/@generated/gql/graphql-user.ts'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'
import { cn } from '@/lib/utils'
import { fetchUserSettings, NotificationPreference } from '@/redux/modules/userSettings.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useMutation } from '@apollo/client'
import { Switch } from '@components/ui/switch.tsx'
import { updateNotificationPreferences } from '@services/userSettings.service.ts'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_COPY_TRADE_ENABLED,
  mapTypeCode,
  NotificationsEnabledChecker,
  useItems,
} from './notifications-settings'
import { IconNotifications } from '@/components/icon/stroke/IconNotifications'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'

const DialogNotificationsSettings = () => {
  const activeWallet = useSelector(_activeWallet)

  const [settings, setSettings] = useState({
    smartMoneyAlert: false,
    tokenPrice: false,
    tradingSignal: false,
    copyTrade: DEFAULT_COPY_TRADE_ENABLED,
    others: false,
  })
  const { t } = useTranslation()

  const items = useItems()
  const [mutate] = useMutation(updateNotificationPreferences, {
    client: userGqlClient,
  })

  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  const handleChange = (key: string, newValue: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: newValue }))
    mutate({
      variables: {
        input: {
          notificationTypeCode: mapTypeCode[key],
          isEnabled: newValue,
        },
      },
    }).then(() => {
      dispatch(fetchUserSettings())
    })
  }

  const notificationSettings = useAppSelector(
    (state) => state.userSettings.notificationPreferences as NotificationPreference[],
  )

  useEffect(() => {
    if (!notificationSettings) return
    setSettings({
      smartMoneyAlert:
        notificationSettings.find(
          (item) => item.notificationTypeCode === NotificationTypeCategoryCode.SmartMoneyActivity,
        )?.isEnabled ?? false,
      tokenPrice:
        notificationSettings.find((item) => item.notificationTypeCode === NotificationTypeCategoryCode.PriceChange)
          ?.isEnabled ?? false,
      tradingSignal:
        notificationSettings.find((item) => item.notificationTypeCode === NotificationTypeCategoryCode.FuturesSignal)
          ?.isEnabled ?? false,
      copyTrade:
        notificationSettings.find((item) => item.notificationTypeCode === NotificationTypeCategoryCode.CopyTrade)
          ?.isEnabled ?? DEFAULT_COPY_TRADE_ENABLED,
      others:
        notificationSettings.find((item) => item.notificationTypeCode === NotificationTypeCategoryCode.Others)
          ?.isEnabled ?? false,
    })
  }, [notificationSettings])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {activeWallet?.isConnected ? (
          <div className={cn('flex items-center font-normal w-[70px] cursor-pointer pr-4 justify-end')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 9.11035V14.8804C3 17.0004 3 17.0004 5 18.3504L10.5 21.5304C11.33 22.0104 12.68 22.0104 13.5 21.5304L19 18.3504C21 17.0004 21 17.0004 21 14.8904V9.11035C21 7.00035 21 7.00035 19 5.65035L13.5 2.47035C12.68 1.99035 11.33 1.99035 10.5 2.47035L5 5.65035C3 7.00035 3 7.00035 3 9.11035Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <button className="flex items-center pl-1 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-2 h-[36px] rounded-[4px]">
            <IconNotifications className="text-white" />
            <span className="text-[14px] font-medium">{t('appSettings.notifications.title')}</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="px-0 py-2" showDialogPrimitiveClose={false}>
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="w-[70px]"></div>
            <div className={cn('text-lg font-normal text-center flex-1')}>{t('appSettings.notifications.title')}</div>
            <div className="w-[70px] justify-end flex pr-3">
              <img
                src={'/images/icons/close.svg'}
                alt="icon close"
                className="size-[16px] cursor-pointer"
                onClick={() => {
                  setOpen(false)
                }}
              />
            </div>
          </div>

          <div className=" py-6 space-y-4">
            <NotificationsEnabledChecker />
            <div>
              {items.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-2 justify-between px-3 py-4 border-b border-[#ECECED14] last:border-b-0 ${
                    item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (item.disabled) return // Prevent interaction if disabled
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
      </DialogContent>
    </Dialog>
  )
}

export default DialogNotificationsSettings
