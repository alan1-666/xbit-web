import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import BottomSheet from '@/components/common/BottomSheet'
import { CopyButton } from '@/components/common/copy-button'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { ARB_USDC_ADDRESS, NATIVE_TOKENS } from '@/lib/constant.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import ls from '@/lib/local-storage.ts'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { mappedTypeChain } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, BLOCKCHAIN_SHORTNAME, getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onTokenSelected?: (chainId: ChainIds, token: string, tokenAddress: string, walletAddress?: string) => void
  walletBalances: {
    sol: Record<string, number>
    eth: Record<string, number>
    arbEth: Record<string, number>
    arbUsdc: Record<string, number>
    solUsd: Record<string, number>
    ethUsd: Record<string, number>
    arbEthUsd: Record<string, number>
    arbUsdcUsd: Record<string, number>
    bnb: Record<string, number>
    bnbUsd: Record<string, number>
  }
  selectedWallet?: UserEmbeddedWalletDto
  type?: 'deposit' | 'withdraw'
}

const nativeTokenSupported = [
  {
    token: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    chainId: ChainIds.Solana,
    logo: '/images/icons/chains/ic-solana2.png',
    chainLogo: '/images/icons/chains/ic-solana2.png',
    chainName: 'Solana',
    tokenAddress: 'So11111111111111111111111111111111111111111', // Native SOL token address
  },
  {
    token: 'BNB',
    name: 'Binance Coin',
    symbol: NATIVE_TOKENS.bsc.BNB.symbol,
    chainId: ChainIds.Bsc,
    logo: '/images/bnb.svg',
    chainLogo: '/images/bsc.svg',
    chainName: 'BNB Chain',
    tokenAddress: '0x0000000000000000000000000000000000000000', // Native BNB token address
    disabled: false,
  },
  {
    token: 'ARB-ETH',
    name: 'Arbitrum Ethereum',
    symbol: NATIVE_TOKENS.arb.ETH.symbol,
    chainId: ChainIds.Arbitrum,
    logo: '/images/icons/chains/ic-ethereum.svg',
    chainLogo: '/images/icons/chains/ic-arbitrum.svg',
    chainName: 'Arbitrum',
    tokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH token address on Arbitrum
    // disabled: true, // ARB-ETH is disabled for now
  },
  {
    token: 'USDC',
    name: 'Arbitrum USDC',
    symbol: NATIVE_TOKENS.arb.USDC.symbol,
    chainId: ChainIds.Arbitrum,
    logo: '/images/icons/chains/ic-usdc.svg',
    chainLogo: '/images/icons/chains/ic-arbitrum.svg',
    chainName: 'Arbitrum',
    tokenAddress: ARB_USDC_ADDRESS, // USDC token address on Arbitrum
    // disabled: true, // USDC is disabled for now
  },
  {
    token: 'ETH',
    name: 'Ethereum',
    symbol: NATIVE_TOKENS.eth.ETH.symbol,
    chainId: ChainIds.Ethereum,
    logo: '/images/icons/chains/ic-ethereum.svg',
    chainLogo: '/images/icons/chains/ic-ethereum.svg',
    chainName: 'Ethereum',
    tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH token address on Ethereum
    // disabled: true, // ETH is disabled for now
  },
]

const getChainIdFromLocalStorage = () => {
  const chainId = ls.get('asset_chain_id')
  if (chainId) {
    return parseInt(chainId, 10) as ChainIds
  }
  return ChainIds.Solana
}

