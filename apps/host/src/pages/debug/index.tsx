import { Link } from 'react-router-dom'
import Container from '@components/common/Container.tsx'
import { APP_PATH } from '@/lib/constant'
import { useSelector } from 'react-redux'
import { useAppSelector } from '@/redux/store'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useHoldings } from '@/hooks/rpc/useRPC'

const DebugPage = () => {
  const activeWallet = useSelector(_activeWallet)
  const walletAddress = activeWallet?.walletAddress
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const holdings = useHoldings(walletAddress, activeChain.toLowerCase())
  console.log('Holdings:', holdings)

  return (
    <Container className="py-[20px] px-[25px]">
      <h2 className="mb-[20px]">Debug page</h2>
      <div className="px-[10px] pt-[10px] pb-[15px] rounded-[10px] bg-[#d3d3d329]">
        <ul className="list-disc pl-[20px]">
          <li>
            <span className="inline-block mr-[10px] font-[300]">Demo new pairs page:</span>
            <Link to={APP_PATH.MEME_NEW_PAIRS_DEMO} className="underline">
              {APP_PATH.MEME_NEW_PAIRS_DEMO}
            </Link>
          </li>
          <li>
            <span className="inline-block mr-[10px] font-[300]">Demo futures detail page:</span>
            <Link to="/futures/BTC" className="underline">
              /futures/:baseCoin
            </Link>
          </li>
          <li>
            <span className="inline-block mr-[10px] font-[300]">transaction history</span>
            <Link to="/transaction-history" className="underline">
              /transaction-history
            </Link>
          </li>
          <li>
            <span className="inline-block mr-[10px] font-[300]">asset chart</span>
            <Link
              to="/webview/asset-chart?type=expand&token=accessToken&width=390&height=200&period=1day&userAddress=9Yi8czQv1g5BQXnKErUSz463YRBDMH7gfdpzcAuZ55QG&tokenAddress=So11111111111111111111111111111111111111111"
              className="underline"
            >
              /webview/asset-chart
            </Link>
          </li>
          <li>
            <span className="inline-block mr-[10px] font-[300]">price chart</span>
            <Link to="/webview/price-chart?token=6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN" className="underline">
              /webview/price-chart
            </Link>
          </li>
          <li className="underline">
            <Link to="/pc/meme/discover">Discover page (PC)</Link>
          </li>
          <li>
            <span className="inline-block mr-[10px] font-[300]">Format Rules:</span>
            <Link to={APP_PATH.DEBUG_FORMAT_RULES} className="underline">
              {APP_PATH.DEBUG_FORMAT_RULES}
            </Link>
          </li>
        </ul>
      </div>
    </Container>
  )
}

export default DebugPage
