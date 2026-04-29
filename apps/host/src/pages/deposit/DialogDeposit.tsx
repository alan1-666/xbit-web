import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import { Button } from '@components/ui/button.tsx'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, getBlockchainLogo2 } from '@/utils/helpers.ts'
import ShareBottomSheet from '@components/common/ShareBottomSheet.tsx'
import { APP_PATH } from '@/lib/constant.ts'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useAppSelector } from '@/redux/store'
import { IconChevronDown, IconTriangleDown } from '@components/icon'
import ChooseTokenPopup from '@components/assets/deposit/ChooseTokenPopup2.tsx'
import { SelectWalletDrawer } from '@components/assets/deposit/SelectWalletDrawer.tsx'
import { MinimumDepositWarningDrawer } from '@components/assets/deposit/MinimumDepositWarningDrawer.tsx'
import { ethers } from 'ethers'
import { useQuery } from '@tanstack/react-query'
import { IconInfo } from '@components/icon/stroke/iconInfo.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import { useQuery as useQueryApollo } from '@apollo/client'
import { getFirstDepositUSDC } from '@/services/assets.service'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import ls from '@/lib/local-storage.ts'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useUserReferralSnapshot } from '@/hooks/useUserReferralSnapshot'
const TTL_STORAGE = 1000 * 60 * 60 * 24 * 14 // 2 weeks

type SelectedToken = {
  chainId: ChainIds
  token: string
}

const tokenLogoMap: Record<string, string> = {
  SOL: '/images/icons/chains/ic-solana.svg',
  USDC: '/images/icons/chains/ic-usdc.svg',
  ETH: '/images/icons/chains/ic-ethereum.svg',
  'ARB-ETH': '/images/icons/chains/ic-ethereum.svg',
}

const chainIconMap: Record<number, string> = {
  [ChainIds.Solana]: '/images/icons/chains/ic-solana.svg',
  [ChainIds.Ethereum]: '/images/icons/chains/ic-ethereum.svg',
  [ChainIds.Arbitrum]: '/images/icons/chains/ic-arbitrum.svg',
}

const tokenNameMap: Record<string, string> = {
  SOL: 'SOL',
  USDC: 'USDC',
  ETH: 'ETH',
  'ARB-ETH': 'ETH',
  BNB: 'BNB',
}

const chainTypeMap: Record<number, ChainType> = {
  [ChainIds.Solana]: ChainType.Solana,
  [ChainIds.Ethereum]: ChainType.Evm,
  [ChainIds.Arbitrum]: ChainType.Arb,
}

const fetchArbUsdcBalance = async (walletAddress: string): Promise<number> => {
  const endpoint = `https://arb1.arbitrum.io/rpc`
  const USDC_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
  const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)']
  const provider = new ethers.JsonRpcProvider(endpoint)
  const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
  const [balanceRaw, decimals] = await Promise.all([usdcContract.balanceOf(walletAddress), usdcContract.decimals()])
  const balance = ethers.formatUnits(balanceRaw, decimals)
  return parseFloat(balance)
}

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
    }
  }, [priceList])
}

const defaultSelectedTokenByChain = (chainId: ChainIds) => {
  switch (chainId) {
    case ChainIds.Solana:
      return 'SOL'
    case ChainIds.Ethereum:
      return 'ETH'
    case ChainIds.Arbitrum:
      return 'USDC'
    default:
      return 'SOL'
  }
}

const getChainIdFromLocalStorage = () => {
  const chainId = ls.get('asset_chain_id')
  if (chainId) {
    return parseInt(chainId, 10) as ChainIds
  }
  return ChainIds.Solana
}

interface DialogDepositProps {
  open: boolean
  setOpen: (value: boolean) => void
  type?: string
}

