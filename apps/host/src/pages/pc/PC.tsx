import HeaderPC from '@components/PC/Header'
import { BottomBar } from '@components/v2/desktop/BottomBar.tsx'
import { Outlet } from 'react-router-dom'
import {TopBar} from "@components/v2/desktop/TopBar.tsx";


export const PC = () => {
  return (
    <div className="h-screen flex flex-col items-stretch">
      <HeaderPC />
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <BottomBar />
    </div>
  )
}
