import { IconTwitter } from '@components/icon/brands/IconTwitter.tsx'
import { IconTelegram } from '@components/icon/brands/IconTelegram.tsx'
import { IconDiscord } from '@components/icon/brands/IconDiscord.tsx'
import { cn } from '@/lib/utils.ts'
import { SetInvitationCodePopup } from './SetInvitationCodePopup'
import { useState } from 'react'
import { useLoyalty } from './context/LoyaltyContext'
import { useTranslation } from 'react-i18next'

export interface SocialSharingProps {
  className?: string
  showText?: boolean
}

export const SocialSharing = (props: SocialSharingProps) => {
  const { className, showText } = props
  const [isInvitationCodePopupOpen, setIsInvitationCodePopupOpen] = useState(false)
  const { inviteCode, shareUrl } = useLoyalty()
  const { t } = useTranslation()

  const handleClickShare = (type: 'twitter' | 'telegram' | 'discord') => {
    // Check if user has invitation code
    if (!inviteCode || inviteCode === '--') {
      setIsInvitationCodePopupOpen(true)
      return
    }

    // Share text and URL
    const text = t('loyalty.shareText', { inviteLink: '' })
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(shareUrl)

    let shareLink = ''

    switch (type) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break

      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        break

      case 'discord': {
        // Discord doesn't have a direct share URL, so we copy to clipboard
        const fullMessage = `${text}\n${shareUrl}`
        navigator.clipboard.writeText(fullMessage).then(() => {
          // Optionally show a toast notification
          console.log('Copied to clipboard for Discord!')
        })
        // Open Discord web (optional)
        shareLink = 'https://discord.com/channels/@me'
        break
      }

      default:
        return
    }

    // Open share link in new window
    if (shareLink) {
      window.open(shareLink, '_blank')
    }
  }

  return (
    <div className={cn(className)}>
      {showText && <div className="text-sm">{t('loyalty.inviteFriends.shareTo')}</div>}

      <div className="flex items-center mt-2 gap-2">
        <button
          className="size-[50px] rounded-[6px] bg-[#282830] flex items-center justify-center hover:bg-[#323239] transition-colors"
          onClick={() => handleClickShare('twitter')}
          aria-label="Share on Twitter"
        >
          <IconTwitter className="size-5 text-white" />
        </button>
        <button
          className="size-[50px] rounded-[6px] bg-[#282830] flex items-center justify-center hover:bg-[#323239] transition-colors"
          onClick={() => handleClickShare('telegram')}
          aria-label="Share on Telegram"
        >
          <IconTelegram className="size-5 text-white" />
        </button>
        <button
          className="size-[50px] rounded-[6px] bg-[#282830] flex items-center justify-center hover:bg-[#323239] transition-colors"
          onClick={() => handleClickShare('discord')}
          aria-label="Share on Discord"
        >
          <IconDiscord className="size-5 text-white" />
        </button>
      </div>

      <SetInvitationCodePopup open={isInvitationCodePopupOpen} onOpenChange={setIsInvitationCodePopupOpen} />
    </div>
  )
}
