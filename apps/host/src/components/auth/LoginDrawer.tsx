// import React, { useEffect, useRef, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import AppDrawer from '@components/common/AppDrawer.tsx'
// import { useTurnkey } from '@turnkey/sdk-react'
// import { Button } from '../ui/button'
// import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
// import { sha256 } from '@noble/hashes/sha2'
// import { bytesToHex } from '@noble/hashes/utils'
// import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
// import { WalletButton } from '@rainbow-me/rainbowkit'
// import clsx from 'clsx'
// import { metaMask } from '@wagmi/connectors'
// import { toast } from 'sonner'
// import { newAuthActions } from '@/redux/modules/newAuth.slice'
// import { useAppDispatch } from '@/redux/store'
// import { message_to_sign, NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
// import {
//   ChainType,
//   InitOtpAuthResponseDto,
//   InputLoginGoogleDto,
//   InputLoginWalletV2Dto,
//   LoginEmailOtpDto,
//   LoginV2Dto,
//   LoginWithEmailOtpInputDto,
// } from '@/@generated/gql/graphql-user'
// import { ServiceConfig } from '@/lib/gql/service-config'
// import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
// import { AuthClient, setStorageValue, StorageKeys, getStorageValue } from '@turnkey/sdk-browser'
// import { TurnkeyClient } from '@turnkey/http'
// import { TStamper, WalletInterface, WalletStamper, WalletType } from '@turnkey/wallet-stamper'
// import { useSelector } from 'react-redux'
// import { authActions } from '@/redux/modules/auth.slice'
// const NewLoginDrawer: React.FC = () => {
//   const { t } = useTranslation()
//   const [open, setOpen] = useState<boolean>(false)
//   return (
//     <>
//       <button className="flex items-center h-full" onClick={() => setOpen(true)}>
//         <span>{t('wallet.connectGuide')}</span>
//       </button>
//       <AppDrawer open={open} setOpen={setOpen} drawerContent={<DrawerContent />} />
//     </>
//   )
// }

// const DrawerContent = () => {
//   const { t } = useTranslation()
//   const dispatch = useAppDispatch()
//   const { turnkey, walletClient, authIframeClient } = useTurnkey()

//   const [initEmail, setInitEmail] = useState<InitOtpAuthResponseDto>()

//   const getStampOath = async (targetSubOrgId: string, credential: string, timestampMs: string) => {
//     console.log('[targetPublicKey: ]', authIframeClient?.iframePublicKey)
//     const parameters = {
//       oidcToken: credential,
//       targetPublicKey: authIframeClient?.iframePublicKey,
//     }
//     const fullUrl = walletClient?.config.apiBaseUrl + '/public/v1/submit/oauth'
//     const body = JSON.stringify({
//       parameters,
//       organizationId: targetSubOrgId,
//       timestampMs: timestampMs,
//       type: 'ACTIVITY_TYPE_OAUTH',
//     })
//     const stamp = await walletClient?.config?.stamper?.stamp(body)
//     return {
//       body: body,
//       stamp: stamp,
//       url: fullUrl,
//     }
//   }

//   const handleGoogleLogin = async (response: CredentialResponse) => {
//     console.log("[CredentialResponse]: ", response)
//     const credential = response?.credential
//     if (!credential) {
//       alert('Login fail')
//     }
//     dispatch(
//       newAuthActions.createGoogleSubOrgWallet({
//         idToken: credential!,
//       }),
//     ).then(async (res) => {
//       if (res?.meta?.requestStatus === 'fulfilled') {
//         console.log('[createGoogleSubOrgWallet]: ', res?.payload?.createGoogleSubOrg)
//         const subOrgId = res?.payload?.createGoogleSubOrg?.subOrgId
//         const userId = res?.payload?.createGoogleSubOrg?.userId
//         console.log('[subOrgId Google]: ', subOrgId)

