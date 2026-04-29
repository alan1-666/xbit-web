import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { USER_BIND_INVITE } from '@/services/agent.dex.service'
import { isArray } from 'lodash-es'
import { useResponsive } from '@/hooks/useResponsive'

interface DialogBindInviteCodeProps {
  open: boolean 
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}
const errorCodes = [
    'INVITATION_CODE_NOT_FOUND',
    'SELF_REFERRAL_NOT_ALLOWED',
    'REFERRAL_ALREADY_EXISTS',
    'CIRCULAR_REFERRAL',
]
const DialogBindInviteCode = ({ open, setOpen, onSuccess }: DialogBindInviteCodeProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 重置状态当弹窗打开时
  useEffect(() => {
    if (open) {
      setInviteCode('')
    }
  }, [open])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许输入数字和字母
    const value = e.target.value.trim()
    // if (!/^[0-9a-zA-Z]*$/.test(value)) {
    //   return
    // }
    setInviteCode(value)
  }


  // 绑定邀请码
  const handleBindCode = async () => {
    if (inviteCode.length < 3 || inviteCode.length > 15) {
      toast.error(t('referral.error.INVALID_LENGTH'))
      return
    }
    setIsLoading(true)

    try {
      const { data } = await agentDexClient.mutate({
        mutation: USER_BIND_INVITE,
        variables: {
          input: {
            invitationCode: inviteCode,
          },
        },
      })

      if (data?.createUserWithReferral?.success) {
        toast.success(t('referral.bind.success'))
        setOpen(false)
        onSuccess?.()
      }
    } catch (err: any) {
        if (isArray(err)) {
        const firstError = err[0]
        const error = errorCodes.includes(firstError.code) ? firstError.code : 'bindfail'
        toast.error(t(`referral.error.${error}`, { duration: 3000 }))
        }
    } finally {
      setIsLoading(false)
      setOpen(false)
      onSuccess?.()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`bg-[#1a1a1f] border rounded-2xl p-6 w-[335px] max-w-[90vw] ${
          !isDesktop 
            ? '!fixed !left-1/2 !top-[30%] !-translate-x-1/2 !-translate-y-1/2' 
            : ''
        }`}
        showDialogPrimitiveClose={true}
      >
        <DialogHeader>
          <DialogTitle className="text-white text-[20px] font-medium text-left mb-2">
            {t('referral.bind.code')}
          </DialogTitle>
          <DialogDescription className="text-[#cacaca] text-[14px] text-left">
            {t('referral.bind.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* 输入框 */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={handleInputChange}
              placeholder={t('inviteFriends.enterInviteCode')}
              className={`w-full h-[44px] px-4 bg-[#121212] rounded-lg text-[14px] text-white placeholder-[#666] border transition-colors`}
              disabled={isLoading}
              maxLength={15}
            />
            {/* 错误提示
            {error && (
              <p className="text-[#F5324B] text-[12px]">{error}</p>
            )} */}
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-[44px] rounded-[200px] border  text-white bg-transparent hover:bg-white/10"
            >
            {t('appSettings.aboutUs.cancel')}
            </Button>
            <Button
              onClick={handleBindCode}
              disabled={isLoading || !inviteCode}
              className="flex-1 h-[44px] rounded-[200px] bg-[#843BEA] text-white  disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {t('appSettings.aboutUs.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogBindInviteCode

