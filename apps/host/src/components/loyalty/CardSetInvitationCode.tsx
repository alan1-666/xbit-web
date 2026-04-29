import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { useLoyalty } from './context/LoyaltyContext'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { CREATE_INVITE_CODE } from '@/services/agent.dex.service'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export interface CardSetInvitationCodeProps {
  onOpenChange: (open: boolean) => void
}

const CardSetInvitationCode = (props: CardSetInvitationCodeProps) => {
  const { onOpenChange } = props
  const { setInviteCode } = useLoyalty()
  const [invitationCode, setInvitationCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to check if character is Vietnamese with diacritics
  const hasVietnameseDiacritics = (text: string): boolean => {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/
    return vietnamesePattern.test(text)
  }

  const validationError = useMemo(() => {
    if (!touched || !invitationCode) return null

    if (invitationCode.length < 4 || invitationCode.length > 15) {
      return t('loyalty.setInvitation.warningDes')
    }

    const validPattern = /^[A-Za-z0-9_]+$/
    if (!validPattern.test(invitationCode)) {
      return t('loyalty.setInvitation.warningDes')
    }

    return null
  }, [invitationCode, touched, t])

  const isValid = !validationError && invitationCode.trim().length > 0

  const handleSubmit = async () => {
    if (isValid) {
      setIsLoading(true)
      setApiError(null)
      try {
        const { data } = await agentDexClient.mutate({
          mutation: CREATE_INVITE_CODE,
          variables: {
            input: {
              invitationCode: invitationCode,
              walletType: 'MANAGED',
            },
          },
        })
        if (data?.createUserInvitationCode.success) {
          setInviteCode(invitationCode)
          toast.success(t('invite.invitationCodeGeneratedSuccessfully'))
          onOpenChange(false)
        }
      } catch (err: any) {
        const errorCode = err[0]?.code
        let errorMessage = t('invite.failedToGenerateInvitationCode')

        if (errorCode) {
          const translationKey = `loyalty.${errorCode}`
          const translated = t(translationKey)

          if (translated !== translationKey) {
            errorMessage = translated
            setApiError(errorMessage)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Block Vietnamese diacritics
    if (hasVietnameseDiacritics(value)) {
      return
    }
    
    const validPattern = /^[A-Za-z0-9_]*$/
    
    if (value === '' || validPattern.test(value)) {
      setInvitationCode(value)
      
      if (!touched && value.length > 0) {
        setTouched(true)
      }
      
      if (apiError) {
        setApiError(null)
      }
    }
  }

  // Prevent composition events (IME input) for Vietnamese
  const handleCompositionStart = (e: React.CompositionEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  const displayError = apiError || validationError

  return (
    <div className="space-y-6">
      <div className="text-[calc(14rem/16)] font-[380] text-white/80 leading-relaxed">{t('loyalty.desCreateCode')}</div>

      <div className="flex flex-col gap-3 w-full">
        <div className="text-[calc(14rem/16)] text-[#908E9A] leading-none">{t('loyalty.yourInviteCode')}</div>
        <input
          type="text"
          value={invitationCode}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          onBlur={handleBlur}
          placeholder={t('loyalty.hintTextCreateCode')}
          className={`bg-[#2B2B33] text-white placeholder:text-[#504D5D] h-[48px] px-4 rounded-[6px] w-full text-[calc(14rem/16)] outline-none transition-all 
            ${displayError ? 'ring-1 ring-[#EA3B4F]' : 'focus:ring-1 focus:ring-[#C8A7FD]'}`}
        />

        {displayError && (
          <div className="gap-[8px] bg-[#18181B] p-2 flex flex-col rounded-[6px]">
            {apiError ? (
              <div className="text-[calc(14rem/16)] text-[#EA3B4F] leading-relaxed">{apiError}</div>
            ) : (
              <>
                <div className="text-[calc(14rem/16)] text-[#EA3B4F] leading-relaxed">
                  {t('loyalty.setInvitation.warningTitle')}
                </div>
                <div className="space-y-1 text-[calc(14rem/16)] text-[#908E9A] leading-relaxed whitespace-pre-line">
                  {validationError}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-xs leading-relaxed text-[#CACACA]">
        {(() => {
          const text = t('loyalty.referral_tip1') as string
          const parts = text.split('50%')
          return (
            <>
              {parts[0]}
              <span className="text-[#21E09D]">50%</span>
              {parts[1]}
            </>
          )
        })()}
        <span className="text-[#EA3B4F] ml-1">{t('loyalty.desCreateCodeWarning2')}</span>
      </div>

      <div className="">
        <Button
          variant="gradient"
          isLoading={isLoading}
          onClick={handleSubmit}
          disabled={!isValid || isLoading || !!displayError}
          className="rounded-full font-[450] text-[16px] h-fit w-full"
        >
          {t('common.confirm')}
        </Button>
      </div>
    </div>
  )
}

export default CardSetInvitationCode