//         const timestampMs = Date.now().toString()
//         const oauthResponse = await walletClient?.stampOauth({
//           oidcToken: credential!,
//           targetPublicKey: authIframeClient?.iframePublicKey as string,
//           organizationId: subOrgId,
//           timestampMs: timestampMs,
//         })
//         if (!authIframeClient?.iframePublicKey) {
//           toast.error(t('status.loginFail'))
//           return
//         }
//         // const oauthResponse = await getStampOath(subOrgId, credential!, timestampMs)
//         console.log('oauthResponseTimeStamp', oauthResponse)
//         const params: InputLoginGoogleDto = {
//           organizationId: subOrgId,
//           stampHeaderName: oauthResponse?.stamp?.stampHeaderName as string,
//           stampHeaderValue: oauthResponse?.stamp?.stampHeaderValue as string,
//           url: oauthResponse?.url as string,
//           timestampMs: timestampMs,
//           idToken: credential!,
//           targetPublicKey: authIframeClient?.iframePublicKey,
//         }
//         dispatch(newAuthActions.loginWithGoogle(params)).then(async (res) => {
//           console.log('[Res loginWithGoogle]: ', res)
//           if (res?.meta?.requestStatus === 'fulfilled') {
//             dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.GOOGLE))
//             const response: LoginV2Dto = res.payload.loginByWalletV2
//             ServiceConfig.token = response.accessToken
//             dispatch(
//               newAuthActions.updateAccessToken({
//                 activeAccount: NEW_TYPE_ACCOUNT.WALLET,
//                 accessToken: response.accessToken,
//                 refreshToken: response.refreshToken,
//                 userId: userId,
//               }),
//             )
//             dispatch(newWalletActions.getAccountInfo({})).then(() => {
//               toast.success(t('status.loginSuccess'))
//             })
//           }
//           if (res?.meta?.requestStatus === 'rejected') {
//             toast.error(t('status.loginFail'))
//           }
//         })
//       }
//       if (res?.meta?.requestStatus === 'rejected') {
//         toast.error(t('status.loginFail'))
//       }
//     })
//   }

//   const handleClickLoginByEmail = async () => {
//     const email = 'ducvt@xtechgroup.io'
//     dispatch(newAuthActions.initEmailOtp({ email })).then((res) => {
//       if (res?.meta?.requestStatus === 'fulfilled') {
//         const responseInitEmailOtp: InitOtpAuthResponseDto = res?.payload?.initEmailOtp
//         // const otpId = responseInitEmailOtp.otpId
//         // const userId = responseInitEmailOtp.userId
//         // const subOrgId = responseInitEmailOtp.subOrgId
//         // const ttl = responseInitEmailOtp.ttl
//         setInitEmail(responseInitEmailOtp)
//         toast.success('Email sent')
//       }
//       if (res?.meta?.requestStatus === 'rejected') {
//         toast.error(t('status.loginFail'))
//       }
//     })
//   }

//   const handleSendOtp = (otp: string) => {
//     const params: LoginWithEmailOtpInputDto = {
//       email: 'ducvt@xtechgroup.io',
//       otpCode: otp,
//       otpId: initEmail?.otpId as string,
//       targetPublicKey: authIframeClient?.iframePublicKey as string,
//     }
//     dispatch(newAuthActions.loginWithEmailOtp(params)).then((res) => {
//       if (res?.meta?.requestStatus === 'fulfilled') {
//         const response: LoginEmailOtpDto = res?.payload?.loginWithEmailOtpV2
//         console.log('[loginWithEmailOtp]', response)
//         ServiceConfig.token = response.accessToken
//         dispatch(
//           newAuthActions.updateAccessToken({
//             activeAccount: NEW_TYPE_ACCOUNT.EMAIL,
//             accessToken: response.accessToken,
//             refreshToken: response.refreshToken,
//             userId: response?.userId,
//           }),
//         )
//       }
//       if (res?.meta?.requestStatus === 'rejected') {
//         toast.error(t('status.loginFail'))
//       }
//     })
//   }

