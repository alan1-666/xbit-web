import SearchBox from '@components/common/SearchBox.tsx'
import WalletChangeBox from '@/components/common/walletBalance/WalletChangeBox'
import LoginSection from '@components/common/LoginSection'
import ListCoin from '@components/listCoin'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

const HomePage = () => {
  const activeWallet = useSelector(_activeWallet)


  return (
    <div className="@container mx-auto mt-2">
      <div className="px-[10px]">
        <div className="mb-4">
          <SearchBox />
        </div>
        <div className="mb-4">
          <WalletChangeBox />
        </div>
      </div>
      {!activeWallet?.isConnected && <LoginSection />}
      <ListCoin />
      {/*<TableTest />*/}
      {/*<TableInfinite />*/}
    </div>
  )
}

export default HomePage
