import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

interface CountdownModalProps {
  isOpen: boolean
  onOpenChange?: (status: boolean, action: 'cancel' | 'confirm') => void
  onClickShare?: () => void
  onClickApp?: () => void
  appDownloadUrl?: string
  shareText?: string
}

// 关闭按钮组件
const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="absolute right-[17px] top-[15px] z-20">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <g clipPath="url(#clip0)">
        <path d="M8.5359 7.50001L14.7562 13.7203C15.0423 14.0064 15.0423 14.47 14.7562 14.7561C14.4701 15.0422 14.0065 15.0422 13.7204 14.7561L7.50011 8.5358L1.2798 14.7563C0.993713 15.0423 0.53009 15.0423 0.244006 14.7563C-0.0420776 14.4702 -0.0420776 14.0066 0.244006 13.7205L6.46432 7.50001L0.24386 1.2797C-0.0422241 0.993616 -0.0422241 0.529994 0.24386 0.24388C0.386975 0.100765 0.574329 0.0292807 0.761829 0.0292807C0.949329 0.0292807 1.13668 0.100765 1.2798 0.243733L7.50011 6.46422L13.7204 0.24388C13.8634 0.100912 14.0509 0.0294266 14.2384 0.0294266C14.4259 0.0294266 14.6132 0.100912 14.7564 0.24388C15.0425 0.529994 15.0425 0.993616 14.7564 1.2797L8.5359 7.50001Z" fill="#FF7473" />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="15" height="15" fill="white" transform="matrix(1 0 0 -1 0 15)" />
        </clipPath>
      </defs>
    </svg>
  </button>
)

// 装饰图片组件
const DecorativeImages = () => (
  <>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[80px] rounded-[50%] bg-[#AC0000] opacity-80 blur-[60px]" />
    {/* <img
      src="/images/redpacket/lantern-bg-left-top.png"
      alt="lantern"
      className="absolute -top-8 -left-8 rotate-[-15deg]"
    /> */}
    {/* <img
      src="/images/redpacket/lantern-sm.png"
      alt="lantern"
      className="absolute -top-5 -left-5 w-[78px] h-auto"
    /> */}
    <img
      src="/images/redpacket/redpackets.png"
      alt="packets"
      className="absolute -top-20 left-1/2 -translate-x-1/2 mx-auto block h-[150px] object-contain pointer-events-none select-none"
    />
  </>
)

// 标题组件
const Title = () => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center flex-col text-white text-2xl font-semibold text-center mb-2 pt-[20px]">
      {/* <p>KairoX元宵节</p>
      <p>APP专属红包</p> */}
      {t('red.packet.lantern.festival.title_app')}
    </div>
  )
}

// 描述文本组件
const Description = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col justify-center items-center mb-7">
      <div className="text-[#FFA0A0] text-sm font-normal">
        {t('red.packet.downloadAppModal.subtitle_1')}
      </div>
      <div className="text-[#FFA0A0] text-sm font-normal">
        {t('red.packet.downloadAppModal.subtitle_2')}
      </div>
    </div>
  )
}

// 二维码组件
const QRCodeSection = ({ url = 'https://app.xbit.com/apps' }: { url?: string }) => {
  const { t } = useTranslation()
  return (
  <div className="w-28 h-full relative mr-2 bg-white rounded-xl flex flex-col items-center">
    <div className="w-26 h-26 flex items-center justify-center mt-1 mb-2">
      <QRCodeCanvas value={url} style={{ width: '90%', height: '90%' }} level="H" />
    </div>
    <div className="text-center justify-start text-black text-base font-semibold leading-5">
      {t('red.packet.downloadAppModal.qrTitle')}<br />
    </div>
    <div className="text-center justify-start text-black text-xs font-semibold leading-5">
      {t('red.packet.downloadAppModal.qrSubtitle')}
    </div>
  </div>
)
}

// 操作卡片组件
interface ActionCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick?: () => void
  showArrow?: boolean
}

