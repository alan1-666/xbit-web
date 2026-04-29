// DepositDrawer.tsx
import AppDrawer from '@/components/common/AppDrawer'
import ButtonShadowGradient from '@/components/common/buttons/ButtonShadowGradient'
import LogoWithChain from '@/components/common/LogoWithChain'
import {
  CHAIN_CONFIGS,
  HYPERLIQUID_BRIDGE_ADDRESS,
  HYPERLIQUID_DEPOSIT_MIN_AMOUNT,
  USDC_ADDRESS_ARBITRUM,
} from '@/components/transfer/constants'
// import { checkArbEth } from '@/components/transfer/lib/helper' // 🚫 Permit 模式下不再需要检测 ARB_ETH
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { useResponsive } from '@/hooks/useResponsive'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppDispatch } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { useTurnkey } from '@turnkey/sdk-react'
import { concat, ethers, hexlify } from 'ethers'
import { FC, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createPublicClient, formatUnits, http } from 'viem'
import { arbitrum } from 'viem/chains'

import { walletClient } from '@/lib/gql/apollo-client'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { submitPermitDeposit } from '@/services/wallet.service.ts'
import { getAddress } from 'ethers'
interface DepositDrawerProps {
  open: boolean
  setOpenDrawer: React.Dispatch<SetStateAction<boolean>>
}

// const SUBMIT_PERMIT_DEPOSIT = gql`
//   mutation SubmitPermitDeposit($input: SubmitPermitDepositInput!) {
//     submitPermitDeposit(input: $input) {
//       id
//       status
//     }
//   }
// `

