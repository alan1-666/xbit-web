import { SportsLayoutV2 } from '../../components/sports/layout/SportsLayout.tsx'
import { Outlet } from 'react-router-dom'

const Sports = () => {
  return (
    <SportsLayoutV2>
      <Outlet />
    </SportsLayoutV2>
  )
}

export default Sports
