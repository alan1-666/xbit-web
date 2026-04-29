import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loading } from '@components/common/Loading.tsx'
import { RefObject, useImperativeHandle } from 'react'

type ListAppShareType = {
  title: string
  iconUrl: string
  onClick?: () => void
  isHidden?: boolean
  saving?: boolean
}

interface ListAppShareProps {
  onSave: () => void
  text?: string
  url?: string
  shareUrlCard?: string
  saving?: boolean
  hideSaveButton?: boolean
  loadingRef?: RefObject<boolean>
  customShareUrl?: string
}

const ListAppShare = ({
  text,
  url,
  onSave,
  shareUrlCard,
  saving = false,
  hideSaveButton,
  loadingRef,
  customShareUrl,
}: ListAppShareProps) => {
  const { t } = useTranslation()

  const onCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(customShareUrl ? customShareUrl : (url ?? ''))
        .then(() => {
          toast.success(t('toast.copiedSuccess'))
        })
        .catch((err) => {
          console.error('Failed to copy:', err)
        })
    }
  }
  const listApp: ListAppShareType[] = [
    {
      title: 'Twitter(X)',
      iconUrl: '/images/share/icon_twitter.svg',
      onClick: () => {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(url || window.location.href)}`
        window.open(shareUrl, '_blank')
      },
    },
    {
      title: 'Telegram',
      iconUrl: '/images/share/icon-tele.svg',
      onClick: () => {
        const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(url || window.location.href)}`
        window.open(shareUrl, '_blank')
      },
    },
    {
      title: t('detail.myPositions.saveToAlbum'),
      iconUrl: '/images/share/new-copy.svg',
      onClick: onCopy,
      isHidden: hideSaveButton
    },
    {
      title: t('detail.myPositions.saveToAlbum'),
      iconUrl: '/images/share/icon-save.svg',
      onClick: onSave,
      saving,
      isHidden: hideSaveButton
    },
    // {
    //   title: t('detail.myPositions.more'),
    //   iconUrl: '/images/share/icon-more.png',
    //   onClick: () => {
    //     window.navigator
    //       .share?.({
    //         text: text || '',
    //         url: url || window.location.href,
    //       })
    //       .catch((error) => {
    //         console.error('Error sharing:', error)
    //       })
    //   },
    // },
  ]
  return (
    <div className="flex flex-col items-center  justify-center gap-2 pt-3 pb-2 overflow-hidden no-scrollbar">
      <p className="text-[#908E98] text-base">{t('inviteFriends.shareTo')}</p>
      <div className="flex gap-4">
        {listApp.map((item, index) => {
          const handleClick = () => {
            if (item?.onClick) {
              item?.onClick?.()
              return
            }
          }
          return (
            !item?.isHidden && (
              <div
                key={index}
                className="h-10 w-10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleClick}
              >
                {item.saving ? <Loading className="w-10 h-10" /> : <img className="size-6" src={item.iconUrl} alt="icon share" />}
              </div>
            )
          )
        })}
      </div>
    </div>
  )
}

export default ListAppShare