//   return (
//     <div>
//       <h1 className="text-[calc(14rem/16)]">https://app.duckgang.com/</h1>
//       <h1 className="text-[calc(14rem/16)]">去生成一个去中心化MPC钱包</h1>
//       <div className="flex items-center flex-col gap-2 justify-center w-full">
//         {authIframeClient?.iframePublicKey && (
//           <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOLE_OAUTH_CLIENT_ID!}>
//             <GoogleLogin
//               nonce={bytesToHex(sha256(authIframeClient?.iframePublicKey))}
//               onSuccess={handleGoogleLogin}
//               useOneTap
//             />
//           </GoogleOAuthProvider>
//         )}
//         <Button onClick={handleClickLoginByEmail}>Login By Email</Button>
//         <Button
//           onClick={() => {
//             handleSendOtp('557661')
//           }}
//         >
//           SendOTP
//         </Button>
//         <LoginByWallet />
//         {/* <TelegramAuthExample /> */}
//       </div>
//     </div>
//   )
// }

// const LoginByWallet = () => {
//   const { t } = useTranslation()
//   const { connectAsync: connectMetaMask, connectors } = useConnect()
//   const visibleWallets = [
//     // { id: 'metamask', name: 'MetaMask', icon: '/images/icons/metamask-icon.png' },
//     { id: 'okx', name: 'OKX Wallet', icon: '/images/icons/okx-icon.png' },
//   ]
//   const { address, isConnected: isEvmConnected } = useAccount()
//   const { disconnect: disconnectEvm } = useDisconnect()
//   const { signMessageAsync } = useSignMessage({})
//   const { turnkey, walletClient } = useTurnkey()
//   // const [newWalletClient, setNewWalletClient] = useState<TurnkeyClient | null>(null)
//   const dispatch = useAppDispatch()
//   // const createTurnkeyClient = async (stamper: TStamper) => {
//   //   const { TurnkeyClient } = await import('@turnkey/http')

//   //   return new TurnkeyClient(
//   //     {
//   //       baseUrl: 'https://api.turnkey.com',
//   //     },
//   //     stamper,
//   //   )
//   // }
//   // useEffect(() => {
//   //   createTurnkeyClient(
//   //     new WalletStamper({
//   //       signMessage: async (message) => {
//   //         // const signedMessage = await signMessageAsync(Buffer.from(message))
//   //         // return Buffer.from(signedMessage).toString('hex')
//   //         const messageSigned = await signMessageAsync({ message: message })
//   //         return messageSigned
//   //       },
//   //       getPublicKey: () =>
//   //         new Promise((resolve, reject) => {

//   //           Buffer.from(publicKey?.toBuffer()).toString("hex")
//   //         }),
//   //       type: WalletType.Ethereum,
//   //     }),
//   //   ).then(setNewWalletClient)
//   // }, [])

//   const handleSignMessageWallet = async () => {
//     dispatch(
//       newAuthActions.getNonce({
//         address,
//       }),
//     ).then(async (res) => {
//       const nonce = res?.payload?.getNonce
//       const message = message_to_sign(address!, nonce)

//       console.log('message', message)
//       try {
//         const messageSigned = await signMessageAsync({ message: message })
//         dispatch(
//           newAuthActions.createWalletSubOrgWallet({
//             message: message,
//             signature: messageSigned,
//             chainType: ChainType.Evm,
//           }),
//         ).then(async (res) => {
//           if (res?.meta?.requestStatus === 'fulfilled') {
//             const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
//             const userId = res?.payload?.createWalletSubOrgV2?.userId
//             console.log('[subOrgId]: ', subOrgId)
//             // Create a new wallet with the signature
//             const signedWhoamiRequest = await walletClient?.stampGetWhoami({
//               organizationId: subOrgId, // replace with actual org ID from STEP 2
//             })
//             console.log('[Res signedWhoamiRequest]', signedWhoamiRequest)
//             const params: InputLoginWalletV2Dto = {
//               organizationId: subOrgId,
//               stampHeaderName: signedWhoamiRequest?.stamp?.stampHeaderName as string,
//               stampHeaderValue: signedWhoamiRequest?.stamp?.stampHeaderValue as string,
//               url: signedWhoamiRequest?.url as string,
//             }
//             dispatch(newAuthActions.loginByWalletV2(params)).then(async (res) => {
//               console.log('[Res loginByWalletV2]: ', res)
//               if (res?.meta?.requestStatus === 'fulfilled') {
//                 dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.WALLET))
//                 const response: LoginV2Dto = res.payload.loginByWalletV2
//                 ServiceConfig.token = response.accessToken
//                 dispatch(
//                   newAuthActions.updateAccessToken({
//                     activeAccount: NEW_TYPE_ACCOUNT.WALLET,
//                     accessToken: response.accessToken,
//                     refreshToken: response.refreshToken,
//                     userId: userId,
//                   }),
//                 )
//                 dispatch(newWalletActions.getAccountInfo({})).then(() => {
//                   toast.success(t('status.loginSuccess'))
//                 })
//               }
//               if (res?.meta?.requestStatus === 'rejected') {
//                 disconnectEvm()
//                 toast.error(t('status.loginFail'))
//               }
//             })
//           }
//           if (res?.meta?.requestStatus === 'rejected') {
//             disconnectEvm()
//             toast.error(t('status.loginFail'))
//           }
//         })
//         if (res?.meta?.requestStatus === 'rejected') {
//           disconnectEvm()
//           toast.error(t('status.loginFail'))
//         }
//       } catch (error) {
//         console.log('[error]: ', error)
//         disconnectEvm()
//       }
//     })
//   }

