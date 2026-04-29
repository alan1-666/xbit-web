import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { CopyButton } from '@/components/common/copy-button'
import MoneyFormatted from '@/components/common/MoneyFormatted'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatBalanceWallet } from '@/lib/number'
import { formatAddressWallet } from '@/lib/string'
import { cn, fixBigNumber } from '@/lib/utils'
import { mappedTypeChain } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { BLOCKCHAIN_NAMES, BLOCKCHAIN_SHORTNAME, capitalizeFirstLetter, formatPrice2 } from '@/utils/helpers'
import { Avatar } from '@radix-ui/react-avatar'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ITEMS_PER_PAGE } from '../constants'
import { useTransferContext } from '../context/TransferContext'
import { Chain, Token } from '../types/ExchangeMeta'
import SearchInput from './SearchInput'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { ChainIds } from '@/types/enums'

type TokenSelectorDrawerProps = {
  onSelected: (token: Token, isFrom: boolean, walletAddress?: string) => void
  defaultShow?: boolean
  openForm?: 'FromToken' | 'ToToken'
  selectedFromToken?: Token | null
  selectedToToken?: Token | null
  selectedFromAddress?: string
  selectedToAddress?: string
}

const SolSymbol = 'SOL'

const TokenSelectorDrawer = (props: TokenSelectorDrawerProps) => {
  const { openForm, selectedFromToken, selectedToToken, selectedToAddress, selectedFromAddress } = props
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const [query, setQuery] = useState('')

  const { chains, tokens } = useTransferContext()
  const [chain, setChain] = useState(chains && chains.length > 0 ? chains[0] : null)
  const [filteredTokens, setFilteredTokens] = useState<Token[] | null>(null)
  const [displayedTokens, setDisplayedTokens] = useState<Token[]>([])
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let updatedFilteredTokens = tokens ?? null

    if (query) {
      setChain(chains && chains.length > 0 ? chains[0] : null)
      updatedFilteredTokens =
        tokens?.filter((token) => {
          const tokenName = token.name.toLowerCase()
          const tokenSymbol = token.symbol.toLowerCase()
          const filter = query.toLowerCase()
          return tokenName.includes(filter) || tokenSymbol.includes(filter) || token.address.includes(filter)
        }) ?? null
    } else if (chain && chain.chainId !== 'all') {
      updatedFilteredTokens =
        tokens?.filter((token) => {
          return token.chainName?.toLowerCase() === chain.chainName.toLowerCase()
        }) ?? null
    }


    setFilteredTokens(updatedFilteredTokens)

    setPage(1)
    setDisplayedTokens(updatedFilteredTokens?.slice(0, ITEMS_PER_PAGE) ?? [])
  }, [query, chain, tokens])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMoreTokens()
    }
  }

  const loadMoreTokens = () => {
    if (filteredTokens) {
      const nextPage = page + 1
      const nextTokens = filteredTokens.slice(0, nextPage * ITEMS_PER_PAGE)
      setDisplayedTokens(nextTokens)
      setPage(nextPage)
    }
  }

  const handleChainSelect = (chain: Chain) => {
    if (chain.chainId === 'all') {
      setChain(chains && chains.length > 0 ? chains[0] : null)
      setFilteredTokens(tokens)
    } else {
      setChain(chain)
    }
  }

  const listWalletsByActiveChain: Array<UserEmbeddedWalletDto> = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((w: UserEmbeddedWalletDto) => w?.chain === mappedTypeChain(TYPE_CHAIN.SOLANA))
    }
    return []
  }, [listWalletsByChain])

  const totalBalanceSol = useMemo(() => {
    if (listWalletsByActiveChain.length) {
      return listWalletsByActiveChain.reduce((a, b) => a + b.balance, 0)
    }
    return 0
  }, [listWalletsByActiveChain])

  const handleHidenTickIcon = () => {
    switch (openForm) {
      case 'FromToken':
        if (selectedFromToken?.chainName !== 'SOLANA') {
          return 'hidden'
        }
        return ''

      default:
        if (selectedToToken?.chainName !== 'SOLANA') {
          return 'hidden'
        }
        return ''
    }
  }

  const handleCheckActiveWallet = (address: string) => {
    if (openForm === 'FromToken' && selectedFromAddress === address) {
      return 'visible'
    } else if (openForm === 'ToToken' && selectedToAddress === address) {
      return 'visible'
    }
    return 'invisible'
  }
  const isDisabledItem = (subWalletAddress: string) => {
    if (!subWalletAddress) false
    return (
      (openForm === 'ToToken' && selectedFromAddress === subWalletAddress) ||
      (openForm === 'FromToken' && selectedToAddress === subWalletAddress)
    )
  }

  const handleAddressSelect = (item: any, isOpenForm: boolean, subWalletAddress: string = '') => {
    // disabled item
    const isDisabled = isDisabledItem(subWalletAddress)
    if (isDisabled) return

    // 主item click
    if (item.symbol === SolSymbol && !subWalletAddress) {
      setExpanded(!expanded)
      return
    }
    props.onSelected(item, isOpenForm, subWalletAddress || '')
  }

  const { isDesktop } = useResponsive()

  return (
    <div className={cn('w-full mx-auto relative', isDesktop ? '' : 'h-[75vh]')}>
      <SearchInput
        placeholder={t('assets.transfers.searchToken')}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
        }}
        onFocus={() => {}}
        onBlur={() => setTimeout(() => {})}
      />
      <div className="w-full mx-auto relative">
        <div className="">
          <div className="flex items-center">
            <div className="text-[calc(14rem/16)] font-[330] text-white/50 leading-none mt-[20px] mb-[12px]">
              {t('assets.deposit.selectNetwork')}
            </div>
          </div>
          <div className="flex items-center whitespace-nowrap overflow-x-auto gap-2 _hidescrollbar">
            {chains?.map((item, index) => (
              <button
                key={index}
                className={cn(
                  `h-[30px] px-[8px] py-[6px] bg-[#ECECED14] rounded-[6px] flex items-center border-[1px] border-[#ECECED1F] text-[calc(14rem/16)] font-[350]`,
                  chain?.chainId === item.chainId && 'border-gradient-chain bg-[#0F0F0F]',
                )}
                onClick={() => handleChainSelect(item)}
              >
                <div className="flex items-center">
                  <Avatar className="inline-block w-[18px] h-[18px]">
                    <img src={item.chainImage} alt="Chain Logo" className="size-[18px] object-contain" />
                  </Avatar>
                  <span className="inline-block text-[14px] text-[#FFFFFF] ml-[6px] leading-1">
                    {item.chainId !== String(ChainIds.Bsc)
                      ? capitalizeFirstLetter(item.chainName || '')
                      : BLOCKCHAIN_SHORTNAME[ChainIds.Bsc]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-[16px]">
          <div
            className="flex flex-col items-center overflow-y-auto _hidescrollbar"
            style={{ maxHeight: 'calc(75vh - 190px)' }}
            onScroll={handleScroll}
          >
            {displayedTokens?.map((item, index) => (
              <div key={index} className="w-full">
                <button
                  key={index}
                  className="flex items-center gap-3 w-full h-full py-[16px] text-[13px] text-[#FFFFFF80]"
                  onClick={() => handleAddressSelect(item, openForm === 'FromToken')}
                >
                  <LogoWithChain
                    logo={item.image}
                    chainLogo={item.chainImage}
                    logoClassName="size-9 min-w-9 rounded-full"
                    chainContainerClassName="size-3 p-0"
                    name={item.symbol}
                  />
                  <span className="flex items-center justify-between w-full text-[#FFFFFF80]">
                    <span className="text-left flex flex-col">
                      <div className="flex gap-2 justify-left items-center">
                        <span className="text-[16px] text-[#FFFFFF] font-[380]">{item.symbol}</span>
                        {item.symbol === SolSymbol && listWalletsByActiveChain.every((e) => e.chain === 'SOLANA') && (
                          <div
                            className={`bg-[#6A2AE0] text-white text-[calc(12rem/16)] rounded-full flex items-center justify-center font-[380] w-[25px] h-[14px] leading-[calc(11rem/16)] pb-[1px]`}
                          >
                            +{listWalletsByActiveChain.length}
                          </div>
                        )}
                      </div>
                      <span
                        className="mt-[6px] font-[330] text-[calc(12rem/16)] text-white/50 leading-none flex gap-1"
                        onClick={(e) => {
                          if (item.symbol === SolSymbol) {
                            e.stopPropagation()
                            setExpanded(!expanded)
                          }
                        }}
                      >
                        {query
                          ? formatAddressWallet(item.address, 5, 3)
                          : item.chainId !== String(ChainIds.Bsc)
                            ? capitalizeFirstLetter(item.chainName || '')
                            : BLOCKCHAIN_NAMES[ChainIds.Bsc]}

                        {item.symbol === SolSymbol && listWalletsByActiveChain.every((e) => e.chain === 'SOLANA') && (
                          <img
                            src="/images/icons/icon_up.svg"
                            className={cn(
                              'size-[12px] transition-transform duration-200',
                              expanded ? 'rotate-180' : 'rotate-0',
                            )}
                            alt="icon-up"
                          />
                        )}
                      </span>
                    </span>
                    <span className="text-right flex flex-col">
                      <span className="text-[16px] text-[#FFFFFF]">
                        {item.symbol === SolSymbol
                          ? formatBalanceWallet({ balance: totalBalanceSol })
                          : fixBigNumber(`${item.balance}`, item.szDecimals ? item.szDecimals : 2)}
                      </span>
                      <span className="mt-[6px] font-[330] text-[calc(12rem/16)] text-white/50 leading-none">
                        <MoneyFormatted
                          value={item.symbol === SolSymbol ? totalBalanceSol * item.usdPrice : item.usdValue}
                        />
                      </span>
                    </span>
                  </span>
                </button>
                {item.symbol === SolSymbol && (
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
                              isDisabledItem(subWallet.walletAddress) ? 'bg-[#ECECED30] pointer-events-none' : '',
                            )}
                            style={{
                              transitionDelay: expanded ? `${index * 50}ms` : '0ms',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddressSelect(item, openForm === 'FromToken', subWallet.walletAddress)
                            }}
                          >
                            <div className="flex gap-4">
                              {handleCheckActiveWallet(subWallet.walletAddress) === 'invisible' ? (
                                <span className="w-[16px] h-[16px]"></span>
                              ) : (
                                <img
                                  src={'/images/icons/icon-tick-rounded.svg?v=2'}
                                  alt="ic tick"
                                  className={cn(
                                    // subWallet.walletAddress === activeWallet.walletAddress ? 'visible' : 'invisible',
                                    // handleCheckActiveWallet(subWallet.walletAddress),
                                    handleHidenTickIcon(),
                                  )}
                                />
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
                                  {subWallet.balance} SOL
                                </div>
                                <div className="text-[12px] text-white/50 flex items-center gap-2 font-[330] text-right">
                                  ${formatPrice2(subWallet.balance * item.usdPrice)}
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
    </div>
  )
}

export default TokenSelectorDrawer