const ActionCard = ({ icon, title, subtitle, onClick, showArrow = false }: ActionCardProps) => (
  <div 
    className="w-40 h-full bg-white rounded-lg p-3 flex flex-col py-4.5 cursor-pointer hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-start gap-2 mb-3.5">
      {icon}
      <span className="text-black text-lg font-semibold leading-4">{title}</span>
    </div>
    <div className="flex items-center">
      <div className="text-neutral-500 text-xs font-semibold leading-3">
        {subtitle}
      </div>
      {showArrow && (
        <div className="min-w-2.5 min-h-2.5 bg-[#6C6C6C] rounded-full ml-1.5 flex items-center justify-center">
          <svg width="4" height="6" viewBox="0 0 4 6" fill="none">
            <path d="M0.5 0.5L3.5 3L0.5 5.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  </div>
)

const CountdownModal = ({ 
  isOpen, 
  onOpenChange, 
  onClickShare, 
  onClickApp,
  appDownloadUrl = 'https://app.xbit.com/apps',
  shareText = '邀请好友一起抢红包'
}: CountdownModalProps) => {
  const { t } = useTranslation()
  
  const handleOpenChange = (status: boolean, action: 'cancel' | 'confirm' = 'cancel') => {
    if (onOpenChange) {
      onOpenChange(status, action)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="rounded-[22px] border-2 w-[309px] min-h-[385px] border-[#8D0808] bg-gradient-to-b from-[#470000] to-[#1E0000] shadow-[0_4px_30px_0_rgba(212,9,9,0.87)] max-w-[400px] py-4 px-0" 
        showDialogPrimitiveClose={false}
      >
        <DecorativeImages />
        <CloseButton onClick={() => handleOpenChange(false)} />

        <div className='px-4 flex flex-col justify-center items-center relative'>
          <Title />
          <Description />

          <div className="flex items-center">
            <QRCodeSection url={appDownloadUrl} />

            <div className="space-y-2 min-h-19">
              <ActionCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6.00125 13.2755C6.00125 13.5463 5.89595 13.8061 5.7085 13.9976C5.52105 14.1891 5.26682 14.2966 5.00173 14.2966H4.0022C3.0234 14.2977 2.07825 13.9318 1.34583 13.2685C0.613421 12.6052 0.144645 11.6904 0.0283366 10.6976C-0.0879713 9.70474 0.156271 8.7028 0.714779 7.88164C1.27329 7.06048 2.10726 6.47715 3.05865 6.24219C3.2529 4.68993 3.94037 3.24567 5.01557 2.13103C6.09076 1.0164 7.49427 0.29298 9.01072 0.071784C10.5272 -0.149412 12.0728 0.143839 13.4104 0.906535C14.7479 1.66923 15.8036 2.85923 16.4153 4.29393C17.5685 4.64117 18.5605 5.40146 19.2095 6.43538C19.8584 7.4693 20.1207 8.70754 19.9484 9.92305C19.776 11.1386 19.1805 12.2499 18.2711 13.0532C17.3617 13.8565 16.1992 14.298 14.997 14.2966C14.7319 14.2965 14.4777 14.1888 14.2904 13.9972C14.103 13.8056 13.9978 13.5458 13.998 13.275C13.9981 13.0042 14.1035 12.7445 14.2911 12.5531C14.4786 12.3617 14.7329 12.2543 14.998 12.2544C15.7197 12.256 16.4178 11.9915 16.964 11.5096C17.5102 11.0277 17.868 10.3607 17.9717 9.63107C18.0753 8.90141 17.9179 8.15803 17.5283 7.5374C17.1386 6.91677 16.543 6.46052 15.8506 6.2524L14.957 5.98283L14.5842 5.11081C14.1475 4.08581 13.3937 3.23551 12.4384 2.69038C11.4831 2.14526 10.3791 1.93543 9.29577 2.09309C8.21247 2.25076 7.20974 2.76721 6.44146 3.5632C5.67318 4.35918 5.18179 5.39072 5.04271 6.49951L4.86979 7.89637L3.53042 8.22721C3.05793 8.34807 2.6448 8.64084 2.3685 9.05062C2.0922 9.46041 1.97169 9.95908 2.02957 10.4532C2.08745 10.9472 2.31974 11.4028 2.68289 11.7344C3.04605 12.066 3.51513 12.2509 4.0022 12.2544H5.00173C5.26682 12.2544 5.52105 12.362 5.7085 12.5535C5.89595 12.745 6.00125 13.0047 6.00125 13.2755ZM13.5377 15.3657C13.7251 15.5572 13.8303 15.8169 13.8303 16.0877C13.8303 16.3584 13.7251 16.6181 13.5377 16.8096L10.705 19.7013C10.3142 20.0996 9.68151 20.0996 9.29069 19.7013L6.45804 16.8096C6.27596 16.617 6.17522 16.3591 6.1775 16.0913C6.17977 15.8236 6.28489 15.5675 6.47021 15.3782C6.65553 15.1888 6.90623 15.0815 7.1683 15.0791C7.43037 15.0768 7.68285 15.1797 7.87137 15.3657L8.99983 16.5186V8.17003C8.99983 7.89922 9.10514 7.6395 9.29259 7.448C9.48003 7.25651 9.73427 7.14893 9.99936 7.14893C10.2644 7.14893 10.5187 7.25651 10.7061 7.448C10.8936 7.6395 10.9989 7.89922 10.9989 8.17003V16.5155L12.1244 15.3657C12.3118 15.1743 12.566 15.0668 12.831 15.0668C13.0961 15.0668 13.3502 15.1743 13.5377 15.3657Z" fill="#F30B03" />
                  </svg>
                }
                title={t('red.packet.downloadAppModal.download')}
                subtitle="App Store/Google Play"
                onClick={onClickApp}
              />

              <ActionCard
                icon={
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                    <path d="M8.56912 1.58331C8.78065 1.58354 8.98412 1.66116 9.13793 1.80032C9.29175 1.93947 9.38432 2.12966 9.39671 2.33203C9.40911 2.53439 9.34041 2.73366 9.20463 2.8891C9.06886 3.04455 8.87628 3.14445 8.66622 3.1684L8.56995 3.17396H7.80722C6.64627 3.17409 5.53038 3.60458 4.69315 4.3753C3.85592 5.14603 3.36228 6.19724 3.31556 7.30886L3.31141 7.48224V11.5177C3.31155 12.6304 3.76089 13.6998 4.56534 14.5022C5.36979 15.3045 6.46697 15.7774 7.62713 15.822L7.80722 15.826H12.0184C13.1796 15.8261 14.2958 15.3956 15.1333 14.6246C15.9707 13.8537 16.4644 12.8022 16.5109 11.6903L16.5142 11.5177V10.9212C16.5125 10.7173 16.5927 10.5205 16.7381 10.3716C16.8835 10.2226 17.083 10.1329 17.2955 10.121C17.508 10.109 17.7171 10.1758 17.8797 10.3074C18.0423 10.439 18.1459 10.6254 18.1691 10.8282L18.1741 10.9204V11.5169C18.1743 13.0478 17.5535 14.5188 16.4427 15.6192C15.332 16.7195 13.8184 17.3629 12.2217 17.4135L12.0184 17.4166H7.80722C6.20983 17.4164 4.67508 16.8212 3.5272 15.7567C2.37932 14.6921 1.70821 13.2417 1.65566 11.7118L1.65234 11.5177V7.48224C1.65212 5.95134 2.27297 4.48032 3.3837 3.38C4.49444 2.27969 6.00805 1.63627 7.60472 1.5857L7.80722 1.58331H8.56995H8.56912ZM15.4212 2.62121C15.8398 2.62129 16.2429 2.77294 16.5498 3.04579C16.8567 3.31863 17.0447 3.69253 17.0761 4.09256L17.081 4.21186V7.39555C17.0806 7.59819 16.9995 7.79304 16.8542 7.94029C16.7089 8.08754 16.5104 8.17609 16.2993 8.18786C16.0882 8.19964 15.8804 8.13375 15.7182 8.00364C15.5561 7.87354 15.4519 7.68903 15.427 7.48781L15.4212 7.39555V5.34679L10.3112 10.2436C10.1615 10.3874 9.96016 10.4709 9.74833 10.477C9.5365 10.4831 9.33027 10.4113 9.17192 10.2763C9.01357 10.1413 8.91509 9.95344 8.89668 9.75112C8.87827 9.54881 8.94131 9.34741 9.07289 9.18821L9.1368 9.11822L14.2576 4.21107H12.0989C11.8873 4.21084 11.6839 4.13322 11.5301 3.99406C11.3762 3.85491 11.2837 3.66472 11.2713 3.46235C11.2589 3.25999 11.3276 3.06073 11.4634 2.90528C11.5991 2.74983 11.7917 2.64993 12.0018 2.62598L12.0989 2.62121H15.4212Z" fill="#F30B03" stroke="#F30B03" strokeWidth="0.5" />
                  </svg>
                }
                title={t('red.packet.downloadAppModal.share')}
                subtitle={t('red.packet.downloadAppModal.shareNote')}
                onClick={onClickShare}
                showArrow={true}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CountdownModal