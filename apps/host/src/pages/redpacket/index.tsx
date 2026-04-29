import { useResponsive } from '@/hooks/useResponsive'
import H5RedpacketPage from './components/h5/index.tsx'
import PcRedpacketPage from './components/pc/index.tsx'
import './style.css'


const RedpacketPage = () => {
  const { isDesktop } = useResponsive()



  return (
    <div className="flex flex-col h-full">
      {isDesktop ? (
        <PcRedpacketPage/>
      ) : (
       <H5RedpacketPage/> 
      )}
    </div>
  )
}

export default RedpacketPage
