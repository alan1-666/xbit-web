import React, { useEffect } from 'react'
import XStocksPage from './XStocksPage'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import XStocksDesktopPage from './desktop'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { useAppSelector } from '@/redux/store'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { useDispatch } from 'react-redux'
import ls from '@/lib/local-storage'
import { walletActions } from '@/redux/modules/wallet.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import PcAdBanner from '@/components/PC/PcAdBanners'
import { Configs } from '@/const/configs'

const XStocks: React.FC = () => {
  const { isDesktop } = useResponsive()
  const dispatch = useDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const location = useLocation()
  const { pathname } = location
  const navigate = useNavigate()

  useEffect(() => {
    if (!Configs.enableSolana()) {
      navigate(APP_PATH.FUTURES, { replace: true })
    }
  }, [navigate])

  // Khi vào XStocks page, force chain về SOLANA
  useEffect(() => {
    if (!Configs.enableSolana()) return

    if (pathname === APP_PATH.XSTOCKS && isDesktop) {
      const currentChain = activeChain
      if (currentChain !== TYPE_CHAIN.ARB && currentChain !== TYPE_CHAIN.SOLANA) {
        ls.set('meme_chain', currentChain)
      }

      ls.set('xstocks_chain', TYPE_CHAIN.SOLANA)
      dispatch(walletActions.setActiveChain(TYPE_CHAIN.SOLANA))
      dispatch(newWalletActions.setActiveChain(TYPE_CHAIN.SOLANA))

      const xstocksAccount = ls.get('xstocks_account')
      if (xstocksAccount) {
        dispatch(walletActions.setActiveAccount(xstocksAccount))
      }

      setTimeout(() => {
        const currentAccount = activeChain
        ls.set('xstocks_account', currentAccount)
      }, 200)
    }
  }, [pathname, dispatch, activeChain, isDesktop])

  if (isDesktop) {
    return (
      <>
        <XStocksDesktopPage />
        <PcAdBanner scene="xstocks" />
      </>
    )
  }
  return <XStocksPage />
}

export default XStocks
