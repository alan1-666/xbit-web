import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { useTranslation } from 'react-i18next'
import { IconNext } from '@components/icon/IconNext.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { IconMoneyGradient, IconRecoveryConvertGradient, IconTradeGradient, IconTriangleDown } from '@components/icon'
import { Button } from '@components/ui/button.tsx'
import { ReactNode, useMemo, useRef, useState } from 'react'
import {
  SelectTransferAccountDrawer,
  SelectTransferAccountDrawerHandle,
} from '@components/transfer/SelectTransferAccountDrawer.tsx'
import { cn } from '@/lib/utils.ts'
import {
  ChooseTransferTokenDrawer,
  ChooseTransferTokenDrawerHandle,
} from '@components/transfer/ChooseTransferTokenDrawer.tsx'
import { APP_PATH } from '@/lib/constant.ts'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'

interface TransferItemProps {
  type: 'from' | 'to'
  account: string
  token: string
  onClick?: () => void
}

const TransferItem = (props: TransferItemProps) => {
  const { type, account, token, onClick } = props
  const { t } = useTranslation()
  const fromText = t('assets.transfers.fromAccount') as string
  const toText = t('assets.transfers.toAccount') as string
  const maxLength = Math.max(fromText.length, toText.length)
  return (
    <div className="bg-[#141414] px-3.5 py-3.5 rounded-[10px] flex items-center cursor-pointer" onClick={onClick}>
      <div
        className={cn(
          'self-start text-[#FFFFFFB2] text-[calc(14rem/16)] leading-4 mr-2',
          maxLength >= 4 ? 'w-9' : 'w-4',
        )}
      >
        {type === 'from' ? fromText : toText}
      </div>
      <div className="flex-1">
        <div className="text-[calc(16rem/16)] leading-4 mb-0.5">{account}</div>
        <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{token}</div>
      </div>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.5229 7.50195H9.81472H6.47559C5.90419 7.50195 5.61849 8.26087 6.02323 8.70575L9.10642 12.0947C9.60045 12.6377 10.404 12.6377 10.898 12.0947L12.0706 10.8058L13.9812 8.70575C14.38 8.26087 14.0943 7.50195 13.5229 7.50195Z"
          fill="#CBCDD4"
        />
      </svg>
    </div>
  )
}

type AccountType = 'funding' | 'futures' | 'spot'

type Account = {
  key: AccountType
  label: string
  icon: ReactNode
  balanceInUsd: number
}

const tokens = [
  {
    name: 'USDC',
    address: USDC_ADDRESS_ARBITRUM,
    chainId: ChainIds.Arbitrum,
    logo: getBlockChainLogo(ChainIds.Arbitrum, USDC_ADDRESS_ARBITRUM),
    balance: 8.02,
    balanceInUsd: 8.02,
  },
  {
    name: 'BTC',
    address: 'NATIVE',
    chainId: ChainIds.BTC,
    logo: getBlockchainLogo2(ChainIds.BTC),
    balance: 0,
    balanceInUsd: 0,
  },
  {
    name: 'ETH',
    address: 'NATIVE',
    chainId: ChainIds.Ethereum,
    logo: getBlockchainLogo2(ChainIds.Ethereum),
    balance: 50,
    balanceInUsd: 237744.9,
  },
]

const getBlockchainName = (chainId: ChainIds) => {
  switch (chainId) {
    case ChainIds.BTC:
      return 'Bitcoin'
    case ChainIds.Ethereum:
      return 'Ethereum'
    case ChainIds.Arbitrum:
      return 'Arbitrum'
    default:
      return ''
  }
}

const getTokenLogo = (token: { name: string; address: string; chainId: ChainIds }) => {
  if (token.address === 'NATIVE') {
    return getBlockchainLogo2(token.chainId)
  } else {
    return getBlockChainLogo(token.chainId, token.address)
  }
}

