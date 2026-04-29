import Container from '@/components/common/Container'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useNavigate } from 'react-router-dom'
import RealtimeNotification from './RealtimeNotification'
import AlertList from './AlertList'
import { useState } from 'react'

const AllAlerts = () => {
  const navigate = useNavigate()
  const [isEdit, setIsEdit] = useState(false)

  const handleNavigateBack = () => {
    navigate(-1)
  }

  return (
    <Container className="px-0">
      <HeaderWithBack
        title="全部预警"
        className="bg-transparent"
        onBack={handleNavigateBack}
        right={
          <div
            className="text-sm leading-[calc(1rem*(14/16))] app-font-medium cursor-pointer"
            onClick={() => {
              setIsEdit(!isEdit)
            }}
          >
            管理
          </div>
        }
      />
      <RealtimeNotification />
      <AlertList isEdit={isEdit} setIsEdit={setIsEdit} />
    </Container>
  )
}

export default AllAlerts
