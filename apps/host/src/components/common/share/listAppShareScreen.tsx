import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { toast } from 'sonner'

type ListAppShareScreenType = {
  title: string
  url: string
  iconUrl: string
  onClick?: () => void
}

interface ListAppShareScreenProps {
  onSave: () => void
  setOpen?: (open: boolean) => void
}

const ListAppShareScreen = ({ onSave, setOpen }: ListAppShareScreenProps) => {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()

  const handleCopyUrl = async () => {
    const currentUrl = window.location.href
    const success = await copyToClipboard(currentUrl)
    setOpen?.(false)
    if (success) {
      toast.success(t('detail.myPositions.copyUrlSuccess', 'URL copied to clipboard!'))
    } else {
      toast.error(t('detail.myPositions.copyUrlError', 'Failed to copy URL'))
    }
  }

  const listApp: ListAppShareScreenType[] = [
    {
      title: t('detail.myPositions.saveToAlbum'),
      url: '/',
      iconUrl: '/images/share/icon-save-local.png',
      onClick: onSave,
    },
    {
      title: t('detail.myPositions.copyUrl', 'Copy URL'),
      url: '/',
      iconUrl: '/images/icons/icon-copy.svg',
      onClick: handleCopyUrl,
    },
    {
      title: 'Twitter(X)',
      url: '/',
      iconUrl: '/images/share/icon-x.png',
    },
    {
      title: 'Telegram',
      url: '/',
      iconUrl: '/images/share/icon-tele.png',
    },
  ]
  return (
    <div className="flex items-center gap-8  p-3 overflow-x-auto _hidescrollbar">
      {listApp.map((item, index) => {
        const handleClick = () => {
          if (item?.onClick) {
            item?.onClick?.()
            return
          }
        }
        return (
          <div key={index} className="flex flex-col items-center gap-2.5 cursor-pointer" onClick={handleClick}>
            <img className="w-12 h-12 min-w-12" src={item.iconUrl} alt="icon share" />
            <span className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] text-center leading-3">
              {item.title}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ListAppShareScreen
