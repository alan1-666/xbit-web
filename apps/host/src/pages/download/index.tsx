import { IconApple } from '@components/icon/brands/IconApple.tsx'
import { IconGooglePlay } from '@components/icon/brands/IconGooglePlay.tsx'
import { QRCodeCanvas } from 'qrcode.react'
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'
import IconApk from '@/components/icon/brands/IconApk'
import IconArrowUpRight from '@/components/icon/stroke/IconArrowUpRight'
import { useLinkConfigs } from '@/hooks/useLinkConfigs'

export const DownloadPage = () => {
  const { t } = useTranslation()
  const { value: apkUrl, loading } = useLinkConfigs('url_apk')
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-b from-zinc-100 to-gray-200 p-5 md:p-14">
      {/* <Link to="/">
        <div>
          <LogoWithText className="mb-5 h-16" />
        </div>
      </Link> */}
      <div className="size-full overflow-y-auto no-scrollbar flex flex-col">
        <div className="flex flex-col flex-1">
          <div className="md:flex-1 w-full md:max-w-1/2 flex flex-col justify-center">
            <div className="flex flex-col justify-start items-start gap-5">
              <div className="w-full md:w-96 justify-start text-black text-4xl md:text-6xl font-bold leading-[40px] md:leading-[67.20px] tracking-wide">
                {t('download.title')}
              </div>
              <div className="self-stretch justify-start text-black text-xl md:text-2xl leading-9 mb-8">
                {t('download.subtitle')}
              </div>
            </div>
            <div className="w-full md:max-w-[500px]">
              <div className="w-full p-5 pt-4 bg-white rounded-2xl inline-flex justify-between items-end mb-4">
                <div className="justify-start text-black text-xl leading-loose tracking-tight">
                  {t('download.scanToDownload')}
                </div>
                <QRCodeCanvas
                  value={`${window.location.origin}/go-to-store.html`}
                  size={124}
                  marginSize={1}
                  imageSettings={{
                    src: '/favicon.png',
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                  className="rounded-[10px]"
                />
              </div>
              <div className="w-full block md:flex justify-start items-center gap-4 space-y-4 lg:space-y-0">
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex-1 block group">
                  <div className="flex-1 h-30 md:h-40 pl-4 pr-5 pt-4 pb-5 rounded-2xl flex-col flex justify-between items-start bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 active:scale-[0.98]">
                    <div className="flex items-center justify-between w-full">
                      <div className="transition-transform duration-300 group-hover:scale-110 origin-left">
                        <IconApple />
                      </div>
                      <IconArrowUpRight className="text-[#101010] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                    <div className="justify-start text-black text-xl leading-loose tracking-tight">
                      {t('download.openAppStore')}
                    </div>
                  </div>
                </a>
                <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="flex-1 block group">
                  <div className="flex-1 h-30 md:h-40 pl-4 pr-5 pt-4 pb-5 rounded-2xl flex-col flex justify-between items-start bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 active:scale-[0.98]">
                    <div className="flex items-center justify-between w-full">
                      <div className="transition-transform duration-300 group-hover:scale-110 origin-left">
                        <IconGooglePlay />
                      </div>
                      <IconArrowUpRight className="text-[#101010] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                    <div className="justify-start text-black text-xl leading-loose tracking-tight">
                      {t('download.openGooglePlay')}
                    </div>
                  </div>
                </a>
              </div>
              <a
                className={`w-full py-5.5 px-4 rounded-2xl inline-flex justify-between items-end mt-4 group transition-all duration-300 ${
                  loading || !apkUrl
                    ? 'bg-white/60 cursor-not-allowed opacity-70'
                    : 'bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 active:scale-[0.98]'
                }`}
                href={loading || !apkUrl ? undefined : apkUrl}
                target={loading || !apkUrl ? undefined : '_blank'}
                rel={loading || !apkUrl ? undefined : 'noopener noreferrer'}
                onClick={(e) => {
                  if (loading || !apkUrl) {
                    e.preventDefault()
                  }
                }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div
                    className={`transition-transform duration-300 origin-left ${loading || !apkUrl ? '' : 'group-hover:scale-110'}`}
                  >
                    <IconApk />
                  </div>
                  <p className="text-black text-xl leading-normal tracking-tight">APK</p>
                  <IconArrowUpRight
                    className={`text-[#101010] ml-auto w-6 h-6 transition-transform duration-300 ${loading || !apkUrl ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`}
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 absolute right-0 bottom-0 top-1/3 hidden md:block lg:top-0">
        <img src="/images/hero-image.webp" className="size-full object-cover" alt="" />
      </div>
    </div>
  )
}
