import { useActiveAccount } from '@/hooks/useActiveAccount'
import { LIST_CHAIN_SUPPORTED, NEW_TYPE_ACCOUNT, SupportedChain, TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant'
import { futureClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet, formatEmail } from '@/lib/string'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { routerActions } from '@/redux/modules/router.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getSmartMoneyInfoV2 } from '@/services/copytrade.service'
import { getChainType } from '@/utils/list-coin-helper'
import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CopyButton } from './copy-button'
import LoginByExplained from './LoginByExplained'
import Text from './Text'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

const AccountOverview = ({}: { className?: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeWallet = useSelector(_activeWallet)
  const activeAccount = useActiveAccount()
  const { email, walletAddressLogin } = useAppSelector((state) => state.newWallet) as any
  // const isFuturesPage = location.pathname.includes('futures') || location.search.includes('page=futures')
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const { data, refetch } = useQuery(getSmartMoneyInfoV2, {
    variables: { req: { address: activeWallet?.walletAddress, chain: getChainType(activeChain) } },
    client: futureClient,
    skip: !activeWallet?.walletAddress,
  })

  useEffect(() => {
    if (activeWallet?.walletAddress) {
      refetch()
    }
  }, [activeWallet?.walletAddress])

  const activeChainInfo = useMemo(() => {
    // if(isFuturesPage) return LIST_CHAIN_SUPPORTED.find((item: SupportedChain) => item.value === TYPE_CHAIN.ARB)
    return LIST_CHAIN_SUPPORTED.find((item: SupportedChain) => item.value === activeWallet?.chainType)
  }, [activeChain])

  const onBrandClick = () => {
    navigate(APP_PATH.MEME_DISCOVER)
    dispatch(routerActions.setHeaderTab('meme'))
  }

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(activeWallet?.walletAddress).then(setSrc)
  }, [activeWallet?.walletAddress])

  const handleMapText = useCallback(() => {
    switch (activeAccount) {
      case NEW_TYPE_ACCOUNT.WALLET:
        return 'Web3'

      case NEW_TYPE_ACCOUNT.WC:
        return 'Wallet Connect'

      default:
        return activeAccount
    }
  }, [activeAccount])

  return (
    <>
      <button onClick={onBrandClick}>
        <img
          src={data?.getSmartMoneyInfo?.avatar ? data?.getSmartMoneyInfo?.avatar : src}
          data-avatar-type="wallet"
          alt="logo"
          className="size-16 block rounded-md"
        />
      </button>

      <div className="flex flex-col justify-center">
        <Text
          text={
            data?.getSmartMoneyInfo?.name
              ? data?.getSmartMoneyInfo?.name
              : formatAddressWallet(activeWallet?.walletAddress, 5, 5)
          }
          className="leading-normal !text-[14px] !font-medium"
        />
        <div className="font-[330] text-white/50 text-[calc(12rem/16)] flex items-center">
          <img src={activeChainInfo?.img || `/images/icons/icon-sol.svg`} alt="Google" className="size-3 mr-1" />
          <span className="mr-1 leading-normal">{t('setting.drawer.yourWalletAddress')}</span>
          <span className="leading-normal">{formatAddressWallet(activeWallet?.walletAddress, 5, 5)}</span>
          <CopyButton text={activeWallet?.walletAddress} className="pl-1" />
        </div>
        <div className="flex items-center font-[330] text-white/50 text-[calc(12rem/16)]">
          <span className="capitalize flex justify-center items-center mr-1">
            {/* {handleMapText()}
            <span className="px-1">
              <LoginByExplained />
            </span>
            :{' '} */}
            <LoginByExplained />
          </span>
          <span className="truncate max-w-[154px] leading-normal">
            {formatEmail(email) || formatAddressWallet(walletAddressLogin, 5, 5)}
          </span>
          <CopyButton text={email || walletAddressLogin} className="pl-1" />
        </div>
      </div>
    </>
  )
}

export default AccountOverview
