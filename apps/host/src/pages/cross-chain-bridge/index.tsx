import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/button.tsx'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { IconSortDown } from '@components/icon'
import ListWallets from '@components/common/walletBalance/ListWallets.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import BottomSheet from '@/components/common/BottomSheet'
import ChooseTokenBottomSheet from '@components/crossChainBridge/ChooseTokenBottomSheet.tsx'
import RedemptionPathBottomSheet from '@/components/crossChainBridge/RedemptionPathBottomSheet'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

const CrossChainBridgePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)
  const [openChooseTokenBottomSheet, setOpenChooseTokenBottomSheet] = useState(false)
  const [openRedemptionPathBottomSheet, setOpenRedemptionPathBottomSheet] = useState(false)
  const [openConnectWalletBottomSheet, setOpenConnectWalletBottomSheet] = useState(false)

  const [fromToken, setFromToken] = useState('TRUMP')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState<string | number>('')
  const [toAmount, setToAmount] = useState<string | number>('')
  const [routingSelected, setRoutingSelected] = useState('1')

  const [estimateFromAmount, setEstimateFromAmount] = useState<string | number>('0')
  const [estimateToAmount, setEstimateToAmount] = useState<string | number>('0')

  const mockData = {
    fromToken: 'TRUMP',
    name: 'Trump Official',
    chainId: ChainIds.Solana,
    address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
    price1: '14.234',
    toToken: 'PEPE',
    toChainId: ChainIds.Ethereum,
    toAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    price2: '0.00001526',
    rate: '915000',
    estimatedTime: '23s',
    fee: '0.12',
  }

  const stepConnect = [
    {
      step: 1,
      title: t('crossChainBridge.link.title'),
      description: t('crossChainBridge.link.linkNote'),
    },
    {
      step: 2,
      title: t('crossChainBridge.link.authorization'),
      description: t('crossChainBridge.link.authorizationNote', { token: fromToken }),
    },
    {
      step: 3,
      title: t('crossChainBridge.link.l2Confirmation'),
      description: t('crossChainBridge.link.l2ConfirmationNote'),
    },
  ]

  useEffect(() => {
    if (fromAmount) {
      const estimatedAmount = Number(fromAmount) * Number(mockData.price1)
      setEstimateFromAmount(estimatedAmount)
      setToAmount(Number(fromAmount) * Number(mockData.rate))
    } else {
      setEstimateFromAmount('')
      setToAmount('')
    }
  }, [fromAmount])

  useEffect(() => {
    if (toAmount) {
      const estimatedAmount = Number(toAmount) * Number(mockData.price2)
      setEstimateToAmount(estimatedAmount)
    } else {
      setEstimateToAmount('')
    }
  }, [toAmount])

  const onSelectToken = (token: any) => {
    console.log('Selected token:', token)
  }

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 items-center">
        <img
          src="/images/icons/arrow-left.svg"
          className="w-6 h-6 cursor-pointer"
          alt="arrow-left"
          onClick={() => {
            window.history.back()
          }}
        />
        <div className="font-[380] text-[18px] text-center leading-none whitespace-nowrap">
          {t('crossChainBridge.title')}
        </div>
        <div className="font-medium text-right text-[14px] text-white leading-none">History</div>
      </div>
      <div className="mt-5 p-[1px] bg-gradient-to-br from-[#5E3395] to-[#118E6C] rounded-lg relative">
        <div className="pt-[14px] px-[14px] pb-7 bg-gradient-to-br from-[#25222D] to-[#212C2E] rounded-[8px]">
          <div className="text-[14px] text-white/70 leading-[16px]">
            {t('crossChainBridge.from')} {t('assets.fundingAccount')}
          </div>
          <div className="mt-3 bg-[#141414] rounded-[10px] p-[14px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div>
                <LogoWithChain
                  logo={getBlockChainLogo(mockData.chainId, mockData.address)}
                  logoClassName="w-8 h-8"
                  name={mockData.fromToken}
                  chainLogo={getBlockchainLogo2(mockData.chainId)}
                  chainContainerClassName="w-[14px] h-[14px]"
                />
              </div>
              <div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setOpenChooseTokenBottomSheet(true)}
                >
                  <div className="font-semibold text-[16px] text-white leading-none">{mockData.fromToken}</div>
                  <IconSortDown />
                </div>
                <div className="mt-1 text-[12px] text-white/70 leading-none">{BLOCKCHAIN_NAMES[mockData.chainId]}</div>
              </div>
            </div>
            <div className="flex-1 text-right">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s+/g, '')
                  setFromAmount(value)
                }}
                placeholder={t('crossChainBridge.enterAmount')}
                className="w-full bg-transparent font-semibold text-[20px] text-white leading-[24px] outline-none text-right"
              />
              <div className="mt-1 text-[12px] text-white/50">
                ≈<MoneyFormatted value={Number(estimateFromAmount)} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex">
            <img
              src={activeWallet.avatar}
              className="mr-2 w-4 h-4"
              alt=""
            />
            <ListWallets />
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[26px] z-10 border border-[#fffffff60] rounded-full">
          <div className="bg-gradient-to-tr from-[#3B2244] to-[#1B3B38] rounded-full p-[6px] border-4 border-[#121218]">
            <img src="/images/icons/swap.svg" className="w-6 h-6" alt="swap" />
          </div>
        </div>
      </div>
      <div className="mt-2.5 p-[1px] bg-gradient-to-br from-[#5E3395] to-[#118E6C] rounded-lg">
        <div className="pt-[14px] px-[14px] pb-7 bg-gradient-to-br from-[#25222D] to-[#212C2E] rounded-[8px]">
          <div className="text-[14px] text-white/70 leading-[16px]">
            {t('crossChainBridge.to')} {t('assets.fundingAccount')}
          </div>
          <div className="mt-3 bg-[#141414] rounded-[10px] p-[14px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div>
                <LogoWithChain
                  logo={getBlockChainLogo(mockData.toChainId, mockData.toAddress)}
                  logoClassName="w-8 h-8"
                  name={mockData.toToken}
                  chainLogo={getBlockchainLogo2(mockData.toChainId)}
                  chainContainerClassName="w-[14px] h-[14px]"
                />
              </div>
              <div>
                <div className="font-semibold text-[16px] text-white leading-none">{mockData.toToken}</div>
                <div className="mt-1 text-[12px] text-white/70 leading-none">
                  {BLOCKCHAIN_NAMES[mockData.toChainId]}
                </div>
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="w-full h-6 bg-transparent font-semibold text-[20px] text-white leading-[24px] outline-none text-right">
                {toAmount || 0}
              </div>
              <div className="mt-1 text-[12px] text-white/50">
                ≈<MoneyFormatted value={Number(estimateToAmount)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-white/70">{t('crossChainBridge.redemptionPath.title')}</div>
          <div className="text-right text-[12px] text-white">
            <img
              src="/images/icons/ic-arrow-right-simple.svg"
              className="w-5 h-5 cursor-pointer"
              alt="arrow-right"
              onClick={() => {
                setOpenRedemptionPathBottomSheet(true)
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-white/70">{t('crossChainBridge.exchangeRate')}</div>
          <div className="text-right text-[12px] text-white">
            1 {mockData.fromToken}≈{mockData.rate} {mockData.toToken}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-white/70">{t('crossChainBridge.estimatedTime')}</div>
          <div className="text-right text-[12px] text-white">{mockData.estimatedTime}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-white/70">{t('crossChainBridge.fee')}</div>
          <div className="text-right text-[12px] text-white">
            <MoneyFormatted value={Number(mockData.fee)} />
          </div>
        </div>
      </div>

      <Button
        variant="gradient"
        className="mt-8 w-full rounded-full flex-1 h-11 font-medium text-[16px] text-[#141414]"
        disabled={!fromAmount}
        onClick={() => {
          setOpenConnectWalletBottomSheet(true)
        }}
      >
        {t('crossChainBridge.crossChainExchange')}
      </Button>

      <BottomSheet
        open={openConnectWalletBottomSheet}
        setOpen={setOpenConnectWalletBottomSheet}
        title={t('crossChainBridge.link.title')}
      >
        <slot>
          <div className="ml-4 border-l-[0.5px] border-dashed border-[#C5C7D2]">
            {stepConnect.map((item) => (
              <div key={item.step} className="-ml-4 flex items-center gap-2.5 mb-10">
                <div className="w-8 h-8 flex bg-[#232329]">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border-[0.65px] border-[#ECECED1F] bg-gradient-to-tr from-[#E149F8]/10 via-[#9945FF]/10 to-[#00F3AB]/10">
                    <div className="font-semibold text-[18px] text-white/50">{item.step}</div>
                  </div>
                </div>
                <div className="h-8 -mt-2">
                  <div className="font-medium text-[16px] text-white leading-none">{item.title}</div>
                  <div className="mt-1.5 text-[13px] text-white/50 leading-[1.5]">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="gradient"
            className="mt-8 w-full rounded-full flex-1 h-11 font-medium text-[16px] text-[#141414]"
            onClick={() => {
              navigate('/meme/cross-chain-bridge/tx/0x1234567890abcdef')
            }}
          >
            {t('crossChainBridge.link.title')}
          </Button>
        </slot>
      </BottomSheet>

      <ChooseTokenBottomSheet
        open={openChooseTokenBottomSheet}
        setOpen={setOpenChooseTokenBottomSheet}
        onSelectToken={onSelectToken}
      />
      <RedemptionPathBottomSheet
        open={openRedemptionPathBottomSheet}
        setOpen={setOpenRedemptionPathBottomSheet}
        routingSelected={routingSelected}
        onSelectRouting={setRoutingSelected}
      />
    </div>
  )
}
export default CrossChainBridgePage
