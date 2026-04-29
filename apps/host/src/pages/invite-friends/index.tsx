import { useEffect, useMemo, useState, useRef } from 'react'
import ListAppShare from '@components/common/share/listAppShare'
import './style.css'
import { useTranslation } from 'react-i18next'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import NavigationHeader from '@/components/nodeAgent/NavigationHeader'
import { useNavigate } from 'react-router-dom'
import InviteCodeModal from './components/InviteCodeModal'
import InviteShareCard, { InviteShareCardRef } from './components/InviteShareCard'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import DesktopInviteShareCard from './components/DesktopInviteShareCard'

const InviteFriends = ({
  hiddenHeader,
  setOpen: setOpenModal,
}: {
  hiddenHeader?: boolean
  setOpen?: (value: boolean) => void
}) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [inviteCode, setInviteCode] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const currentUrl = useMemo(() => window.location.origin, [])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  
  // 创建 ref 用于调用子组件的方法
  const inviteShareCardRef = useRef<InviteShareCardRef>(null)

  const getUserInviteInfo = async () => {
    setIsFetching(true)
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user

      setInviteCode(user.invitationCode)
    } catch (error) {}
    setIsFetching(false)
  }

  const handleCodeChange = (code: string) => {
    setInviteCode(code)
  }

  useEffect(() => {
    getUserInviteInfo()
  }, [])

  return (
    <div
      className={cn(
        '@container relative mx-auto bg-[#121212] flex flex-col overflow-x-hidden',
        !isDesktop ? 'min-h-screen' : 'w-full h-full max-h-[89vh]',
      )}
    >
      {!hiddenHeader && (
        <div className="flex-shrink-0 px-3">
          <NavigationHeader
            title={t('inviteFriends.title')}
            onBack={() => {
              navigate(-1)
            }}
            onClose={() => {
              navigate('/')
            }}
            showBack={true}
            showClose={true}
          />
        </div>
      )}
      {isFetching ? (
        <div className="containerLoadingSpinner"></div>
      ) : (
        <>
          <div className="flex-grow flex flex-col mt-[25px]">
            {/* <RenderBg /> */}
            <div className="relative">
              {isDesktop ? (
              <DesktopInviteShareCard
                ref={inviteShareCardRef}
                inviteCode={inviteCode}
                inviteUrl={`${currentUrl}/@${inviteCode}`}
                // onClose={() => {setOpen(false)}}
              />) : (
                <InviteShareCard
                  ref={inviteShareCardRef}
                  inviteCode={inviteCode}
                  inviteUrl={`${currentUrl}/@${inviteCode}`}
                  // onClose={() => {setOpen(false)}}
                />
              )}
              {!inviteCode && (
                <InviteCodeModal
                  onClose={() => {
                    if (isDesktop) {
                      setOpenModal?.(false)
                    } else {
                      navigate(-1)
                    }
                  }}
                  onCreateCode={handleCodeChange}
                  defaultCode={inviteCode}
                />
              )}
            </div>
          </div>

          {inviteCode && (
            <div className="flex-shrink-0 animate-slide-up-delay rounded-t-[12px] p-[16px]  w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
              <div className="flex items-end justify-center">
              <ListAppShare 
                onSave={() => {
                  inviteShareCardRef.current?.handleSaveImage()
                }} 
                text={t('inviteFriends.inviteText')} 
                url={`${currentUrl}/@${inviteCode}`}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InviteFriends
