import { Configs } from '@/const/configs'
import { useActiveAccount } from '@/hooks/useActiveAccount'
import { useActiveChain } from '@/hooks/useActiveChain'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant'
import ls from '@/lib/local-storage'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { walletActions } from '@/redux/modules/wallet.slice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

const SyncChain = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { pathname } = location
  const chain = useActiveChain()
  const account = useActiveAccount()

  useEffect(() => {
    if (pathname === APP_PATH.MEME_DISCOVER) {
      // useEffect will run before setActiveChain is updated, there needs to be a delay for setActiveChain to be updated
      setTimeout(() => {
        // ls.set('meme_chain', memeChain)
        ls.set('meme_account', account)
      }, 200)
    } else if (pathname === APP_PATH.XSTOCKS) {
      setTimeout(() => {
        ls.set('xstocks_chain', TYPE_CHAIN.SOLANA)
        ls.set('xstocks_account', account)
      }, 200)
    }
  }, [chain, account])

  useEffect(() => {
    // save chain of current meme tab
    // futures/discover use ARB chain，but futures/market should use meme chain
    if (pathname === APP_PATH.FUTURES_DISCOVER) {
      ls.set('selected_chain', TYPE_CHAIN.ARB)
      dispatch(newWalletActions.setActiveChain(TYPE_CHAIN.ARB))
    } else {
      let account = ''
      let chain = ''
      if (pathname.startsWith('/meme') || pathname.startsWith('/futures/market')) {
        account = ls.get('meme_account')
        // TODO: Temporarily fix SOLANA chain
        const chainLS = ls.get('meme_chain')
        if (!!chainLS && Configs.supportedRouteChains().includes(chainLS)) {
          chain = chainLS
        } else {
          chain = TYPE_CHAIN.MON
          ls.set('meme_chain', TYPE_CHAIN.MON)
        }
      } else if (pathname === APP_PATH.XSTOCKS) {
        if (!ls.get('xstocks_chain')?.includes(TYPE_CHAIN.SOLANA)) {
          ls.set('xstocks_chain', TYPE_CHAIN.SOLANA)
          chain = TYPE_CHAIN.SOLANA
        } else {
          chain = ls.get('xstocks_chain')
        }
        account = ls.get('xstocks_account')
      }
      if (chain) {
        dispatch(walletActions.setActiveChain(chain))
        dispatch(newWalletActions.setActiveChain(chain))
      }
      if (account) {
        dispatch(walletActions.setActiveAccount(account))
      }
    }
  }, [pathname])

  return <></>
}

export default SyncChain
