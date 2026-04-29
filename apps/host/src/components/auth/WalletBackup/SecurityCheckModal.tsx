import {
  ReverifyUserAuthenticationDto,
  TurnkeyResultResponse,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { CHAIN_CONFIGS } from '@/components/transfer/constants'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { NEW_TYPE_ACCOUNT, SOL_ADDRESS, solanaMemeProxyConnection } from '@/lib/blockchain'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { reverifyUserAuthenticationMutaion } from '@/services/auth.service'
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { decryptExportBundle, generateP256KeyPair } from '@turnkey/crypto'
import { useTurnkey } from '@turnkey/sdk-react'
import BigNumber from 'bignumber.js'
import Decimal from 'decimal.js'
import { ethers, getAddress, Transaction } from 'ethers'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import VerifyByEmail from './VerifyByEmail'
import VerifyByGoogle from './VerifyByGoogle'
import VerifyByWalletConnect from './VerifyByWalletConnect'
import VerifyByWalletSol from './VerifyByWalletSol'

export type VefiryWalletInput = {
  isOkxWallet?: boolean
  message?: string
  oidcToken?: string
  otpCode?: string
  otpId?: string
  signature?: string
}

export type VefiryWalletResponse = {
  memonic?: string
  privateKey?: string
  activityId?: string
  isOkxWallet?: boolean
  message?: string
  oidcToken?: string
  otpCode?: string
  otpId?: string
  signature?: string
  signedTx?: string
}

type TransactionType = 'TRANSACTION_TYPE_SOLANA' | 'TRANSACTION_TYPE_ETHEREUM' | 'TRANSACTION_TYPE_TRON'

interface SecurityCheckModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  type?: 'mnemonic' | 'privateKey' | 'withdraw' | 'verifyAuth'
  onVerifyWallet?: (response: VefiryWalletResponse) => void
  withdrawData?: {
    token: string
    fromAddress: string
    toAddress: string
    amount: number
    decimals: number
    chainId?: number
    gasLimit?: bigint
    gasPrice?: bigint
  }
  children?: React.ReactNode
  selectedWallet?: UserEmbeddedWalletDto
  transactionType?: TransactionType
}

