import { Outlet } from 'react-router-dom'
import '@/styles/prediction.css'

export const Layout = () => {
  return (
    <div className="prediction">
      {/* <Header /> */}
      <Outlet />
    </div>
  )
}
