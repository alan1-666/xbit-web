import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState, useEffect, memo } from 'react'
import { Button } from '@/components/ui/button'
import ls from '@/lib/local-storage'
import { useResponsive } from '@/hooks/useResponsive'
import { Drawer, DrawerContent } from '../ui/drawer'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { USER_BIND_INVITE, VERIFY_INVITATION_CODE } from '@/services/agent.dex.service'
import { isArray } from 'lodash-es'
import PassPhaseComponent from '../auth/ManagementWallets/PassPhaseComponent'
import { useAppSelector } from '@/redux/store'

const INVITATION_CODE_KEY = 'futures_inviteCode'

const errorCodes = [
  'INVITATION_CODE_NOT_FOUND',
  'SELF_REFERRAL_NOT_ALLOWED',
  'REFERRAL_ALREADY_EXISTS',
  'CIRCULAR_REFERRAL',
]
const InvitationRelationshipConfirmationPopup = () => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const isFirstLogin = useAppSelector((state) => state.newWallet.isFirstLogin)
  const [invitationCode, setInvitationCode] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [showNmemonicPhrasePopup, setShowNmemonicPhrasePopup] = useState(false)

  useEffect(() => {
    const storedCode = ls.get(INVITATION_CODE_KEY)?.trim()

    if (storedCode && storedCode.length > 0) {
      setInvitationCode(storedCode)
      validateInvitationCode(storedCode)
    } else handleShowNmemonicPhrasePopup()
  }, [isFirstLogin])

  const onCreateReferral = async () => {
    if (!invitationCode || isLoading) return
    setIsLoading(true)
    try {
      await agentDexClient.mutate({
        mutation: USER_BIND_INVITE,
        variables: {
          input: {
            invitationCode: invitationCode,
          },
        },
      })
      toast.success(t('referral.confirmNotification'), { duration: 1000 })
    } catch (err) {
      if (isArray(err)) {
        const firstError = err[0]
        if (firstError.code !== 'REFERRAL_ALREADY_EXISTS') {
          setOpen(true)
        } else {
          ls.remove(INVITATION_CODE_KEY)
        }
        const error = errorCodes.includes(firstError.code) ? firstError.code : 'fail'
        toast.error(t(`referral.error.${error}`, { duration: 3000 }))
      }
    }
    setIsLoading(false)
    setOpen(false)
    ls.remove(INVITATION_CODE_KEY)
    handleShowNmemonicPhrasePopup()
  }

  const onCancelReferral = () => {
    ls.remove(INVITATION_CODE_KEY)
    setOpen(false)
    toast.error(t('referral.cancelNotification'), { duration: 3000 })
    handleShowNmemonicPhrasePopup()
  }
  const validateInvitationCode = async (code: string) => {
    try {
      await agentDexClient.query({
        query: VERIFY_INVITATION_CODE,
        variables: {
          invitationCode: code,
        },
      })
      setOpen(true)
    } catch (err) {
      if (isArray(err)) {
        const firstError = err[0]
        if (firstError.code !== 'REFERRAL_ALREADY_EXISTS') {
          setOpen(true)
        } else {
          ls.remove(INVITATION_CODE_KEY)
        }
      }
    }
  }

  const handleShowNmemonicPhrasePopup = () => {
    if (isFirstLogin) {
      setShowNmemonicPhrasePopup(true)
    }
  }
  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="px-0 py-2 bg-[#212127]" showDialogPrimitiveClose={false}>
            <Content
              invitationCode={invitationCode}
              onCancelReferral={onCancelReferral}
              onCreateReferral={onCreateReferral}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="w-full max-w-[768px] mx-auto bg-[#232329]">
            <Content
              invitationCode={invitationCode}
              onCancelReferral={onCancelReferral}
              onCreateReferral={onCreateReferral}
              isLoading={isLoading}
            />
          </DrawerContent>
        </Drawer>
      )}
      {showNmemonicPhrasePopup && <PassPhaseComponent />}
    </>
  )
}

interface ContentProps {
  invitationCode: string | undefined
  onCancelReferral: () => void
  onCreateReferral: () => void
  isLoading?: boolean
}
const Content = ({ invitationCode, isLoading, onCancelReferral, onCreateReferral }: ContentProps) => {
  const { t } = useTranslation()
  return (
    <>
      <div className="p-5">
        <h2 className="text-white font-medium mb-4 text-[16px]"> {t('referral.title')}</h2>
        <p className="text-white font-light mb-6 text-sm">{t('referral.content')}</p>
        <div className="flex gap-3 items-center justify-center mb-3">
          <div
            className="flex bg-[#373640] h-14 items-center 
              justify-center rounded-[10px] px-5"
          >
            {invitationCode?.split('').map((char, index) => (
              <div
                key={index}
                className="flex items-center
               text-white text-[16px] font-semibold font-['Geist']"
              >
                {char}
                {index < invitationCode.length - 1 && (
                  <div
                    className="w-[2px] 
                    h-[2px] bg-[#605E68] rounded-full mx-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="self-stretch flex flex-row items-start gap-3 mt-6">
          <Button
            variant="close"
            type="button"
            className="max-w-1/2 rounded-full p-[2px] h-11 flex-1 w-full bg-[#2B2B33] flex items-center justify-center
              font-['Geist'] text-white text-[16px] border-0 !font-[400]"
            onClick={onCancelReferral}
          >
            {t('referral.cancel')}
          </Button>
          <Button
            isLoading={isLoading}
            variant="gradient"
            className="purple-btn-gradient !text-white rounded-[200px] border-solid border-[1px] h-11 w-full
               flex-1 max-w-1/2 disabled:opacity-50  font-['Geist'] text-[16px] !font-[400]"
            onClick={onCreateReferral}
          >
            {t('referral.confirm')}
          </Button>
        </div>
      </div>
    </>
  )
}
export default memo(InvitationRelationshipConfirmationPopup)
