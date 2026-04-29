import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { agentDexClient } from '@/lib/gql/apollo-client'
import {  CREATE_INVITE_CODE } from '@/services/agent.dex.service'
import { useTranslation, Trans } from 'react-i18next'

interface InviteCodeModalProps {
//   isOpen: boolean
  onClose: () => void
  onCreateCode?: (code: string) => void
  defaultCode?: string
}

const InviteCodeModal = ({ 
//   isOpen, 
  onClose, 
  onCreateCode, 
  defaultCode,
}: InviteCodeModalProps) => {
    const { t } = useTranslation()
    const [inviteCode, setInviteCode] = useState(defaultCode)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
  // 重置状态当弹窗打开时
  useEffect(() => {
      setInviteCode(defaultCode)
      setError('')
    // }
  }, [defaultCode])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许输入数字和字母
    if(!/^[0-9a-zA-Z]*$/.test(e.target.value)) {
      return
    }
    setInviteCode(e.target.value)
    setError('')
  }


  // 创建邀请码
  const handleCreateCode = async () => {
    // 基本验证
    if (!inviteCode) {
      setError(t('inviteFriends.enterInviteCode'))
      return
    }
    if(inviteCode.length < 5) {
      setError(t('inviteFriends.inviteCodeLengthLessThan5'))
      return
    }
    if(inviteCode.length > 15) {
      setError(t('inviteFriends.inviteCodeLengthGreaterThan15'))
      return
    }
    setIsLoading(true)
    handleCreateCodeApI?.(inviteCode)
    // try {
    //   handleCreateCodeApI?.(inviteCode)
    //   onClose()
    // } catch (err) {
    //   setError('创建失败，请重试')
    // } finally {
    //   setIsLoading(false)
    // }
  }

  const handleCreateCodeApI = async (value: string) => {
    setIsLoading(true)
    try {
      const { data } = await agentDexClient.mutate({
        mutation: CREATE_INVITE_CODE,
        variables: {
          input: {
            invitationCode: value,
            walletType: 'MANAGED'
          },
        }
      })
      if (data?.createUserInvitationCode.success) {
        toast.success(t('invite.invitationCodeGeneratedSuccessfully'))
        onCreateCode?.(value)
      } else {
        toast.error(t('invite.failedToGenerateInvitationCode'))
      }
    } catch (err: any) {
      toast.error(t('invite.failedToGenerateInvitationCode'))
    }
    setIsLoading(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      {/* 弹窗内容 */}
      <div className="relative w-[320px]  px-[14px] py-[18px]  rounded-2xl shadow-2xl bg-[url('/images/nodeAgent/inviteBg.svg')] bg-size-[110%] bg-no-repeat" style={{boxSizing: 'content-box'}}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute bottom-[-50px] left-[50%] translate-x-[-50%]"
        >
          <img src="/images/nodeAgent/close.svg" alt="close" className="w-8 h-8" />
        </button>

        {/* 装饰图标区域 */}
        <div className="absolute top-[-15px] right-[18px]">
          <img src="/images/nodeAgent/shakeHands.svg" alt="shakeHands" className="w-[102px] h-[102px]" />
        </div>

        {/* 标题 */}
        <h2 className="text-white text-[18px] mb-6">{t('inviteFriends.inviteCode')}</h2>
        {/* 输入区域 */}
        <div className='bg-[#121212] rounded-[8px] p-[16px]'>
          <div className="mb-2">
            <div className='text-white text-[18px] mb-[16px]'>{t('inviteFriends.setInviteCode')}</div>
            <input
              type="text"
              value={inviteCode}
              onChange={handleInputChange}
              placeholder={t('inviteFriends.inputYourExclusiveInviteCode')}
              className="w-full h-[44px] px-2 bg-white rounded-[10px] text-[14px] text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* 错误提示 */}
          <div className="w-full">
            {error && (
              <p className="text-[#F5324B] text-[11px]">{error}</p>
            )}
          </div>
        <div className="relative w-full mt-[16px] mb-[16px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="2" viewBox="0 0 282 2" fill="none">
                <path d="M0.875 1H281.875" stroke="#ECECED" strokeOpacity="0.12" strokeDasharray="2 2"/>
            </svg>   
        </div>
          <div className="text-white/90 text-[13px] leading-relaxed">
             {(() => {
               const text = t('inviteFriends.inviteCodeDescription') as string
               const parts = text.split('50%')
               return (
                 <>
                   {parts[0]}
                   <span className="text-[#2FFD95] font-medium">50%</span>
                   {parts[1]}
                 </>
               )
             })()}
          </div>
        </div>
        {/* 创建按钮 */}
         <Button
          onClick={handleCreateCode}
          disabled={isLoading}
          className="w-full h-[44px] bg-white rounded-[20px] text-[14px] text-black font-medium mt-[20px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('inviteFriends.creating') : t('inviteFriends.create')}
        </Button>
      </div>
    </div>
  )
}

export default InviteCodeModal