const DepositDrawer: FC<DepositDrawerProps> = ({ open, setOpenDrawer }) => {
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId
  const walletDex = useSelector(_walletDex)
  const navigate = useNavigate()
  const [balance, setBalance] = useState<string>('0')
  const [amount, setAmount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // const [hasArbEth, setHasArbEth] = useState<boolean>(true) // 🚫 Permit 模式下不再需要
  const normalizeBytes32 = (value: string) => {
    if (!value.startsWith('0x')) {
      return `0x${value}`
    }
    return value
  }

  const { isDesktop } = useResponsive()

  const walletAddress = walletDex?.walletAddress ? getAddress(walletDex?.walletAddress) : ''
  useEffect(() => {
    if (open) {
      setAmount(null)
      setIsLoading(false)
      retrieveBalance()
      // 🚫 Permit 模式下不再检测 ARB_ETH
      // const check = async () => {
      //   const checkHas = await checkArbEth(walletDex?.walletAddress as Address)
      //   setHasArbEth(checkHas)
      // }
      // check()
    }
  }, [open, walletAddress])

  const handleMaxIn = useCallback(() => setAmount(balance), [balance])
  const dispatch = useAppDispatch()
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (!/^\d*\.?\d*$/.test(value)) return

    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.')
      if (decPart.length > 6) return
      value = intPart + '.' + decPart
    }

    setAmount(value)
  }

  const retrieveBalance = async () => {
    if (!walletAddress) return
    const arbitrumClient = createPublicClient({
      chain: arbitrum,
      transport: http(CHAIN_CONFIGS.ARBITRUM.rpc),
    })
    try {
      const bal = (await arbitrumClient.readContract({
        address: USDC_ADDRESS_ARBITRUM,
        abi: [
          {
            constant: true,
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            type: 'function',
          },
        ],
        functionName: 'balanceOf',
        args: [walletAddress],
      })) as bigint
      console.log('bal', bal)
      const formatted = formatUnits(bal, 6)
      setBalance(formatted)
    } catch (err) {
      console.error('Failed to retrieve balance:', err)
      setBalance('0')
    }
  }

  const handleDeposit = async () => {
    if (!walletDex?.walletAddress) {
      toast.error(t('assets.deposit.walletMissing'))
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error(t('assets.deposit.invalidAmount'))
      return
    }

    setIsLoading(true)
    try {
      const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.ARBITRUM.rpc)

      const tokenIface = new ethers.Interface([
        'function name() view returns (string)',
        'function decimals() view returns (uint8)',
        'function nonces(address) view returns (uint256)',
      ])

      const [nameRes, nonceRes, decimalsRes] = await Promise.all([
        provider.call({ to: USDC_ADDRESS_ARBITRUM, data: tokenIface.encodeFunctionData('name') }),
        provider.call({ to: USDC_ADDRESS_ARBITRUM, data: tokenIface.encodeFunctionData('nonces', [walletAddress]) }),
        provider.call({ to: USDC_ADDRESS_ARBITRUM, data: tokenIface.encodeFunctionData('decimals') }),
      ])

      const tokenName = tokenIface.decodeFunctionResult('name', nameRes)[0]
      const nonce = Number(tokenIface.decodeFunctionResult('nonces', nonceRes)[0])
      const decimals = Number(tokenIface.decodeFunctionResult('decimals', decimalsRes)[0])
      const tokenVersion = '2'
      // CHAIN_CONFIGS.ARBITRUM.chainId
      const chainId = 42161
      console.log('chainId', chainId)
      const deadline = Math.floor(Date.now() / 1000) + 3600
      const parsedValue = ethers.parseUnits(amount, decimals) // parseUnits(amount, decimals)
      console.log('parsedValue', parsedValue)

      const domain = {
        name: tokenName,
        version: tokenVersion,
        chainId,
        verifyingContract: USDC_ADDRESS_ARBITRUM,
      }

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const message = {
        owner: walletAddress,
        spender: HYPERLIQUID_BRIDGE_ADDRESS,
        value: parsedValue.toString(),
        nonce: nonce.toString(),
        deadline: deadline.toString(),
      }
      const activity = await indexedDbClient?.signRawPayload({
        organizationId: subOrgId,
        signWith: walletAddress,
        payload: JSON.stringify({
          domain,
          types,
          primaryType: 'Permit',
          message,
        }),
        encoding: 'PAYLOAD_ENCODING_EIP712',
        hashFunction: 'HASH_FUNCTION_NOT_APPLICABLE',
      })

      if (!activity) throw new Error('Turnkey signing failed')
      let r = normalizeBytes32(activity.r)
      let s = normalizeBytes32(activity.s)
      let v = Number(activity.v)
      if (v === 0 || v === 1) v += 27
      const digest = ethers.TypedDataEncoder.hash(domain, types, message)
      const recovered = ethers.recoverAddress(digest, { r, s, v })

      if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Signature does not match owner!')
      }
      // v 值有时是 0/1，需要转换成 27/28
      const vFixed = v < 27 ? v + 27 : v
      // 拼接标准的以太坊签名格式: 0x + r(64位) + s(64位) + v(2位)
      const signature = hexlify(
        concat([
          r,
          s,
          '0x' + vFixed.toString(16).padStart(2, '0'), // 转成 1 字节的十六进制
        ]),
      )
      const { data } = await walletClient.mutate({
        mutation: submitPermitDeposit,
        variables: {
          input: {
            address: walletAddress,
            tokenName,
            amount,
            chainId,
            tokenAddress: USDC_ADDRESS_ARBITRUM,
            signature,
            nonce,
            tokenDecimal: decimals,
            deadline,
          },
        },
      })
      if (data?.submitPermitDeposit?.status === 'Success' || data?.submitPermitDeposit?.status === 'Pending') {
        toast.success(t('assets.overview.depositSuccess'))
        setAmount(null)
        setOpenDrawer(false)
        await retrieveBalance()
      } else {
        throw new Error('Backend submission failed')
      }
    } catch (error: any) {
      console.error('Permit deposit error:', error)
      toast.error(t('assets.overview.depositFailed'))

      // handleHyperliquidTransfer( 'FuturesDeposit', 0xa4b1, 0, 999, '', 'Failed', error?.code, error?.message, undefined)
    } finally {
      setIsLoading(false)
    }
  }

  const isDepositDisabled =
    !amount ||
    Number(amount) <= 0 ||
    Number(amount) > Number(balance) ||
    Number(amount) < HYPERLIQUID_DEPOSIT_MIN_AMOUNT ||
    isLoading

  const handleNavigate = (type: string) => {
    isDesktop
      ? dispatch(
          exchangeActions.openExchangeDialog({
            defaultTab: 'deposit',
          }),
        )
      : navigate(`/deposit`, { state: { type, source: 'futuresTrade' } })
  }

  const modalContent = (
    <div className="mt-2">
      <div className="mt-4 px-[14px] py-3 rounded-[8px] border-[1px] border-[#ECECED1F]">
        <h5 className="text-sm text-[#FFFFFFB2]">{t('assets.deposit.quantity')}</h5>
        <div className="px-3 py-[16.5px] bg-[#141414] mt-2 rounded-[8px] flex gap-2 justify-between">
          <div className="flex items-center gap-1">
            <LogoWithChain
              logo="/images/withdrawal/usdc.png"
              logoClassName="w-8"
              name="USDC"
              chainLogo="/images/icons/chains/ic-arbitrum.svg"
              chainInnerClassName="w-[14px] h-[14px]"
            />
            <div className="flex flex-col gap-1 ml-[8px]">
              <div className="text-sm text-white">USDC</div>
              <div className="text-sm text-white/70">Arbitrum</div>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              placeholder="0.0"
              value={amount ?? ''}
              onChange={(e) => {
                const value = e.target.value
                if (/^\d*\.?\d{0,8}$/.test(value)) {
                  handleAmountChange(e)
                }
              }}
              className="w-full text-[18px] text-end bg-transparent outline-none"
            />
            <div
              className="text-[#00FFB4] ml-2 cursor-pointer text-sm font-medium cursor-pointer py-1 text-right ml-2 whitespace-nowrap w-auto flex-shrink-0"
              onClick={handleMaxIn}
            >
              {t('assets.deposit.max')}
            </div>
          </div>
        </div>
        <div className="mt-[8px] flex justify-between text-[#FFFFFFB2] text-[12px]">
          <span>{t('assets.deposit.availableBalance')}</span>
          <span className="text-white text-[13px]">{Number(balance)} USDC</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-[#FFFFFF80]">
        {t('assets.deposit.min')}
        <span className="text-white ml-1">{HYPERLIQUID_DEPOSIT_MIN_AMOUNT} USDC</span>
      </div>
      <div className="mt-[24px] pb-2.5">
        {Number(balance) < HYPERLIQUID_DEPOSIT_MIN_AMOUNT ? (
          <div>
            <div className="text-[#E14650] text-[12px] mb-[12px]">
              {t('assets.deposit.balanceNotEnough')},{t('assets.deposit.goToDeposit')}
            </div>
            <ButtonShadowGradient className="w-full h-11" onClick={() => handleNavigate('ARB_USDC')}>
              {t('assets.deposit.goToDeposit')}
            </ButtonShadowGradient>
          </div>
        ) : (
          <ButtonShadowGradient className="w-full h-11" onClick={handleDeposit} disabled={isDepositDisabled}>
            {isLoading ? t('assets.deposit.processing') : t('assets.deposit.confirm')}
          </ButtonShadowGradient>
        )}
      </div>
    </div>
  )

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpenDrawer}>
          <DialogContent className="bg-[#232329]">
            <DialogHeader>
              <DialogTitle className="text-[18px]">{t('assets.deposit.futuresDepositTitle')}</DialogTitle>
            </DialogHeader>
            {modalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <AppDrawer
          open={open}
          setOpen={setOpenDrawer}
          title={t('assets.deposit.futuresDepositTitle')}
          drawerHeaderClassName="py-[14px]"
          isShowBgImg={false}
          drawerContent={modalContent}
        />
      )}
    </>
  )
}

export default DepositDrawer
