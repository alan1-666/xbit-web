import Container from '@/components/common/Container'
import ListCoinCrypto from '@/components/futuresDiscover/list-coin-crypto'
import SearchBar from '@/components/futuresDiscover/search-bar'
import RedPacketDialog from '@/components/futuresDiscover/RedPacketDialog'
import MarketOverviewList from '@/pages/futures-market/components/market-overview-list'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { useAppSelector } from '@/redux/store'
import { cn } from '@/lib/utils'
import MobileAdBanner from '@/components/mobile/MobileAdBanner'

const FuturesDiscover = () => {
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  return (
    <div
      className={cn(
        'relative flex flex-col bg-[#0A0A0A]',
        isShowMaintenanceNotification ? 'min-h-[calc(100dvh-124px)]' : 'min-h-[calc(100%-40px)]',
      )}
    >
      {/* <RedPacketDialog /> */}
      {/* <DetailNotice containerClassName='px-3 bg-notice h-[32px]' /> */}
      <div className="px-2.5">
        <SearchBar />
      </div>
      <MobileAdBanner size="large" className="px-2.5" />
      {/* <ListCoinCrypto /> */}
      <MarketOverviewList type={'home'} />
    </div>
  )
}

export default FuturesDiscover
