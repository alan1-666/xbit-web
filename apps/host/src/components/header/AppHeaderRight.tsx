import SwitchChains from '@components/header/switch-chains.tsx'
import { HeaderNotifications } from '@components/header/HeaderNotifications.tsx'

export interface AppHeaderRightProps {
  showNotifications?: boolean
}

export const AppHeaderRight = (props: AppHeaderRightProps) => {
  const { showNotifications } = props
  return <div className="flex items-center gap-2">{showNotifications ? <HeaderNotifications /> : <SwitchChains />}</div>
}