const ChooseWithdrawalTokenPopup = ({ open, setOpen, onTokenSelected, walletBalances, selectedWallet }: Props) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const { solPrice } = useNativeTokenPrices()
  const selectedChainId = getChainIdFromLocalStorage() as ChainIds
  const networkSupported = [ChainIds.Solana, ChainIds.Bsc, ChainIds.Arbitrum, ChainIds.Ethereum]
  const [networkSelected, setNetworkSelected] = useState<ChainIds | undefined>(selectedChainId)
  const [expanded, setExpanded] = useState(false)
  const { isDesktop } = useResponsive()

  const [listTokens, setListTokens] = useState(nativeTokenSupported)

  useEffect(() => {
    let newListTokens = nativeTokenSupported
    if (networkSelected) {
      newListTokens = nativeTokenSupported.filter((item) => item.chainId === networkSelected)
    }
    if (searchValue) {
      newListTokens = newListTokens.filter(
        (item) =>
          item.token.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.tokenAddress.toLowerCase().includes(searchValue.toLowerCase()),
      )
    }
    setListTokens(newListTokens)
  }, [networkSelected, searchValue])

  useEffect(() => {
    if (open) {
      setSearchValue('')
      setNetworkSelected(selectedChainId)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [open])

  const handleOnClick = (chainId: ChainIds, token: string, tokenAddress: string, walletAddress?: string) => {
    setOpen(false)
    onTokenSelected?.(chainId, token, tokenAddress, walletAddress)
  }

  const balances = useMemo(() => {
    const balances: Record<string, number> = {}
    const usdBalances: Record<string, number> = {}

    if (walletBalances.sol) {
      balances['SOL'] = Object.values(walletBalances.sol).reduce((acc, val) => acc + val, 0)
      usdBalances['SOL'] = Object.values(walletBalances.solUsd).reduce((acc, val) => acc + val, 0)
    }
    if (walletBalances.eth) {
      balances['ETH'] = Object.values(walletBalances.eth).reduce((acc, val) => acc + val, 0)
      usdBalances['ETH'] = Object.values(walletBalances.ethUsd).reduce((acc, val) => acc + val, 0)
    }
    if (walletBalances.arbEth) {
      balances['ARB-ETH'] = Object.values(walletBalances.arbEth).reduce((acc, val) => acc + val, 0)
      usdBalances['ARB-ETH'] = Object.values(walletBalances.arbEthUsd).reduce((acc, val) => acc + val, 0)
    }
    if (walletBalances.arbUsdc) {
      balances['USDC'] = Object.values(walletBalances.arbUsdc).reduce((acc, val) => acc + val, 0)
      usdBalances['USDC'] = Object.values(walletBalances.arbUsdcUsd).reduce((acc, val) => acc + val, 0)
    }
    if (walletBalances.bnb) {
      balances['BNB'] = Object.values(walletBalances.bnb).reduce((acc, val) => acc + val, 0)
      usdBalances['BNB'] = Object.values(walletBalances.bnbUsd).reduce((acc, val) => acc + val, 0)
    }
    return { balances, usdBalances }
  }, [walletBalances])

  const listWalletsByActiveChain: Array<UserEmbeddedWalletDto> = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((w: UserEmbeddedWalletDto) => w?.chain === mappedTypeChain(TYPE_CHAIN.SOLANA))
    }
    return []
  }, [listWalletsByChain])

  return (
    <BottomSheet
      open={open}
      setOpen={setOpen}
      // title={t('assets.deposit.selectToken')}
      title=""
      hiddenBgImg
      className="bg-[#232329] pt-3"
      classNameDrawerHeader={isDesktop ? 'pt-4' : ''}
    >
      <div className={cn(isDesktop ? '' : 'h-[75vh]')}>
        <div className="relative w-full] mb-[14px]">
          <input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\s+/g, '')
              setSearchValue(value)
            }}
            placeholder={t('assets.deposit.searchToken')}
            type="text"
            className="w-full py-3 px-[38px] bg-[#ECECED0A] border border-solid border-[#ECECED14] rounded-[200px] text-[14px] leading-[14px] placeholder:font-[350]"
          />
          <img alt="" className="size-[16px] absolute top-[15px] left-[16px]" src="/images/icons/search-icon-2.svg" />
          {searchValue.length !== 0 && (
            <img
              className="size-[16px] absolute top-[15px] right-[16px]"
              src="/images/icons/icon-x.svg"
              alt=""
              onClick={() => {
                setSearchValue('')
                if (inputRef.current) {
                  inputRef.current.focus()
                }
              }}
            />
          )}
        </div>
        <div className="">
          <div className="text-[16px] font-[330] text-white leading-none">{t('assets.deposit.selectNetwork')}</div>
          <div className="mt-3 w-full overflow-x-auto no-scrollbar">
            <div className="flex w-max items-center gap-2">
              <div
                className={`h-[30px] px-[8px] py-[6px] rounded-[6px] cursor-pointer text-center text-[13px] font-[330] text-white leading-none flex items-center gap-1 border border-[#ECECED1F] ${networkSelected === undefined ? 'border-gradient-chain bg-[#0F0F0F]' : 'bg-[#ECECED14]'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (networkSelected === undefined) {
                    setNetworkSelected(undefined)
                  } else {
                    setNetworkSelected(undefined)
                  }
                }}
              >
                <img src="/images/icons/global.svg" className="size-5" alt="" />
                {t('assets.deposit.allNetwork')}
              </div>
              {networkSupported.map((network) => (
                <div
                  key={network}
                  className={`h-[30px] px-[8px] py-[6px] rounded-[6px] cursor-pointer text-center text-[13px] font-[330] text-white leading-none flex items-center gap-1 border border-[#ECECED1F] ${networkSelected === network ? 'border-gradient-chain bg-[#0F0F0F]' : 'bg-[#ECECED14]'}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (networkSelected === network) {
                      setNetworkSelected(undefined)
                    } else {
                      setNetworkSelected(network)
                    }
                  }}
                >
                  <LogoWithChain
                    logo={getBlockchainLogo2(network)}
                    logoClassName="w-[18px] h-[18px] min-w-[18px]"
                    name={BLOCKCHAIN_NAMES[network]}
                  />
                  {network !== ChainIds.Bsc ? BLOCKCHAIN_NAMES[network] : BLOCKCHAIN_SHORTNAME[network]}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-[16px] font-[330] text-white leading-none">{t('assets.deposit.selectToken')}</div>
          <div className="mt-3 flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[calc(75vh-160px)]">
            {listTokens.map((item) => (
              <div key={item.token}>
                <div
                  className="flex items-center justify-between py-3 rounded-[8px] cursor-pointer"
                  onClick={() => {
                    if (item.symbol === 'SOL') {
                      setExpanded(!expanded)
                    } else {
                      handleOnClick(item.chainId, item.token, item.tokenAddress)
                    }
                  }}
                  key={item.token}
                >
                  <div className="flex items-center gap-2.5">
                    <LogoWithChain
                      logo={item.logo}
                      chainLogo={item.chainLogo}
                      logoClassName="w-9 h-9"
                      name={item.name}
                      chainContainerClassName="!bg-none size-3.5 p-0 border-[#121218] border-[1px]"
                    />
                    <div>
                      <div className="text-[16px] text-white leading-none font-[380] flex items-center gap-2">
                        <span>{item.symbol}</span>
                        {item.symbol === 'SOL' && listWalletsByActiveChain.every((e) => e.chain === 'SOLANA') && (
                          <div
                            className={`bg-[#6A2AE0] text-white text-[calc(12rem/16)] rounded-full flex items-center justify-center font-[380] w-[25px] h-[14px] leading-[calc(11rem/16)] pb-[1px]`}
                          >
                            +{listWalletsByActiveChain.length}
                          </div>
                        )}
                      </div>
                      <div
                        className="mt-[6px] font-[330] text-[12px] text-white/50 leading-none flex items-center gap-1 cursor-pointer"
                        onClick={(e) => {
                          if (item.symbol === 'SOL') {
                            e.stopPropagation()
                            setExpanded(!expanded)
                          }
                        }}
                      >
                        <span>{item.chainName}</span>
                        {item.symbol === 'SOL' && listWalletsByActiveChain.every((e) => e.chain === 'SOLANA') && (
                          <img
                            src="/images/icons/icon_up.svg"
                            className={cn(
                              'size-[12px] transition-transform duration-200',
                              expanded ? 'rotate-180' : 'rotate-0',
                            )}
                            alt="icon-up"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-[450] text-[16px]">
                      {formatAmount(balances.balances[item.token], {
                        roundMode: 'floor',
                      })}
                    </div>
                    <div className="text-white/50 text-[12px]">
                      {formatBalance(balances.usdBalances[item.token], {
                        showCurrency: true,
                        roundMode: 'floor',
                      })}
                    </div>
                  </div>
                </div>
                {item.symbol === 'SOL' && (
                  <div
                    className={`ml-12.5 gap-3 overflow-hidden transition-all duration-300 ease-in-out bg-[#141414] rounded-[12px]`}
                    style={{ maxHeight: expanded ? '100%' : '0px', opacity: expanded ? '100' : '0' }}
                  >
                    {listWalletsByActiveChain.every((e) => e.chain === 'SOLANA') &&
                      listWalletsByActiveChain.map((subWallet: UserEmbeddedWalletDto, index: number) => (
                        <div key={index}>
                          <div
                            className={cn(
                              `flex items-center justify-between cursor-pointer transition-all duration-200 transform py-3 px-4`,
                              expanded ? 'translate-y-0 opacity-100' : 'translate-y-[-10px] opacity-0',
                            )}
                            style={{
                              transitionDelay: expanded ? `${index * 50}ms` : '0ms',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOnClick(item.chainId, item.token, item.tokenAddress, subWallet?.walletAddress)
                              setExpanded(false)
                            }}
                          >
                            <div className="flex gap-4">
                              {selectedWallet?.walletAddress === subWallet.walletAddress ? (
                                <img src={'/images/icons/icon-tick-rounded.svg?v=2'} alt="ic tick" className={cn()} />
                              ) : (
                                <span className="w-[16px] h-[16px]"></span>
                              )}

                              <div>
                                <div className="font-[380] text-white mb-1 text-[calc(14rem/16)]">{subWallet.name}</div>
                                <div className="text-[12px] text-white/50 flex items-center gap-2 font-[330]">
                                  <span>{formatAddressWallet(subWallet.walletAddress, 5, 5)}</span>
                                  <CopyButton text={subWallet.walletAddress} />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-center items-center gap-2">
                              <div className="text-right flex flex-col items-end">
                                <div className="font-[380] text-white mb-1 text-[calc(14rem/16)] text-right">
                                  {formatAmount(subWallet.balance, {
                                    roundMode: 'floor',
                                    unit: 'SOL',
                                  })}
                                </div>
                                <div className="text-[12px] text-white/50 flex items-center gap-2 font-[330] text-right">
                                  {formatBalance(subWallet.balance * solPrice, {
                                    showCurrency: true,
                                    roundMode: 'floor',
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={cn(
                              index !== listWalletsByActiveChain.length - 1 && 'border-dividing-line w-full h-[1px]',
                            )}
                          ></div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ChooseWithdrawalTokenPopup