//   const flagRef = useRef(0)
//   const acctiveWallet = useSelector(_activeWallet)
//   useEffect(() => {
//     if (!isEvmConnected || !address || !acctiveWallet?.isConnected) {
//       flagRef.current = 0
//     }
//     if (isEvmConnected && address && !acctiveWallet?.isConnected && flagRef.current === 0) {
//       handleSignMessageWallet()
//       flagRef.current = 1
//     }
//   }, [isEvmConnected, address])

//   const handleLogout = async () => {
//     indexedDbClient?.resetKeyPair()
//     dispatch(
//       newAuthActions.logout({
//         activeAccount: NEW_TYPE_ACCOUNT.WALLET,
//         accessToken: '',
//         refreshToken: '',
//       }),
//     )
//     dispatch(newWalletActions.logoutWallet({}))
//     disconnectEvm()
//   }

//   return (
//     <div>
//       {visibleWallets.map((item) => (
//         <WalletButton.Custom wallet={item.id} key={item.id}>
//           {({ ready, connect, connector }) => {
//             // console.log('connector', connector)
//             return (
//               <button
//                 className={clsx(
//                   'flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground',
//                   // !checked && 'cursor-not-allowed',
//                 )}
//                 key={item?.name}
//                 // disabled={!ready}
//                 onClick={() => {
//                   // if (!checked) {
//                   //   toast.error(t('toast.termsAgreement'))
//                   //   return
//                   // }
//                   const mm = connectors.find((c) => item.name === 'MetaMask')
//                   if (mm) {
//                     connectMetaMask({ connector: metaMask() })
//                       .then(() => {})
//                       .catch(() => {
//                         disconnectEvm()
//                       })
//                   } else {
//                     connect()
//                       .then(() => {})
//                       .catch(() => {
//                         disconnectEvm()
//                       })
//                   }
//                 }}
//               >
//                 <div className="w-full flex items-center gap-4">
//                   <img src={item?.icon} className="w-11 h-11" alt="" />
//                   <div>
//                     <div className="flex items-center gap-1.5">
//                       <p className="text-base leading-none">{item?.name}</p>
//                     </div>
//                     <p className="text-xs text-[#ffffff99] mt-1.5">
//                       {t('wallet.clickConnect')} {item?.name}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-3 ml-auto">
//                     <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
//                   </div>
//                 </div>
//               </button>
//             )
//           }}
//         </WalletButton.Custom>
//       ))}
//       {/* <Button
//         onClick={() => {
//           disconnectEvm()
//         }}
//       >
//         disconnect
//       </Button> */}
//       {acctiveWallet?.isConnected && <p>{acctiveWallet?.walletId}</p>}
//       {acctiveWallet?.isConnected && (
//         <Button
//           onClick={() => {
//             handleLogout()
//           }}
//         >
//           Logout
//         </Button>
//       )}
//     </div>
//   )
// }
// export default NewLoginDrawer
