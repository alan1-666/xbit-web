import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog.tsx'
import { IconWithValue } from '@pages/meme/discover/desktop/components/IconWithValue.tsx'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const items = [
  {
    key: 'android',
    icon: '/images/download/download-on-google-play.svg',
    label: 'Google Play',
    url: 'https://play.google.com/store/apps/details?id=com.xtech.xbitmobile&hl=en',
  },
  {
    key: 'ios',
    icon: '/images/download/download-on-app-store.svg',
    label: 'App Store',
    url: 'https://apps.apple.com/vn/app/xbit-buy-bitcoin-meme-coins/id6747072897',
  },
]

export const DownloadAppDialog = () => {
  const { t } = useTranslation()
  const [activeItem, setActiveItem] = useState<'android' | 'ios'>('android')
  const selectedItem = useMemo(() => {
    return items.find((item) => item.key === activeItem) || items[0]
  }, [activeItem])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconWithValue
          icon={<img src="/images/icons/ic-gift.png" alt="" />}
          value={t('bottomNav.downloadApp')}
          className="cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent>
        <div className="flex items-center flex-shrink-0 gap-2 cursor-pointer">
          <img src="/images/xbit-logo.svg" alt="logo" className="cursor-pointer block" />
          <img src="/images/logo-xbit-text.svg" alt="logo" className="cursor-pointer h-7" />
        </div>
        <div>
          <div className="text-white font-[630] text-[18px] text-shadow-black text-shadow-md">
            {t('assets.splash.slogan')}
          </div>
          <div className="text-white text-[16px] text-shadow-black text-shadow-md ">{t('assets.splash.sub')}</div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col justify-center gap-4">
            {items.map((item) => (
              <div
                key={item.key}
                className={`flex items-center cursor-pointer ${
                  activeItem === item.key ? '' : 'grayscale-100 opacity-50'
                }`}
                onClick={() => setActiveItem(item.key as 'android' | 'ios')}
              >
                <img src={item.icon} alt={item.label} className="w-full" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#ECECED14] p-2 rounded-[20px] relative">
              <QRCodeCanvas
                value={selectedItem?.url}
                size={200}
                marginSize={2}
                imageSettings={{
                  src: '/images/xbit-logo-rounded.svg',
                  height: 35,
                  width: 35,
                  excavate: true,
                }}
                className="rounded-[10px]"
              />
            </div>
            <a href={selectedItem.url} target="_blank" className="text-blue-500 text-sm underline text-center">
              Open in {selectedItem.label}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
