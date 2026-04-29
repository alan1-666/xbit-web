import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { modal, useAppKitAccount, useWalletInfo } from '@reown/appkit/react'
import { useAppDispatch } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign, NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { useTurnkey } from '@turnkey/sdk-react'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { ChainType, InputLoginWalletV2Dto, LoginV2Dto, TurnkeyVersion } from '@/@generated/gql/graphql-user'
import { ServiceConfig } from '@/lib/gql/service-config'
import { TurnkeyClient } from '@turnkey/http'
import { TStamper, WalletInterface, WalletStamper } from '@turnkey/wallet-stamper'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { WalletConnectWalletName } from '@/lib/wallets/WalletConnectWalletAdapter'
import { trackUserRegistered } from '@/services/google-analytics.service'

export const WalletConnection = ({
  publicKey,
  setLoading,
  setNameWallet,
}: {
  publicKey: string
  setLoading: Dispatch<SetStateAction<boolean>>
  setNameWallet: Dispatch<SetStateAction<string | null>>
}) => {
  const { isConnected, address } = useAppKitAccount()
  const { indexedDbClient } = useTurnkey()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [wallet, setWallet] = useState<WalletInterface | null>(null)
  const [walletClient, setWalletClient] = useState<TurnkeyClient | null>(null)
  const { walletInfo } = useWalletInfo('solana')

  useEffect(() => {
    if (!!isConnected && !!address) {
      setLoading(true)
      setNameWallet(WalletConnectWalletName)
      setWallet({
        signMessage: async (message: any) => {
          const provider: any = modal?.getWalletProvider()
          const signedMessage = await provider?.signMessage(Buffer.from(message))
          return Buffer.from(signedMessage).toString('hex')
        },
        getPublicKey: () => Buffer.from(new PublicKey(address)?.toBuffer()).toString('hex'),
        type: 'solana',
      } as any)
    }
  }, [isConnected, address])

  useEffect(() => {
    if (walletClient) {
      handleSignMessage()
    }
  }, [walletClient])

  const createTurnkeyClient = async (stamper: TStamper) => {
    const { TurnkeyClient } = await import('@turnkey/http')

    return new TurnkeyClient(
      {
        baseUrl: 'https://api.turnkey.com',
      },
      stamper,
    )
  }

  useEffect(() => {
    if (wallet) {
      createTurnkeyClient(new WalletStamper(wallet)).then(setWalletClient)
    }
  }, [wallet])

  const escapeOkxString = (string: string) => {
    const escapedStringList = [
      ['{', '\{'],
      ['}', '\}'],
      ['\n', '\\n'],
      ['"', '\\"'],
    ]

    return escapedStringList.reduce((acc: any, [original, replacement]) => {
      return acc?.replaceAll(original, replacement)
    }, string)
  }

  
  const handleSignMessage = async () => {
    const provider: any = modal?.getWalletProvider()
    const res = await dispatch(
      newAuthActions.getNonce({
        address: address,
      }),
    )
    const nonce = res?.payload?.getNonce
    const message = message_to_sign(address as string, nonce)

    try {
      const isOkx = walletInfo?.name === 'OKX Wallet'
      const messageBytes = new TextEncoder().encode(isOkx ? escapeOkxString(message) : message)
      // const messageBytes = new TextEncoder().encode(message)
      // Request signature from wallet
      const signatureBytes = await provider?.signMessage(messageBytes)

      if (!signatureBytes) {
        await modal?.disconnect()
        setLoading(false)
        indexedDbClient?.resetKeyPair()
        toast.error(t('status.loginFail'))
        return
      }

      const signatureBase64 = Buffer.from(signatureBytes).toString('base64')
      try {
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: message,
            signature: signatureBase64,
            chainType: ChainType.Solana,
          }),
        ).then(async (res) => {
          if (res?.meta?.requestStatus === 'fulfilled') {
            const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
            const userId = res?.payload?.createWalletSubOrgV2?.userId

            // stamp login signing
            const timestampMs = String(Date.now())
            const body = JSON.stringify({
              parameters: {
                publicKey: publicKey,
                expirationSeconds: '604800',
              },
              organizationId: subOrgId,
              timestampMs,
              type: 'ACTIVITY_TYPE_STAMP_LOGIN',
            })
            const stamp = await walletClient?.stamper?.stamp(isOkx ? escapeOkxString(body) : body).catch((error) => {
              modal?.disconnect()
            })
            // const stamp = await walletClient?.stamper?.stamp(body).catch((error) => {
            //   modal?.disconnect()
            // })
            const params: InputLoginWalletV2Dto = {
              organizationId: subOrgId,
              publicKey: publicKey as string,
              stampHeaderName: stamp?.stampHeaderName as string,
              stampHeaderValue: stamp?.stampHeaderValue as string,
              url: '/public/v1/submit/stamp_login',
              timestampMs: timestampMs,
              expirationSeconds: '604800',
            }
            dispatch(newAuthActions.loginByWalletV2(params)).then(async (res) => {
              if (res?.meta?.requestStatus === 'fulfilled') {
                dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.WC))
                const response: LoginV2Dto = res.payload.loginByWalletV2
                ServiceConfig.token = response.accessToken
                dispatch(
                  newAuthActions.updateAccessToken({
                    activeAccount: NEW_TYPE_ACCOUNT.WC,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    userId: userId,
                    subOrgId: response?.subOrgId,
                  }),
                )
                await indexedDbClient?.loginWithSession(response.turnKeyResponse)

                dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
                  if (res.meta?.requestStatus === 'fulfilled') {
                    toast.success(t('status.loginSuccess'))
                    if (res?.payload?.account?.isFirstLogin) {
                      trackUserRegistered(res?.payload?.account?.id || null)
                      dispatch(
                        newWalletActions.updateVerifyWallet({
                          message: message,
                          signature: signatureBase64,
                          isOkxWallet: true,
                        }),
                      )
                    }

                    // todo: remove after migration phrase
                    if (res?.payload?.account?.turnkeyVersion === TurnkeyVersion.V1) {
                      const users = await indexedDbClient?.getUsers()

                      await indexedDbClient?.updateRootQuorum({
                        threshold: 1,
                        userIds: users?.users.map((u) => u.userId) ?? [],
                      })

                      dispatch(newAuthActions.migrateTurnkeyAccount({}))
                    }
                  }
                })
              }
              if (res?.meta?.requestStatus === 'rejected') {
                modal?.disconnect()
                indexedDbClient?.resetKeyPair()
                toast.error(t('status.loginFail'))
                setLoading(false)
              }
            })
          }
          if (res?.meta?.requestStatus === 'rejected') {
            modal?.disconnect()
            toast.error(t('status.loginFail'))
            setLoading(false)
          }
        })
      } catch (error) {
        console.log('[error]: ', error)
        setLoading(false)
        await modal?.disconnect()
      }
    } catch (signError) {
      console.error('Lỗi khi ký message:', signError)
      setLoading(false)
      await modal?.disconnect()
    }
  }

  return <></>
}
