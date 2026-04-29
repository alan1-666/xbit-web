import { useResponsive } from '@/hooks/useResponsive'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { cn, getPath } from '@/lib/utils'
import { ChainIds } from '@/types/enums'
import { IconRank } from '@components/icon/solid/IconRank.tsx'
import { InviteFriendsPopup } from '@components/loyalty/InviteFriendsPopup.tsx'
import { Button } from '@components/ui/button.tsx'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useLoyalty } from './context/LoyaltyContext'
import { SetInvitationCodePopup } from './SetInvitationCodePopup'
import IntegralMultiplierPopup from './IntegralMultiplierPopup'
import { formatPercent } from '@/lib/format'

export interface ActionItemProps {
  icon: ReactNode
  title: string
  subTitle: string
  action: ReactNode
}

const ActionItem = (props: ActionItemProps) => {
  const { icon, title, subTitle, action } = props
  return (
    <div className="p-3 flex items-center xl:px-7 px:py-6 bg-[#262630] rounded-[10px] xl:rounded-[16px] gap-4">
      {icon}
      <div className="flex-1">
        <div className="text-white text-[calc(16rem/16)] xl:text-[calc(26rem/16)] font-[380]">{title}</div>
        <div className="text-[#A9A9B9] text-[calc(11rem/16)] xl:text-[calc(20rem/16)] font-[305]">{subTitle}</div>
      </div>
      {action}
    </div>
  )
}

export const MyStats = () => {
  const { t } = useTranslation()
  const { inviteCode, shareUrl, status } = useLoyalty()
  const [isInvitePopupOpen, setIsInvitePopupOpen] = useState(false)
  const [isInvitationCodePopupOpen, setIsInvitationCodePopupOpen] = useState(false)
  const [isIntegralMultiplierPopupOpen, setIntegralMultiplierPopupOpen] = useState(false)
  const navigate = useNavigate()
  const { isDesktop } = useResponsive()

  return (
    <div
      className={cn(
        ' h-full flex flex-col rounded-t-[8px] xl:bg-[#262630]',
        isDesktop
          ? 'rounded-[16px] bg-[#262630]'
          : 'bg-[linear-gradient(180deg,_#141418_0%,_rgba(20,_20,_24,_0)_100%)]',
      )}
    >
      <div className="flex items-center gap-3 py-4 px-3 xl:py-[26px] xl:px-8">
        <IconRank className="size-6 xl:size-11" />
        <div className="text-white text-[calc(14rem/16)] xl:text-[calc(24rem/16)] font-[305]">
          {t('loyalty.myRank')}：
          <span className="text-[calc(18rem/16)] font-[450] xl:text-[calc(30rem/16)]">
            {status?.currentRank ? `#${status?.currentRank}` : '--'}
          </span>
        </div>
      </div>
      <div className="px-3 py-4 bg-[#1F1F26] flex flex-col flex-1 rounded-[8px] gap-7 mx-3 xl:py-7 xl:px-6 xl:mx-0 xl:rounded-[16px]">
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-2 w-full">
            <div className="flex flex-col items-center border-r">
              <div className="text-[calc(24rem/16)] xl:text-[calc(36rem/16)] text-white font-[380]">
                {formatPercent(status?.pointPercent || 0)}
              </div>
              <div className="text-[calc(14rem/16)] xl:text-[calc(20rem/16)] text-[#A9A9B9] font-[305]">
                {t('loyalty.myShare')}
              </div>
            </div>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setIntegralMultiplierPopupOpen(true)}
            >
              <div className="text-[calc(24rem/16)] xl:text-[calc(36rem/16)] text-white font-[380]">
                {status?.boost ? `${status?.boost?.toFixed(1)}X` : '--'}
              </div>
              <div className="text-[calc(14rem/16)] xl:text-[calc(20rem/16)] text-[#A9A9B9] font-[305] underline underline-offset-4 decoration-dotted">
                {t('loyalty.pointsBonus')}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <ActionItem
            icon={
              <img src="/images/loyalty/trade-loyalty-icon.svg" className={!isDesktop ? 'w-[39px] h-[37px]' : ''} />
            }
            title={t('loyalty.trade')}
            subTitle={t('loyalty.tradeEarnPoints')}
            action={
              <Button
                className="bg-impartal text-white rounded-full px-6"
                onClick={() => {
                  if (inviteCode) {
                    navigate(`/futures/BTC`)
                  } else {
                    setIsInvitationCodePopupOpen(true)
                  }
                }}
              >
                {t('loyalty.goTrade')}
              </Button>
            }
          />
          <ActionItem
            icon={<img src="/images/loyalty/icon_invite.svg" className={!isDesktop ? 'w-[39px] h-[37px]' : ''} />}
            title={t('loyalty.invite')}
            subTitle={t('loyalty.inviteEarnPoints')}
            action={
              <Button
                className="bg-impartal text-white rounded-full px-6"
                onClick={() => {
                  if (inviteCode) {
                    setIsInvitePopupOpen(true)
                  } else {
                    setIsInvitationCodePopupOpen(true)
                  }
                }}
              >
                {t('loyalty.goInvite')}
              </Button>
            }
          />
        </div>
      </div>
      <InviteFriendsPopup
        open={isInvitePopupOpen}
        onOpenChange={setIsInvitePopupOpen}
        invitationCode={inviteCode}
        shareUrl={shareUrl}
      />
      <SetInvitationCodePopup open={isInvitationCodePopupOpen} onOpenChange={setIsInvitationCodePopupOpen} />
      <IntegralMultiplierPopup open={isIntegralMultiplierPopupOpen} onOpenChange={setIntegralMultiplierPopupOpen} />
    </div>
  )
}
