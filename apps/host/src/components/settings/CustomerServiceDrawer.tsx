import { BaseBottomDrawer, BaseBottomDrawerProps } from '@components/settings/BaseBottomDrawer.tsx'
import { IconDownload } from '@components/icon/stroke/IconDownload.tsx'
import { useTranslation } from 'react-i18next'
import { IconTelegramCircle } from '@components/icon'
import { CustomerServiceQRCode, CustomerServiceQRCodeHandle } from '@components/settings/CustomerServiceQRCode.tsx'
import { useRef, useState } from 'react'
import { CopyButton } from '@components/common/copy-button.tsx'
import html2canvas from 'html2canvas'
import { Loading } from '@components/common/Loading.tsx'

export interface CustomerServiceDrawerProps extends BaseBottomDrawerProps {}

export const CustomerServiceDrawer = (props: CustomerServiceDrawerProps) => {
  const { t } = useTranslation()
  const ref = useRef<CustomerServiceQRCodeHandle>(null)
  const telegramBot = import.meta.env.VITE_TELEGRAM_BOT
  // const telegramLink = `https://t.me/${telegramBot}`
  const telegramLink = 'https://t.me/KairoX'
  const posterRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState<boolean>(false)

  const handleDownload = async () => {
    if (!posterRef.current || saving) return
    setSaving(true)
    const canvas = await html2canvas(posterRef.current, {
      useCORS: true,
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = 'KairoX Customer Service QR Code'
    link.href = canvas.toDataURL()
    setSaving(false)
    link.click()
  }

  const openTelegram = () => {
    window.open(telegramLink, '_blank')
  }

  return (
    <BaseBottomDrawer drawerClassName="h-[78vh]" drawerContentClassName="h-full pb-0" {...props} isShowBgImg={false}>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div ref={posterRef} className="w-fit mx-auto bg-white rounded-[6px] py-4 px-4">
            <div className="text-[#5A8B50] text-center font-semibold text-[calc(18rem/16)] mb-4">
              {t('appSettings.telegramSupport')}
            </div>
            <CustomerServiceQRCode ref={ref} url={telegramLink} />
            <div className="text-[#5A8B50] text-center font-semibold text-[calc(16rem/16)] leading-4 mt-4 flex items-center justify-center gap-1">
              <span>@KairoX</span>
              <CopyButton text={telegramLink} icon="/images/icons/ic-copy-tele.svg" />
            </div>
          </div>
        </div>
        <div className="flex gap-24 justify-center pb-6 bg-[#ECECED0A] -mx-3 px-3 pt-3">
          <div className="flex flex-col items-center gap-2.5 cursor-pointer" onClick={handleDownload}>
            <div className="size-12 flex items-center justify-center rounded-full bg-[#232329]">
              {saving ? (
                <Loading />
              ) : (
                <IconDownload className="size-12 rounded-full bg-[#232329]" />
              )}
            </div>
            <div className="text-[#FFFFFFB2] text-[calc(12rem/16)] leading-3">{t('appSettings.saveImage')}</div>
          </div>
          <div className="flex flex-col items-center gap-2.5 cursor-pointer" onClick={openTelegram}>
            <IconTelegramCircle className="size-12 rounded-full bg-[#232329]" />
            <div className="text-[#FFFFFFB2] text-[calc(12rem/16)] leading-3">Telegram</div>
          </div>
        </div>
      </div>
    </BaseBottomDrawer>
  )
}
