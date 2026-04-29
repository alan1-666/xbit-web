import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import { useActiveAccount } from '@hooks/useActiveAccount.ts'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { ShareXbitDrawer } from '@components/settings/ShareXbitDrawer.tsx'
import { APP_PATH } from '@/lib/constant.ts'

interface DownloadAppModalProps {
  isOpen: boolean
  onClose: () => void
  onDownload?: () => void
}

const DownloadAppModal = ({ isOpen, onClose, onDownload }: DownloadAppModalProps) => {
  const { t } = useTranslation()
  const activeAccount = useActiveAccount()
  const [showShare, setShowShare] = useState(false)
  const qrValue = typeof window !== 'undefined' ? `${window.location.origin}/go-to-store.html` : ''
  const handleDownload = () => {
    onDownload?.()
    window.open(APP_PATH.DOWNLOAD_APP, '_blank')
  }
  const handleShare = () => {
    const isLoggedIn = !!activeAccount && !!ServiceConfig.token
    if (!isLoggedIn) {
      toast.warning(t('appSettings.loginRequired'))
      return
    }
    setShowShare(true)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/90" onClick={onClose} />

        <div className="relative rounded-[20px] bg-[#1E0000] border border-[#8D0808] shadow-[0_0_30px_rgba(172,0,0,0.4)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[80px] rounded-[50%] bg-[#AC0000] opacity-80 blur-[60px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[360px] h-[60px] rounded-[50%] bg-[#AC0000] opacity-80 blur-[60px]" />
          {/* 左上角背景图 */}
          {/* <img
            src="/images/redpacket/lantern-bg-left-top.png"
            alt="lantern"
            className="absolute -top-8 -left-8 rotate-[-15deg]"
          /> */}
          {/* <img
            src="/images/redpacket/lantern-sm.png"
            alt="lantern"
            className="absolute -top-1 -left-5 w-[102px] h-auto"
          /> */}
          <img
            src="/images/redpacket/redpackets.png?v=1"
            alt="packets"
            className="absolute -top-20 left-1/2 -translate-x-1/2 mx-auto block h-[220px] object-contain pointer-events-none select-none"
          />

          <img
            src="/images/redpacket/close-btn.svg"
            alt="close"
            className="w-4 h-4 absolute top-6 right-6 z-20 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onClose}
          />

          <div className="relative z-10 flex flex-col h-full px-7 pt-30 pb-12">
            <div className="max-w-[360px] mx-auto text-center">
              <h3 className="text-white text-[26px] leading-snug font-extrabold">
                {t('red.packet.lantern.festival.title_app')}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#FFA0A0]">{t('red.packet.downloadAppModal.subtitle_1')}</p>
              <p className="text-sm leading-6 text-[#FFA0A0]">{t('red.packet.downloadAppModal.subtitle_2')}</p>
            </div>

            <div className="mt-4 flex gap-4 items-stretch">
              <div className="w-[140px] bg-white rounded-[20px] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col items-center">
                <div className="bg-[#ECECED14] px-2 rounded-[20px]">
                  <QRCodeCanvas
                    value={qrValue}
                    size={120}
                    marginSize={2}
                    imageSettings={{
                      src: '',
                      height: 25,
                      width: 25,
                      excavate: true,
                    }}
                    className="rounded-[10px]"
                  />
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-[#000]">{t('red.packet.downloadAppModal.qrTitle')}</div>
                  <div className="text-base font-semibold text-[#101010]">
                    {t('red.packet.downloadAppModal.qrSubtitle')}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 w-full rounded-[16px] bg-white px-5 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex flex-col items-start justify-center">
                    <div className="flex w-full items-center justify-center gap-2 text-xl font-semibold text-[#000] text-center">
                      <img src="/images/redpacket/download-icon.svg" alt="" className="w-5 h-5" />
                      {t('red.packet.downloadAppModal.download')}
                    </div>
                    <span className="mt-0.5 text-sm text-[#6C6C6C]">App Store / Google Play</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 w-full rounded-[16px] bg-white px-5 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3 justify-center">
                    <div className="flex flex-col items-start justify-center">
                      <span className="flex items-center gap-2 text-xl font-semibold text-[#000]">
                        <img src="/images/redpacket/share-icon.svg" alt="" className="w-5 h-5" />
                        {t('red.packet.downloadAppModal.share')}
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-sm text-[#6C6C6C]">
                        {t('red.packet.downloadAppModal.shareNote')}
                        <div className="bg-[#6C6C6C] w-[12px] h-[12px] pl-[1px] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                            <path
                              d="M0.75 0.75L3.75 3.75L0.75 6.75"
                              stroke="white"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareXbitDrawer open={showShare} setOpen={setShowShare} />
    </>
  )
}

export default DownloadAppModal