const SecurityCheckModal = ({
  showModal,
  type = 'verifyAuth',
  setShowModal,
  onVerifyWallet,
  withdrawData,
  children,
  selectedWallet,
  transactionType,
}: SecurityCheckModalProps) => {
  const { indexedDbClient } = useTurnkey()
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const activeWallet = useSelector(_activeWallet)
  const userInfo = useSelector(_userInfo)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!indexedDbClient) {
      return
    }

    indexedDbClient.config.activityPoller = {
      intervalMs: 0,
      numRetries: 0,
    }
  }, [indexedDbClient])

  const onVerifyUser = async (input: VefiryWalletInput) => {
    setLoading(true)
    const keypair = generateP256KeyPair()
    if (type === 'mnemonic') {
      try {
        const bool = await onReverifyUserAuthentication(input)
        if (bool) {
          const activity = await indexedDbClient?.exportWallet({
            walletId: activeWallet?.walletId,
            targetPublicKey: keypair.publicKeyUncompressed,
            language: 'MNEMONIC_LANGUAGE_ENGLISH',
          })
          decryptExportBundle({
            exportBundle: activity?.exportBundle as string,
            embeddedKey: keypair.privateKey,
            organizationId: userInfo?.subOrgId,
            returnMnemonic: true,
          })
            .then((res) => {
              if (onVerifyWallet) {
                onVerifyWallet({
                  memonic: res,
                })
                toast.success(t('walletBackup.mnemonicPrompt.verificationSuccess'))
              }
            })
            .catch((err) => {
              toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
            })
            .finally(() => {
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      } catch (error) {
        toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
        setLoading(false)
        throw error
      }
    }

    if (type === 'privateKey') {
      try {
        const bool = await onReverifyUserAuthentication(input)
        if (bool) {
          const address = selectedWallet?.walletAddress ?? activeWallet?.walletAddress
          const isEvm = address.startsWith('0x')
          const activity = await indexedDbClient?.exportWalletAccount({
            address: isEvm ? getAddress(address) : address,
            targetPublicKey: keypair.publicKeyUncompressed,
          })
          decryptExportBundle({
            exportBundle: activity?.exportBundle as string,
            embeddedKey: keypair.privateKey,
            organizationId: userInfo?.subOrgId,
            returnMnemonic: false,
          })
            .then((privateKey) => {
              if (onVerifyWallet) {
                onVerifyWallet({
                  privateKey,
                })
                toast.success(t('walletBackup.mnemonicPrompt.verificationSuccess'))
              }
            })
            .catch((err) => {
              toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
            })
            .finally(() => {
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
        // onVerifyExportPrivateKey(keypair, activity, input)
      } catch (error) {
        toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
        setLoading(false)
      }
    }
    if (type === 'withdraw') {
      try {
        const bool = await onReverifyUserAuthentication(input)
        if (bool) {
          let unsignedTransaction = ''
          const address = selectedWallet?.walletAddress ?? activeWallet?.walletAddress
          const isEvm = address.startsWith('0x')

          if (transactionType === 'TRANSACTION_TYPE_SOLANA') {
            unsignedTransaction = await rawTransaction()
          } else if (transactionType === 'TRANSACTION_TYPE_ETHEREUM') {
            if (withdrawData?.chainId && +withdrawData?.chainId === 56) {
              unsignedTransaction = await rawTransactionBsc(withdrawData?.chainId)
            } else if (withdrawData?.chainId && +withdrawData?.chainId === 143) {
              unsignedTransaction = await rawTransactionMonad(withdrawData?.chainId)
            }
            else {
              unsignedTransaction = await rawTransactionEvm(withdrawData?.chainId)
            }
          }
          // console.log('unsignedTransaction', unsignedTransaction)
          const activity = await indexedDbClient?.signTransaction({
            type: transactionType || 'TRANSACTION_TYPE_SOLANA',
            signWith: isEvm ? getAddress(address) : address,
            organizationId: userInfo?.subOrgId,
            unsignedTransaction: unsignedTransaction,
          })
          if (onVerifyWallet) {
            onVerifyWallet({
              activityId: activity?.activity?.id,
              ...input,
              signedTx: activity?.signedTransaction,
            })
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('error', error)
        toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
        setLoading(false)
      }
    }
    if (type === 'verifyAuth') {
      try {
        const bool = await onReverifyUserAuthentication(input)
        if (bool) {
          if (onVerifyWallet) {
            onVerifyWallet({
              ...input,
            })
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('error', error)
        toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
        setLoading(false)
      }
    }
  }

  const rawTransaction = async () => {
    if (!withdrawData) {
      return ''
    }
    const connection = solanaMemeProxyConnection
    const fromPubkey = new PublicKey(withdrawData.fromAddress)
    const toPubkey = new PublicKey(withdrawData.toAddress)
    const tokenMint = new PublicKey(withdrawData.token)
    const amount = withdrawData.amount
    const instructions = []
    if (withdrawData.token === SOL_ADDRESS) {
      const ix = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: new BigNumber(amount).multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      })

      instructions.push(ix)
    } else {
      const fromATA = await getAssociatedTokenAddress(tokenMint, fromPubkey)
      const toATA = await getAssociatedTokenAddress(tokenMint, toPubkey)

      const toATAInfo = await connection.getAccountInfo(toATA)
      if (!toATAInfo) {
        instructions.push(createAssociatedTokenAccountInstruction(fromPubkey, toATA, toPubkey, tokenMint))
      }

      const transferAmount = new BigNumber(amount)
        .multipliedBy(10 ** withdrawData.decimals)
        .decimalPlaces(0)
        .toNumber()
      instructions.push(createTransferInstruction(fromATA, toATA, fromPubkey, transferAmount))
    }

    const { blockhash } = await connection.getLatestBlockhash('finalized')

    const messageV0 = new TransactionMessage({
      payerKey: fromPubkey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message()

    const versionedTx = new VersionedTransaction(messageV0)

    const rawTransaction = Buffer.from(versionedTx.serialize()).toString('hex')
    setLoading(false)
    return rawTransaction
  }

  // chainId 42161 _ ARB | 1 _ ETH
  const ETH_CHAIN_ID = 1
  const erc20Iface = new ethers.Interface(['function transfer(address to, uint256 amount) external returns (bool)'])
  const rawTransactionEvm = async (chainId = ETH_CHAIN_ID) => {
    if (!withdrawData) {
      return ''
    }
    const provider = new ethers.JsonRpcProvider(
      chainId === ETH_CHAIN_ID ? CHAIN_CONFIGS.ETH.rpc : CHAIN_CONFIGS.ARBITRUM.rpc,
    )
    const tx = new Transaction()
    const gasPrice = await provider.send('eth_gasPrice', [])
    const parsedAmount = new Decimal(withdrawData.amount.toString())
      .mul(new Decimal(10).pow(withdrawData.decimals))
      .floor()
      .toHex()

    tx.chainId = chainId
    tx.gasPrice = new Decimal(1.2).mul(ethers.toBigInt(gasPrice).toString(10)).floor().toNumber()
    if (!withdrawData.token) {
      tx.to = withdrawData.toAddress
      tx.gasLimit = withdrawData.gasLimit || BigInt(chainId === ETH_CHAIN_ID ? 23000 : 35000)
      tx.gasPrice = withdrawData.gasPrice || tx.gasPrice
      tx.value = parsedAmount
    } else {
      tx.to = withdrawData.token
      tx.data = erc20Iface.encodeFunctionData('transfer', [withdrawData.toAddress, parsedAmount])
      tx.value = 0
      tx.gasPrice = withdrawData.gasPrice || tx.gasPrice
      tx.gasLimit = withdrawData.gasLimit || BigInt(100000)
    }

    const lastNonce = await provider.getTransactionCount(withdrawData.fromAddress, 'latest')
    tx.nonce = lastNonce

    return tx.unsignedSerialized.trim('0x')
  }

  // chainId 56 _ BSC
  const BSC_CHAIN_ID = 56
  const bep20Iface = new ethers.Interface(['function transfer(address to, uint256 amount) external returns (bool)'])
  const rawTransactionBsc = async (chainId = BSC_CHAIN_ID) => {
    if (!withdrawData) {
      return ''
    }

    const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.BSC.rpc ?? 'https://bsc-dataseed.binance.org/')

    const tx = new Transaction()
    const gasPrice = withdrawData?.gasPrice || 120000000
    const gasLimit = withdrawData?.gasLimit || 21000
    const parsedAmount = new Decimal(withdrawData.amount.toString())
      .mul(new Decimal(10).pow(withdrawData.decimals))
      .floor()
      .toHex()
    tx.gasPrice = gasPrice
    tx.chainId = chainId
    tx.type = 0

    if (!withdrawData.token) {
      // Native BNB transfer
      tx.to = withdrawData.toAddress
      tx.gasLimit = gasLimit
      tx.value = parsedAmount
    } else {
      // BEP-20 token transfer
      tx.to = withdrawData.token
      tx.data = bep20Iface.encodeFunctionData('transfer', [withdrawData.toAddress, parsedAmount])
      tx.value = 0
      tx.gasLimit = BigInt(100000)
    }

    const lastNonce = await provider.getTransactionCount(withdrawData.fromAddress, 'latest')
    tx.nonce = lastNonce

    return tx.unsignedSerialized.trim('0x')
  }

  // chainId 143 _ MONAD
  const MONAD_CHAIN_ID = 143
  const monadIface = new ethers.Interface(['function transfer(address to, uint256 amount) external returns (bool)'])
  const rawTransactionMonad = async (chainId = MONAD_CHAIN_ID) => {
    if (!withdrawData) {
      return ''
    }

    const provider = new ethers.JsonRpcProvider('https://rpc.monad.xyz/')

    const tx = new Transaction()
    const gasPrice = withdrawData?.gasPrice || 120000000
    const gasLimit = withdrawData?.gasLimit || 21000
    const parsedAmount = new Decimal(withdrawData.amount.toString())
      .mul(new Decimal(10).pow(withdrawData.decimals))
      .floor()
      .toHex()
    tx.gasPrice = gasPrice
    tx.chainId = chainId
    tx.type = 0

    if (!withdrawData.token) {
      // Native token transfer
      tx.to = withdrawData.toAddress
      tx.gasLimit = gasLimit
      tx.value = parsedAmount
    } else {
      // Token transfer
      tx.to = withdrawData.token
      tx.data = monadIface.encodeFunctionData('transfer', [withdrawData.toAddress, parsedAmount])
      tx.value = 0
      tx.gasLimit = BigInt(100000)
    }

    const lastNonce = await provider.getTransactionCount(withdrawData.fromAddress, 'latest')
    tx.nonce = lastNonce

    return tx.unsignedSerialized.trim('0x')
  }

  const onReverifyUserAuthentication = async (input: VefiryWalletInput) => {
    try {
      const res = await userGqlClient?.mutate<any>({
        mutation: reverifyUserAuthenticationMutaion,
        variables: {
          input: {
            ...input,
          } as ReverifyUserAuthenticationDto,
        },
      })

      const response: TurnkeyResultResponse = res?.data?.reverifyUserAuthentication?.result
      // console.log('response', res)
      if (!response) {
        toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
      }

      return response
    } catch (error: any) {
      if (error) {
        const errorCode = error[0]?.code
        toast.error(t(`authenVerify.${errorCode}`), {
          duration: 3000,
        })
      } else {
        toast.error(t('walletBackup.mnemonicPrompt.verificationFailed'))
      }
      return false
    }
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent
          className="bg-[#232329] !rounded-2xl w-[334px] p-0 shadow-xl !left-1/2 !top-1/2 !transform !-translate-x-1/2 !-translate-y-1/2"
          showDialogPrimitiveClose={false}
          onInteractOutside={(event) => event?.preventDefault()}
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute right-3 top-3 p-1 rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-4 py-6 flex flex-col">
            <DialogTitle className="text-white text-lg font-medium text-center mb-5 mt-1">
              {t('walletBackup.mnemonicPrompt.securityCheck')}
            </DialogTitle>
            {activeAccount === NEW_TYPE_ACCOUNT.EMAIL && <VerifyByEmail onVerifyUser={onVerifyUser} />}
            {activeAccount === NEW_TYPE_ACCOUNT.APPLE && <VerifyByEmail onVerifyUser={onVerifyUser} />}
            {activeAccount === NEW_TYPE_ACCOUNT.GOOGLE && <VerifyByGoogle onVerifyUser={onVerifyUser} />}
            {/* {activeAccount === NEW_TYPE_ACCOUNT.WALLET && <VerifyByWallet onVerifyUser={onVerifyUser} />} */}
            {activeAccount === NEW_TYPE_ACCOUNT.WALLET && <VerifyByWalletSol onVerifyUser={onVerifyUser} />}
            {activeAccount === NEW_TYPE_ACCOUNT.WC && <VerifyByWalletConnect onVerifyUser={onVerifyUser} />}
            {/* {activeAccount === NEW_TYPE_ACCOUNT.WC && <VerifyByNewWalletConnect onVerifyUser={onVerifyUser} />} */}
            {loading && (
              <div className="flex items-center justify-center mt-4">
                <LoadingSpinner size={16} />
              </div>
            )}
            <div className="border-t border-[#565656] my-4 border-dashed"></div>
            <div className="w-full text-[#F23F58] text-center transition-colors text-sm">
              {t('walletBackup.mnemonicPrompt.verifyWallet')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SecurityCheckModal