const DialogDeposit = ({ open, setOpen, type }: DialogDepositProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const selectedWalletAddress = ls.get('asset_wallet_address')
  const selectedChainId = getChainIdFromLocalStorage() as ChainIds
  // const activeWallet = useActiveWallet()
  const [openChooseTokenPopup, setOpenChooseTokenPopup] = useState(false)
  const [openSelectWalletDrawer, setOpenSelectWalletDrawer] = useState(false)
  const [openMinimumWarning, setOpenMinimumWarning] = useState(false)
  const [selectedToken, setSelectedToken] = useState<SelectedToken>({
    chainId: selectedChainId || ChainIds.Solana,
    token: defaultSelectedTokenByChain(selectedChainId),
  })
  const activeWallet = useActiveWallet()
  const [filteredWallets, setFilteredWallets] = useState<UserEmbeddedWalletDto[]>([])
  const [selectedWallet, setSelectedWallet] = useState<UserEmbeddedWalletDto>()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const solWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
  const ethWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
  const arbWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')

  const { solPrice, ethPrice } = usePrices()
  // 充值类型: ARB_USDC, ARB_ETH
  // const { type } = useLocation().state || {}

  const { data } = useQueryApollo(getFirstDepositUSDC, {
    skip: !activeWallet.isConnected || getFromLocalStorageWithTTL<{ value: string }>('getFirstDepositUSDC')?.value === 'false',
  })

  const { data: referralSnapshotData } = useUserReferralSnapshot()

  const isFirst = useMemo(() => data?.getFirstDepositUSDC?.isFirst, [data])

  useEffect(() => {
    if (isFirst !== undefined) {
      saveToLocalStorageWithTTL<{ value: string }>('getFirstDepositUSDC', { value: `${isFirst}` }, TTL_STORAGE)
    }
  }, [isFirst])

  useEffect(() => {
    if (type != undefined) {
      if (type === 'ARB_USDC') {
        setSelectedToken({ chainId: ChainIds.Arbitrum, token: 'USDC' })
      } else if (type === 'ARB_ETH') {
        setSelectedToken({ chainId: ChainIds.Arbitrum, token: 'ETH' })
      } else {
        setSelectedToken({ chainId: ChainIds.Solana, token: 'SOL' })
      }
    }
  }, [type])

  const handleOnTokenSelected = (chainId: ChainIds, token: string, walletAddress?: string) => {
    setSelectedToken({ chainId, token })
    if (walletAddress) {
      const newSelectedWallet = listWalletsByChain.find((wallet) => wallet.walletAddress === walletAddress)
      setSelectedWallet(newSelectedWallet)
    }
  }

  useEffect(() => {
    if (selectedWallet && selectedWallet.chain === chainTypeMap[selectedToken.chainId]) {
      // If the selected wallet is already in the correct chain, no need to filter wallets again
      return
    }
    if (selectedToken.chainId === ChainIds.Solana) {
      setFilteredWallets(solWallets)
      const newSelectedWallet = solWallets.find((wallet) => wallet.walletAddress === selectedWalletAddress)
      setSelectedWallet(newSelectedWallet ?? solWallets[0])
    } else if (selectedToken.chainId === ChainIds.Ethereum) {
      setFilteredWallets(ethWallets)
      const newSelectedWallet = ethWallets.find((wallet) => wallet.walletAddress === selectedWalletAddress)
      setSelectedWallet(newSelectedWallet ?? ethWallets[0])
    } else if (selectedToken.chainId === ChainIds.Arbitrum) {
      setFilteredWallets(arbWallets)
      const newSelectedWallet = arbWallets.find((wallet) => wallet.walletAddress === selectedWalletAddress)
      setSelectedWallet(newSelectedWallet ?? arbWallets[0])
    } else {
      setFilteredWallets([])
    }
  }, [listWalletsByChain, selectedToken, selectedWalletAddress])

  const title = useMemo(() => {
    if (selectedToken.chainId === ChainIds.Solana) {
      return t('assets.deposit.depositNetwork', { network: 'Solana' })
    } else if (selectedToken.chainId === ChainIds.Ethereum) {
      return t('assets.deposit.depositNetwork', { network: 'Ethereum' })
    } else if (selectedToken.chainId === ChainIds.Arbitrum) {
      return t('assets.deposit.depositNetwork', { network: 'Arbitrum' })
    }
    return ''
  }, [selectedToken, t])

  const address = useMemo(() => {
    if (!selectedWallet) return selectedWalletAddress
    return selectedWallet.walletAddress
  }, [selectedWalletAddress, selectedWallet])

  const [openShareBottomSheet, setOpenShareBottomSheet] = useState(false)

  const warningMessage = (chainId: ChainIds) => {
    if (chainId === ChainIds.Ethereum) {
      return t('assets.deposit.warningEthereum')
    }
    if (chainId === ChainIds.Solana) {
      return t('assets.deposit.warningSolana')
    }
    if (chainId === ChainIds.Arbitrum) {
      return t('assets.deposit.warningArbitrum', { token: tokenNameMap[selectedToken.token] })
    }
  }
  const solBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    solWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [solWallets])

  const ethBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    ethWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [ethWallets])

  const arbEthBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    arbWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [arbWallets])

  const { data: arbUsdcBalances = {} } = useQuery({
    queryKey: ['arbUsdcBalances', arbWallets],
    queryFn: async () => {
      const balances: Record<string, number> = {}
      for (const wallet of arbWallets) {
        balances[wallet.walletAddress] = await fetchArbUsdcBalance(wallet.walletAddress)
      }
      return balances
    },
  })

  const walletBalances = useMemo(() => {
    const solUsdBalances: Record<string, number> = {}
    const ethUsdBalances: Record<string, number> = {}
    const arbEthUsdBalances: Record<string, number> = {}
    const arbUsdcUsdBalances: Record<string, number> = {}

    Object.entries(solBalances).forEach(([address, balance]) => {
      solUsdBalances[address] = balance * (solPrice || 0)
    })

    Object.entries(ethBalances).forEach(([address, balance]) => {
      ethUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbEthBalances).forEach(([address, balance]) => {
      arbEthUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbUsdcBalances).forEach(([address, balance]) => {
      arbUsdcUsdBalances[address] = balance
    })

    return {
      sol: solBalances,
      eth: ethBalances,
      arbEth: arbEthBalances,
      arbUsdc: arbUsdcBalances,
      solUsd: solUsdBalances,
      ethUsd: ethUsdBalances,
      arbEthUsd: arbEthUsdBalances,
      arbUsdcUsd: arbUsdcUsdBalances,
    }
  }, [solBalances, ethBalances, arbEthBalances, arbUsdcBalances, solPrice, ethPrice])

  const filteredWalletsBalances = useMemo(() => {
    if (selectedToken.chainId === ChainIds.Solana) {
      return solBalances
    } else if (selectedToken.chainId === ChainIds.Ethereum) {
      return ethBalances
    } else if (selectedToken.chainId === ChainIds.Arbitrum) {
      if (selectedToken.token === 'USDC') {
        return arbUsdcBalances
      }
      return arbEthBalances
    }
    return {}
  }, [selectedToken, solBalances, ethBalances, arbEthBalances, arbUsdcBalances])

  const filteredWalletsUsdBalances = useMemo(() => {
    if (selectedToken.chainId === ChainIds.Solana) {
      return walletBalances.solUsd
    } else if (selectedToken.chainId === ChainIds.Ethereum) {
      return walletBalances.ethUsd
    } else if (selectedToken.chainId === ChainIds.Arbitrum) {
      if (selectedToken.token === 'USDC') {
        return walletBalances.arbUsdcUsd
      }
      return walletBalances.arbEthUsd
    }
    return {}
  }, [selectedToken, walletBalances])

  const estimateArivalTime = useMemo(() => {
    if (selectedToken.chainId === ChainIds.Ethereum) {
      return t('assets.deposit.estimateArrivalTime', {
        value: 30,
        unit: t('const.time.seconds'),
      })
    }
    if (selectedToken.chainId === ChainIds.Arbitrum) {
      return t('assets.deposit.estimateArrivalTime', {
        value: 30,
        unit: t('const.time.seconds'),
      })
    }
    return t('assets.deposit.estimateArrivalTime', {
      value: 1,
      unit: t('const.time.second'),
    })
  }, [selectedToken.chainId])

  const referralSnapshot = useMemo(() => {
    let referralSnapshot = ''
    if (referralSnapshotData?.referralSnapshot?.user?.invitationCode) {
      referralSnapshot = `/@${referralSnapshotData?.referralSnapshot?.user?.invitationCode}`
    }
    return referralSnapshot
  }, [referralSnapshotData])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild></DialogTrigger> */}
      {open && (
        <DialogContent className="w-[768px] bg-[#232329] rounded-2xl p-3" showDialogPrimitiveClose={false}>
          <div className="p-3 relative pb-20 pt-6">
            <div className="flex items-center justify-between fixed top-0 left-0 w-full p-3 z-10 bg-[#0A0A0A]">
              <div className="max-w-[768px] mx-auto flex items-center justify-between w-full">
                <div className="w-24">
                  {/* <img
                    src="/images/icons/arrow-left.svg"
                    className="w-6 h-6 cursor-pointer"
                    alt="arrow-left"
                    onClick={onClickBack}
                  /> */}
                </div>
                <div className="flex gap-1 items-center cursor-pointer" onClick={() => setOpenChooseTokenPopup(true)}>
                  <img
                    src={getBlockchainLogo2(selectedToken.chainId)}
                    className="size-6 bg-black rounded-full"
                    alt=""
                  />
                  <div className="text-[calc(18rem/16)] leading-6 font-medium">{title}</div>
                  <IconTriangleDown />
                </div>
                <ChooseTokenPopup
                  open={openChooseTokenPopup}
                  setOpen={setOpenChooseTokenPopup}
                  onTokenSelected={handleOnTokenSelected}
                  walletBalances={walletBalances}
                  selectedWallet={selectedWallet}
                />
                <SelectWalletDrawer
                  wallets={filteredWallets}
                  open={openSelectWalletDrawer}
                  setOpen={setOpenSelectWalletDrawer}
                  selectedWallet={selectedWallet}
                  token={selectedToken.token}
                  tokenLogo={tokenLogoMap[selectedToken.token] || ''}
                  onWalletSelected={(wallet) => {
                    setSelectedWallet(wallet)
                    setOpenSelectWalletDrawer(false)
                  }}
                  balances={filteredWalletsBalances}
                  usdBalances={filteredWalletsUsdBalances}
                  title={t('assets.deposit.depositTo')}
                  isPC
                />
                <div
                  className="font-medium text-[14px] leading-none cursor-pointer w-24 text-end"
                  onClick={() => {
                    navigate(
                      APP_PATH.ASSETS + `?page=overview?tab=funds&type=DEPOSIT&asset=${selectedToken.token}`,
                    )
                    setOpen(false)
                  }}
                >
                  {t('assets.deposit.history')}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 flex flex-col items-center gap-4 text-center">
              {/* arb usdc chain tips */}
              {selectedToken.chainId === ChainIds.Arbitrum && selectedToken.token === 'USDC' && (
                <div className="bg-[#E146501A] text-[#FFFFFF] text-[calc(11rem/16)] p-2 rounded-[8px] text-left">
                  {t('assets.deposit.depositArbUsdctips')}
                </div>
              )}
              <div>
                <div className="mb-2 font-[450] text-[20px] text-white leading-none">
                  {t('assets.deposit.title')} {tokenNameMap[selectedToken.token]}
                </div>
              </div>
              <QRCodeCanvas
                value={address || ''}
                size={248}
                marginSize={2}
                imageSettings={{
                  src: tokenLogoMap[selectedToken.token],
                  height: 35,
                  width: 35,
                  excavate: true,
                }}
                className="rounded-[10px]"
              />
            </div>
            <div className="mt-4 bg-gradient-to-r from-[#FF1D1D1A] to-[#BB00351A] flex items-center gap-1.5 rounded-lg p-2">
              <img src="/images/icons/danger.svg" alt="danger" className="w-4 h-4" />
              <div className="font-[350] text-[11px] text-white leading-[1.5]">
                {warningMessage(selectedToken.chainId)}
              </div>
            </div>
            <div className="mt-4 bg-[#ECECED14] rounded-lg px-2.5 py-2">
              <div className="font-[350] text-[#FFFFFF80] text-[calc(13rem/16)]">{t('assets.deposit.address')}</div>
              <div className=" flex items-center justify-between gap-4">
                <span className="font-[350] text-[13px] text-white leading-[1.5] break-all flex-1">{address}</span>
                <div className="h-8 w-8 bg-[#FFFFFF14] rounded-full flex items-center justify-center cursor-pointer">
                  <img
                    src="/images/icons/copy2.svg?v=2"
                    className="w-4 h-4 hover:scale-110"
                    alt="copy"
                    onClick={() => {
                      navigator.clipboard.writeText(address || '').then()
                      toast.success(t('assets.deposit.copyWalletAddress'))
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {selectedToken.chainId === ChainIds.Arbitrum && selectedToken.token === 'USDC' && isFirst && (
                <>
                  <div className="flex items-center justify-between">
                    <div
                      className="text-[#FFFFFFB2] text-[calc(12rem/16)] flex items-center gap-1 cursor-pointer"
                      onClick={() => setOpenMinimumWarning(true)}
                    >
                      <span>{t('assets.deposit.firstMinimumDepositAmount')}</span>
                      <IconInfo />
                    </div>
                    <div className="text-white text-[calc(12rem/16)] font-medium">
                      {t('assets.deposit.minimumUsdcAmount')}
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.depositAccount')}</div>
                <div className="text-white text-[calc(12rem/16)] font-medium">{t('assets.deposit.memeAccount')}</div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.depositWallet')}</div>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => setOpenSelectWalletDrawer(true)}>
                  <div className="text-white text-[calc(12rem/16)] font-medium">
                    {selectedWallet?.name}{' '}
                    <span className="text-[#FFFFFFB2]">{formatAddressWallet(selectedWallet?.walletAddress)}</span>
                  </div>
                  <IconChevronDown className="size-5" />
                </div>
              </div>

              {/* <div className="flex items-center justify-between">
                    <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.receivingAccount')}</div>
                    <div className="flex items-center cursor-pointer gap-1" onClick={() => setOpenSelectWalletDrawer(true)}>
                      <div className="text-white text-[calc(12rem/16)] font-medium mr-0.5">{t('assets.deposit.memeAccount')}</div>
                      <div className="text-[#FFFFFFB2] bg-[#ECECED14] text-[calc(12rem/16)] leading-3 rounded-[2px] px-1 py-0.5">
                        {selectedWallet?.name} {selectedWallet?.walletAddress.slice(-3)}
                      </div>
                      <IconChevronRight />
                    </div>
                  </div> */}

              {/* {selectedToken.chainId === ChainIds.Arbitrum && selectedToken.token === 'USDC' && (
                  <div className="flex items-center justify-between">
                    <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.usdcContractAddress')}</div>
                    <div className="flex items-center gap-1">
                      <div className="text-white text-[calc(12rem/16)] font-medium">
                        {formatAddressWallet(ARB_USDC_ADDRESS)}
                      </div>
                      <CopyButton icon="/images/icons/ic-copy2.svg" text={ARB_USDC_ADDRESS} className="size-4" />
                    </div>
                  </div>
                )} */}

              <div className="flex items-center justify-between">
                <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.arrivalTime')}</div>
                <div className="text-white text-[calc(12rem/16)] font-medium">{estimateArivalTime}</div>
              </div>
              {/* {selectedToken.chainId === ChainIds.Arbitrum && selectedToken.token === 'USDC' && (
                  <div className="flex items-center justify-between">
                    <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.withdrawalTime')}</div>
                    <div className="text-white text-[calc(12rem/16)] font-medium">{t('assets.deposit.aboutTwoMinutes')}</div>
                  </div>
                )} */}
            </div>
            <div className="fixed inset-x-0 bottom-0 max-w-[768px] mx-auto px-3 py-4 bg-[#13191a]">
              <Button
                variant="gradient"
                className="w-full rounded-full flex-1 h-11 font-medium text-[#141414] text-[16px]"
                onClick={() => setOpenShareBottomSheet(true)}
              >
                {t('assets.deposit.shareAddress')}
              </Button>
            </div>
            <ShareBottomSheet
              open={openShareBottomSheet}
              setOpen={setOpenShareBottomSheet}
              title={t('shareBottomSheet.title')}
              fileName={`QR-${address}`}
              text={t('shareBottomSheet.depositAddressTemplate', { token: tokenNameMap[selectedToken.token], address })}
              url={`${window.location.origin}${APP_PATH.DEPOSIT_SHARE}?address=${address}&token=${selectedToken.token}&chain=${selectedToken.chainId}` + referralSnapshot}
              isPC
            >
              <div className="flex flex-col items-center gap-4 w-full p-4 bg-[url('/images/share-bg.png')] bg-cover bg-center">
                <div className="text-white text-[calc(20rem/16)]">{t('assets.deposit.depositXbitWallet')}</div>
                <QRCodeCanvas
                  value={address || ''}
                  size={248}
                  marginSize={2}
                  imageSettings={{
                    src: tokenLogoMap[selectedToken.token],
                    height: 35,
                    width: 35,
                    excavate: true,
                  }}
                  className="rounded-[10px]"
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="text-[calc(14rem/16)] font-[350]">{t('assets.deposit.network')}</div>
                  <div className="bg-[#ECECED14] rounded-full py-1 pl-1.5 pr-2 flex items-center gap-1">
                    <div className="size-4.5 p-1 bg-black rounded-full">
                      <img src={chainIconMap[selectedToken.chainId]} alt="" className="size-full" />
                    </div>
                    <div className="text-white font-[350] text-[calc(13rem/16)] leading-[calc(15rem/16)]">
                      {BLOCKCHAIN_NAMES[selectedToken.chainId]}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[calc(14rem/16)] font-[350]">{t('assets.deposit.walletAddress')}</div>
                  <div className="break-all text-[calc(14rem/16)] font-[350] text-[#FFFFFFB2]">
                    {selectedWallet?.walletAddress}
                  </div>
                </div>
              </div>
            </ShareBottomSheet>
            <MinimumDepositWarningDrawer open={openMinimumWarning} setOpen={setOpenMinimumWarning} isPC />
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default DialogDeposit
