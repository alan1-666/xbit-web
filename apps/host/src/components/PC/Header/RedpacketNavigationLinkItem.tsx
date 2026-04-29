import { useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'

export const RedpacketNavigationLinkItem = () => {
  const [hover, setHover] = useState(false)
  return (
    <Link
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer inline-block"
      to={APP_PATH.REDPACKET}
      style={{
        width: '181px',
        height: '49px',
        backgroundImage: 'url(/images/icons/pc-rebpacket-icon.png?v=3)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        paddingLeft: '10px',
        paddingRight: '25px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div 
        className="text-[12px] font-medium leading-[55px]" 
        style={{ 
          ...(hover ? {
            background: 'linear-gradient(90deg, #FEE8CB 0%, #FFD209 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          } : {
            color: 'white',
          })
        }}
      >
      </div>
    </Link>
  )
}