export const TransferPage = () => {
  const { t } = useTranslation()

  const accountTypes: Account[] = [
    { key: 'funding', label: t('assets.fundingAccount'), icon: <IconMoneyGradient />, balanceInUsd: 0 },
    { key: 'futures', label: t('assets.futuresAccount'), icon: <IconRecoveryConvertGradient />, balanceInUsd: 0 },
    { key: 'spot', label: t('assets.spotAccount'), icon: <IconTradeGradient />, balanceInUsd: 189.12 },
  ]

  const [fromAccountType, setFromAccountType] = useState<AccountType>('funding')
  const [toAccountType, setToAccountType] = useState<AccountType>('spot')
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [amount, setAmount] = useState('')

  const selectAccountRef = useRef<SelectTransferAccountDrawerHandle>(null)
  const chooseTokenRef = useRef<ChooseTransferTokenDrawerHandle>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const amountValue = useMemo(() => (amount ? parseFloat(amount) : 0), [amount])

  const handleChangeAccount = (type: 'from' | 'to') => {
    if (type === 'from') {
      selectAccountRef.current?.show({
        accountType: fromAccountType,
        onChange: (accountType) => {
          setFromAccountType(accountType)
        },
      })
    } else {
      selectAccountRef.current?.show({
        accountType: toAccountType,
        disabledTypes: [fromAccountType],
        onChange: (accountType) => {
          setToAccountType(accountType)
        },
      })
    }
  }

  const fromAccount = useMemo(() => {
    const account = accountTypes.find((account) => account.key === fromAccountType)
    return account!
  }, [fromAccountType])

  const toAccount = useMemo(() => {
    const account = accountTypes.find((account) => account.key === toAccountType)
    return account!
  }, [toAccountType])

  const handleConfirm = () => {
    // Handle transfer confirmation logic here
    console.log('Transfer confirmed:', {
      fromAccount: fromAccountType,
      toAccount: toAccountType,
      token: selectedToken,
      amount: amountValue,
    })
  }

  const handleInputChange = (newValue: string) => {
    const normalizedValue = newValue.replace(/[^0-9.]/g, '')
    setAmount(normalizedValue)
  }

  return (
    <div className="flex max-h-screen h-screen  pt-16 flex-col overflow-hidden bg-[#111] bg-[url('/images/walletCopy/bg_setting.png')] bg-cover bg-center text-white">
      <HeaderWithBack
        title={t('assets.transfer')}
        className="justify-center bg-transparent fixed top-0 left-0 right-0 max-w-[768px] mx-auto"
        titleClassName="ml-0"
        right={t('assets.withdrawal.history')}
        backHref={APP_PATH.ASSETS}
      />
      <div className="px-5 py-8">
        <div className="border-gradient style2 rounded-[8px] px-3 py-3.5 bg-[linear-gradient(90deg,#6D02D70D_0%,#00F59B0D_100%)] mb-4">
          <TransferItem
            type="from"
            account={fromAccount.label}
            token="USDC"
            onClick={() => handleChangeAccount('from')}
          />
          <div className="h-2 relative">
            <div className="absolute h-9 w-full left-0 -top-3.5">
              <div className="size-9 border-gradient before:opacity-10 rounded-full mx-auto">
                <div className="h-full w-full border-[#121218] border-[4px] rounded-full mx-auto bg-[#141414]">
                  <div className="bg-[linear-gradient(37.15deg,#f437ff1a_13.23%,#a53eff1a_37.52%,#00f7a51a_93.06%)] border-gradient before:opacity-10 flex items-center justify-center h-full w-full rounded-full">
                    <IconNext className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <TransferItem type="to" account={toAccount.label} token="USDC" onClick={() => handleChangeAccount('to')} />
        </div>

        <div className="mb-4">
          <div className="mb-2 font-medium text-base">{t('assets.transfers.token')}</div>
          <div
            className="border-gradient style2 rounded-[8px] px-3 py-3.5 bg-[linear-gradient(90deg,#6D02D70D_0%,#00F59B0D_100%)] flex items-center cursor-pointer"
            onClick={() => chooseTokenRef.current?.show()}
          >
            <ChainCurrencyIcon currencyIcon={getTokenLogo(selectedToken)} />
            <div className="flex-1 ml-2">
              <div className="text-[calc(16rem/16)] leading-4">{selectedToken.name}</div>
              <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{getBlockchainName(selectedToken.chainId)}</div>
            </div>
            <IconTriangleDown className="text-[#CBCDD4]" />
          </div>
          {selectedToken.balance === 0 && (
            <div className="mt-1 text-[#FF353C] text-[calc(11rem/16)]">{t('assets.transfers.balanceUnavailable')}</div>
          )}
        </div>

        <div className="mb-6">
          <div className="font-medium text-base mb-2">{t('assets.transfers.amount')}</div>
          <div className="border-gradient style2 rounded-[8px] px-3 py-3.5 bg-[linear-gradient(90deg,#6D02D70D_0%,#00F59B0D_100%)] flex items-center mb-2">
            <div className="flex-1 ml-2">
              <input
                ref={inputRef}
                className="w-full placeholder:text-[#FFFFFF80] text-base no-spin-button"
                placeholder={t('assets.transfers.amountPlaceholder')}
                value={amount}
                inputMode="decimal"
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </div>
            <div>
              <span className="text-[calc(14rem/16)] pr-2">BTC</span>
              <button className="text-rise text-[calc(13rem/16)]" onClick={() => setAmount(selectedToken.balance + '')}>
                {t('assets.transfers.max')}
              </button>
            </div>
          </div>
          <div className="text-[calc(12rem/16)] text-[#FFFFFFB2]">
            {t('assets.transfers.availableBalance')}{' '}
            <span className="text-white">
              {selectedToken.balance} {selectedToken.name}
            </span>
          </div>
          {amountValue > selectedToken.balance && (
            <div className="mt-1 text-[#FF353C] text-[calc(11rem/16)]">余额不足</div>
          )}
        </div>

        <Button
          variant="gradient"
          className="w-full rounded-full text-[#1A1A1A] mt-6"
          disabled={amountValue > selectedToken.balance || amountValue === 0}
          onClick={handleConfirm}
        >
          {t('assets.transfers.confirm')}
        </Button>
      </div>

      <SelectTransferAccountDrawer ref={selectAccountRef} accountTypes={accountTypes} />
      <ChooseTransferTokenDrawer ref={chooseTokenRef} tokens={tokens} onChange={(token) => setSelectedToken(token)} />
    </div>
  )
}
