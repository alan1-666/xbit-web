import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type ListAppShareType = {
  title: string
  iconUrl: string
  onClick?: () => void
  isHidden?: boolean
}

interface ListAppShareProps {
  text?: string
  url?: string
  shareUrlCard: string
  onShowQr: () => void
}

const ListAppShare = ({ text, url, shareUrlCard, onShowQr }: ListAppShareProps) => {
  const { t } = useTranslation()
  const onCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(shareUrlCard ?? '')
        .then(() => {
          toast.success(t('toast.copiedSuccess'))
        })
      }
    }


  // 检查是否支持 Web Share API
  const isWebShareSupported = () => {
    return typeof navigator !== 'undefined' && 
           'share' in navigator && 
           window.isSecureContext &&
           typeof navigator.share === 'function'
  }

  // 优化的系统分享功能
  const handleSystemShare = async () => {
    console.log(text, shareUrlCard,'text, shareUrlCard')
    
    try {
      // 检查是否支持 Web Share API
      if (isWebShareSupported()) {
        const shareData = {
          text: text || '',
          url: shareUrlCard || window.location.href,
        }
        
        // 确保在用户交互事件中调用
        await navigator.share(shareData)
      } else {
        // 降级方案：复制链接并提示
        if (shareUrlCard) {
         onCopy()
          toast.info('系统分享不可用，已为您复制链接，请手动分享')
        } else {
          toast.error('分享功能不可用')
        }
      }
    } catch (error: any) {

    }
  }
  

  const listApp: ListAppShareType[] = [
    {
      title: 'Discord',
      iconUrl:  '/images/share/icon-discord.png',
      onClick: () => {
         const shareUrl = `https://discord.com/invite/xbit?text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(shareUrlCard)}`
        window.open(shareUrl, '_blank')
      },
    },
    {
      title: 'Twitter(X)',
      iconUrl: '/images/share/icon-x.png',
      onClick: () => {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(shareUrlCard)}`
        window.open(shareUrl, '_blank')
      },
    },
    {
      title: 'Telegram',
      iconUrl: '/images/share/icon-tele.png',
      onClick: () => {
        const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(shareUrlCard)}`
        window.open(shareUrl, '_blank')
      },
    },
    // {
    //   title: t('inviteFriends.qrCode'),
    //   iconUrl: '/images/share/qr-code.svg',
    //   onClick: () => {
    //     onShowQr()
    //   },
    // },
    {
      title: t('detail.myPositions.more'),
      iconUrl: '/images/share/icon-more.png',
      onClick: handleSystemShare,
    },
  ]
  return (
    <div className="flex items-center justify-center gap-4 py-3 overflow-hidden no-scrollbar">
      {listApp.map((item, index) => {
        const handleClick = () => {
          if (item?.onClick) {
            item?.onClick?.()
            return
          }
        }
        return (
          !item?.isHidden && (
            <div key={index} className="flex flex-col w-[80px] items-center gap-2 cursor-pointer" onClick={handleClick}>
              <img className="w-12 h-12 min-w-12" src={item.iconUrl} alt="icon share" />
              <span className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] text-center leading-3">
                {item.title}
              </span>
            </div>
          )
        )
      })}
    </div>
  )
}

export default ListAppShare
