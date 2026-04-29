import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { WalletButton } from '@rainbow-me/rainbowkit'
import clsx from 'clsx'
import { metaMask } from '@wagmi/connectors'
import { toast } from 'sonner'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { useAppDispatch } from '@/redux/store'
import { message_to_sign, NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { ChainType, InputLoginWalletV2Dto, LoginV2Dto } from '@/@generated/gql/graphql-user'
import { ServiceConfig } from '@/lib/gql/service-config'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import ButtonShadowGradient from '../common/buttons/ButtonShadowGradient'
import { Link } from 'react-router-dom'
import DownloadWalletBadge from '@/components/common/DownloadWalletBadge'
import CheckboxWithLabel from '../common/CheckboxWithLabel'

export const visibleWallets = [
  // { id: 'metamask', name: 'MetaMask', icon: '/images/icons/metamask-icon.png', status: 'default' },
  { id: 'okx', name: 'OKX Wallet', icon: '/images/icons/okx-icon.png', status: 'recent' },
  // { id: 'boss-wallet', name: 'BOSS Wallet', icon: '/images/icons/boss-wallet-icon.png', status: 'installed' },
]
const LoginByWallet = ({ publicKey }: { publicKey: string }) => {
  const { t } = useTranslation()
  const { connectAsync: connectMetaMask, connectors } = useConnect()

  const { address, isConnected: isEvmConnected } = useAccount()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { signMessageAsync } = useSignMessage({})
  const { walletClient, indexedDbClient } = useTurnkey()
  const dispatch = useAppDispatch()
  const [isAgree, setIsAgree] = useState(true)

  const handleSignMessageWallet = async () => {
    dispatch(
      newAuthActions.getNonce({
        address,
      }),
    ).then(async (res) => {
      const nonce = res?.payload?.getNonce
      const message = message_to_sign(address!, nonce)

      // console.log('message', message)
      try {
        const messageSigned = await signMessageAsync({ message: message })
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: message,
            signature: messageSigned,
            chainType: ChainType.Evm,
          }),
        ).then(async (res) => {
          if (res?.meta?.requestStatus === 'fulfilled') {
            const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
            const userId = res?.payload?.createWalletSubOrgV2?.userId
            const expirationSeconds = res?.payload?.createWalletSubOrgV2?.sessionExpiresIn ?? '604800'

            // stamp login signing
            const timestampMs = String(Date.now())
            const body = JSON.stringify({
              parameters: {
                publicKey: publicKey,
                expirationSeconds,
              },
              organizationId: subOrgId,
              timestampMs,
              type: 'ACTIVITY_TYPE_STAMP_LOGIN',
            })
            const stamp = await walletClient?.stamper?.stamp(body)
            const params: InputLoginWalletV2Dto = {
              organizationId: subOrgId,
              publicKey: publicKey,
              stampHeaderName: stamp?.stampHeaderName as string,
              stampHeaderValue: stamp?.stampHeaderValue as string,
              url: '/public/v1/submit/stamp_login',
              timestampMs: timestampMs,
              expirationSeconds,
            }

            dispatch(newAuthActions.loginByWalletV2(params)).then(async (res) => {
              if (res?.meta?.requestStatus === 'fulfilled') {
                dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.WALLET))
                const response: LoginV2Dto = res.payload.loginByWalletV2
                ServiceConfig.token = response.accessToken
                dispatch(
                  newAuthActions.updateAccessToken({
                    activeAccount: NEW_TYPE_ACCOUNT.WALLET,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    userId: userId,
                    subOrgId: response?.subOrgId,
                  }),
                )
                await indexedDbClient?.loginWithSession(response.turnKeyResponse)
                dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
                  toast.success(t('status.loginSuccess'))
                  dispatch(
                    newWalletActions.updateVerifyWallet({
                      message: message,
                      signature: messageSigned,
                      isOkxWallet: true,
                    }),
                  )
                  // await handleAgentAction({
                  //   userId: res?.payload?.account?.id
                  // })
                })
              }
              if (res?.meta?.requestStatus === 'rejected') {
                disconnectEvm()
                indexedDbClient?.resetKeyPair()
                toast.error(t('status.loginFail'))
              }
            })
          }
          if (res?.meta?.requestStatus === 'rejected') {
            disconnectEvm()
            toast.error(t('status.loginFail'))
          }
        })
        if (res?.meta?.requestStatus === 'rejected') {
          disconnectEvm()
          toast.error(t('status.loginFail'))
        }
      } catch (error) {
        console.log('[error]: ', error)
        disconnectEvm()
      }
    })
  }

  const flagRef = useRef(0)
  const acctiveWallet = useSelector(_activeWallet)
  useEffect(() => {
    if (!isEvmConnected || !address || !acctiveWallet?.isConnected) {
      flagRef.current = 0
    }
    if (isEvmConnected && address && !acctiveWallet?.isConnected && flagRef.current === 0) {
      handleSignMessageWallet()
      flagRef.current = 1
    }
  }, [isEvmConnected, address])

  useEffect(() => {
    disconnectEvm()
  }, [])

  return (
    <div className="w-full mt-5">
      {visibleWallets.map((item) => (
        <WalletButton.Custom wallet={item.id} key={item.id}>
          {({ ready, connect, connector }) => {
            return (
              <button
                className={clsx(
                  'w-full flex items-center justify-between py-[14px] border-b-[0.5px] border-[#ECECED]/8 ',
                  // !checked && 'cursor-not-allowed',
                )}
                key={item?.name}
                // disabled={!ready}
                onClick={() => {
                  if (!isAgree) {
                    toast.error(t('toast.termsAgreement'))
                    return
                  }
                  const mm = connectors.find((c) => item.name === 'MetaMask')
                  if (mm) {
                    connectMetaMask({ connector: metaMask() })
                      .then(() => {})
                      .catch(() => {
                        disconnectEvm()
                      })
                  } else {
                    connect()
                      .then(() => {})
                      .catch(() => {
                        disconnectEvm()
                      })
                  }
                }}
              >
                <div className="w-full flex items-center gap-3">
                  <img src={item?.icon} className="w-11 h-11" alt="" />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <p className="text-base leading-none inline-flex gap-1 app-font-medium">
                        {item?.name}
                        <DownloadWalletBadge text={t('login.downloadWallet')} />
                      </p>
                    </div>
                    <p className="text-xs text-[#ffffff99] mt-1.5 text-left">
                      {t('wallet.clickConnect')} {item?.name}
                    </p>
                  </div>
                  <div className="flex items-center ml-auto">
                    <ButtonShadowGradient
                      className="h-6 rounded-[200px] text-[calc(13rem/16)] leading-[calc(13rem/16)] disabled:bg-none disabled:bg-[#ECECED]/12 py-[5.5px] px-3.5"
                      //   disabled={item.status !== 'default'}
                    >
                      {item.status === 'default' && t('login.recommend')}
                      {item.status === 'recent' && t('login.recentlyUse')}
                      {item.status === 'installed' && t('login.installed')}
                    </ButtonShadowGradient>
                    <img src="/images/icons/arrow-right.svg" className="w-6 h-6" alt="" />
                  </div>
                </div>
              </button>
            )
          }}
        </WalletButton.Custom>
      ))}
      {/* <Button
        onClick={() => {
          disconnectEvm()
        }}
      >
        disconnect
      </Button> */}
      <div className="pt-5 flex w-full justify-center items-center text-white/70 text-xs pb-3">
        <CheckboxWithLabel
          defaultChecked={isAgree}
          onChange={() => setIsAgree(!isAgree)}
          label={t('login.accept')}
          labelWrapperClassName="text-xs text-white/70"
        />
        <div className="flex items-center">
          <Link className="text-[#50A1FF]" to="/privacy-policy">
            《{t('login.termOfUse')}》
          </Link>
          {t('login.and')}
          <Link className="text-[#50A1FF]" to="/terms-of-service">
            《{t('login.privacyPolicy')}》
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginByWallet
