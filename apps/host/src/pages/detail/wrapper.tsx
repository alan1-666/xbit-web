import MemeDetailPC from '@/pages/detail/pc'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import MemeDetailPage from '@pages/detail/index.tsx'
import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'

import { TYPE_CHAIN } from '@/lib/blockchain'
import ls from '@/lib/local-storage'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { Configs } from '@const/configs.ts'
import { NAVIGATIONS } from '@/lib/navigations.ts'

const supportedChains = Configs.supportedRouteChains()

const MemeDetailPageWrapper = () => {
  const { chain: routeChain } = useParams()
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()
  const chain = useAppSelector((state) => state.newWallet.activeChain)

  useEffect(() => {
    if (routeChain) {
      const isValidTypeChain = supportedChains.includes(routeChain as TYPE_CHAIN)
      if (isValidTypeChain && routeChain !== chain) {
        const isMatch = /^\/xstocks\/[^/]+\/token\/[^/]+$/.test(pathname)
        if (isMatch) {
          dispatch(newWalletActions.setActiveChain(TYPE_CHAIN.SOLANA))
          ls.set('xstocks_chain', routeChain)
        } else {
          dispatch(newWalletActions.setActiveChain(routeChain))
          ls.set('meme_chain', routeChain)
        }
      }
    }
  }, [routeChain])
  const { isDesktop } = useResponsive()

  if (routeChain && !supportedChains.includes(routeChain as TYPE_CHAIN)) {
    return <Navigate to={NAVIGATIONS.meme.discover()} />
  }

  if (isDesktop) return <MemeDetailPC />
  return <MemeDetailPage />
}

export default MemeDetailPageWrapper
