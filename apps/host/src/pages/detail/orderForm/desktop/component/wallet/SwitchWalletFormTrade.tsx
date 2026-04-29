import { Maybe, PortfolioDto, PortfolioManyWalletInput } from '@/@generated/gql/graphql-core'
import { TokenDetail } from '@/@generated/gql/graphql-future'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { CopyButton } from '@/components/common/copy-button'
import LogoWithChain from '@/components/common/LogoWithChain'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getImgIconChain, LIST_CHAIN_SUPPORTED, TYPE_CHAIN } from '@/lib/blockchain'
import { formatAmount } from '@/lib/format'
import { ServiceConfig } from '@/lib/gql/service-config'
import { formatBalanceWallet, fShortenNumber } from '@/lib/number'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { _activeWallet, mappedTypeChain, newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getListPortfoliosByTokens } from '@/services/tokens.service'
import { getBlockChainLogo } from '@/utils/helpers'
import { useQuery } from '@apollo/client'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

type MergedWallet = UserEmbeddedWalletDto & {
  isHoldingToken: boolean
  portfolioData?: PortfolioDto[]
}

export const SwitchWalletFormTrade = ({
  tokenDetail,
  screen = 'trade',
}: {
  tokenDetail: TokenDetail
  screen?: 'trade' | 'home' | 'popup'
}) => {
  const { t } = useTranslation()
  const [openSwitchWalletBottomSheet, setOpenSwitchWalletBottomSheet] = useState(false)
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  // const chainLogo = LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const listWalletsByActiveChain = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain, activeChain])

  const token = tokenDetail?.address
  const logoUrl = tokenDetail?.info?.logoUrl

  const nativeTokenLogo = useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return '/images/icons/icon-sol.svg'
    if (activeChain === TYPE_CHAIN.ETH) return '/images/ether.svg'
    if (activeChain === TYPE_CHAIN.ARB) return '/images/ether.svg'
    return LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)?.img
  }, [activeChain])

  const listWalletIds = listWalletsByActiveChain?.map((item: UserEmbeddedWalletDto) => item.walletAddress)

  const { data: dataListHoldingToken } = useQuery(getListPortfoliosByTokens, {
    variables: {
      input: {
        userAddress: listWalletIds,
        token: token,
        page: 1,
        limit: 5,
        isTopValue: true,
        chainId: activeWallet.chainId,
      } as PortfolioManyWalletInput,
    },
    skip: !ServiceConfig.token || !token,
    pollInterval: openSwitchWalletBottomSheet ? 60000 : 0,
  })

  const listHolding = dataListHoldingToken?.getPortfolioManyWallet?.data

  function splitByIdMatch(
    list1: UserEmbeddedWalletDto[],
    list2?: any[],
  ): { matched: MergedWallet[]; unmatched: MergedWallet[] } {
    const addressToPortfolioMap = new Map<string, PortfolioDto[]>()

    for (const walletGroup of list2 || []) {
      for (const portfolio of walletGroup.data || []) {
        const addr = portfolio.userAddress
        if (!addressToPortfolioMap.has(addr)) {
          addressToPortfolioMap.set(addr, [])
        }
        addressToPortfolioMap.get(addr)!.push(portfolio)
      }
    }

    const matched: MergedWallet[] = []
    const unmatched: MergedWallet[] = []

    for (const wallet of list1) {
      const portfolioList = addressToPortfolioMap.get(wallet.walletAddress) || []

      if (portfolioList.length > 0) {
        matched.push({
          ...wallet,
          isHoldingToken: true,
          portfolioData: portfolioList,
        })
      } else {
        unmatched.push({
          ...wallet,
          isHoldingToken: false,
          portfolioData: [],
        })
      }
    }

    return { matched, unmatched }
  }

  const { matched: listWalletsHodingToken, unmatched: listWalletsNotHodingToken } = splitByIdMatch(
    listWalletsByActiveChain,
    listHolding || [],
  )

  const { data: dataListNotHoldingToken } = useQuery(getListPortfoliosByTokens, {
    variables: {
      input: {
        userAddress: listWalletsNotHodingToken.map((item) => item?.walletAddress),
        page: 1,
        limit: 5,
        isTopValue: true,
        chainId: activeWallet.chainId,
      } as PortfolioManyWalletInput,
    },
    skip: !ServiceConfig.token || listWalletsNotHodingToken?.length === 0,
    pollInterval: openSwitchWalletBottomSheet ? 60000 : 0,
  })

  function mapPortfolioDataToWallets(unmatched: MergedWallet[], list2: any[]): MergedWallet[] {
    const addressToPortfolioMap = new Map<string, PortfolioDto[]>()
    const addressToTotalTokensMap = new Map<string, number>()
    for (const group of list2 || []) {
      for (const portfolio of group.data || []) {
        const address = portfolio.userAddress
        if (!addressToPortfolioMap.has(address)) {
          addressToPortfolioMap.set(address, [])
          addressToTotalTokensMap.set(address, group.totalHoldingTokens || 0)
        }
        addressToPortfolioMap.get(address)!.push(portfolio)
      }
    }

    return unmatched.map((wallet) => {
      const portfolios = addressToPortfolioMap.get(wallet.walletAddress) || []
      const totalHoldingTokens = addressToTotalTokensMap.get(wallet.walletAddress) || 0

      return {
        ...wallet,
        portfolioData: portfolios,
        totalHoldingTokens,
      }
    })
  }

  const listNotHolding = mapPortfolioDataToWallets(
    listWalletsNotHodingToken,
    dataListNotHoldingToken?.getPortfolioManyWallet?.data as any,
  )

  const activeWalletIdx = listWalletsByActiveChain?.length
  const totalPrice = listWalletsByActiveChain.reduce((acc: number, item: any) => acc + +item?.balance, 0)

  return (
    <>
      <Popover open={openSwitchWalletBottomSheet} onOpenChange={setOpenSwitchWalletBottomSheet}>
        <PopoverTrigger asChild>
          <button
            className="h-full flex items-center bg-[#ececed14] px-1.5 py-1 rounded-[200px] border-[0.5px] border-solid border-[#ececed14]"
            onClick={() => {
              setOpenSwitchWalletBottomSheet(true)
            }}
          >
            <div className="flex gap-1 items-center">
              <IconWallet />
              <span className="text-[12px] font-[380]">{activeWalletIdx}</span>
            </div>
            {screen !== 'popup' && (
              <>
                <div className="w-[1.5px] h-[12px] bg-[#ececed14] mx-1.5"></div>
                <div className="flex gap-1.5 items-center">
                  <img src={nativeTokenLogo} alt="" className="size-[12px]" />
                  <span className="text-[12px] font-[380]">
                    {formatAmount(activeWallet?.balance?.formatted, {
                      roundMode: 'floor',
                    })}
                  </span>
                </div>
              </>
            )}
            {/* <IconTriangleDown style={{ width: 14, height: 14 }} /> */}
            <img
              className={cn(
                'ml-1 cursor-pointer transition-all duration-200',
                !openSwitchWalletBottomSheet ? 'rotate-0' : '-rotate-180',
              )}
              src="/images/orderForm/ic-arrow-down.svg"
              alt="icon arrow down"
              // onClick={() => handleArrowClick(!isExpand)}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[344px] bg-[#232329] p-0" align="end">
          <div className="w-full max-h-[360px] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b-[1px] border-[#ececed14]">
              <div className="flex items-start flex-col gap-2">
                <p className="text-[14px] leading-none text-white">{t('wallet.totalAssets')}</p>
                <div className="flex items-center gap-2">
                  <img src={nativeTokenLogo} alt="" className="w-3 h-3" />
                  <p className="text-base font-[450] leading-none text-white">
                    {' '}
                    {formatBalanceWallet({
                      balance: totalPrice,
                      decimal: 6,
                    })}
                  </p>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <div className="px-2 py-1.5 text-[12px] font-[330] leading-none border-[#ececed2e] border-[0.5px] bg-[#ececed14] rounded-[200px] cursor-pointer">
                  归集Trump
                </div>
                <div className="px-2 py-1.5 text-[12px] font-[330] leading-none border-[#ececed2e] border-[0.5px] bg-[#ececed14] rounded-[200px]">
                  归集Trump
                </div>
              </div> */}
            </div>

            {listWalletsHodingToken?.length > 0 && (
              <div>
                {/* <p className="text-[15px] leading-[16px]">
                  {t('orderForm.form.hodingtoken', {
                    token: symbol,
                  })}
                </p> */}
                {listWalletsHodingToken?.map((item, index) => {
                  return (
                    <AccordionWallet
                      key={index}
                      walletInfo={item}
                      logoUrl={logoUrl}
                      isLast={listWalletsHodingToken?.length === index + 1}
                    ></AccordionWallet>
                  )
                })}
              </div>
            )}
            {listNotHolding?.length > 0 && (
              <div
                className={cn('', {
                  // 'mt-2': listWalletsHodingToken?.length > 0,
                })}
              >
                {(screen === 'trade' || screen === 'home') && (
                  <div className="flex items-center justify-between p-4 border-t-[6px] border-b-[1px] border-[#ececed14]">
                    <p className="text-[14px] font-[330] leading-none">
                      {/* {listWalletsHodingToken?.length !== 0
                    ? t('orderForm.form.otherToken')
                    : t('orderForm.form.selectWallet')} */}
                      {t('detail.tokenDetail.wallet')}
                    </p>
                    {/*<div className="flex items-center gap-2">*/}
                    {/*  <div className="px-2 py-1.5 text-[12px] font-[330] leading-none border-[#ececed2e] border-[0.5px] bg-[#ececed14] rounded-[200px] cursor-pointer">*/}
                    {/*    归集SOL*/}
                    {/*  </div>*/}
                    {/*  <div className="px-2 py-1.5 text-[12px] font-[330] leading-none border-[#ececed2e] border-[0.5px] bg-[#ececed14] rounded-[200px]">*/}
                    {/*    归集SOL*/}
                    {/*  </div>*/}
                    {/*</div>*/}
                  </div>
                )}
                {listNotHolding?.map((item, index) => {
                  return (
                    <AccordionWallet
                      key={index}
                      walletInfo={item}
                      logoUrl={logoUrl}
                      isLast={listNotHolding?.length === index + 1}
                    ></AccordionWallet>
                  )
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

const AccordionWallet = ({
  walletInfo,
  logoUrl,
  isLast,
}: {
  walletInfo: any
  logoUrl: Maybe<string> | undefined
  isLast?: boolean
}) => {
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const activeWallet = useSelector(_activeWallet)
  const dispatch = useAppDispatch()
  const onSwitchAccount = (account: string) => {
    dispatch(newWalletActions.setActiveAccountWallet(account))
  }
  const tokenLogo = logoUrl ?? getBlockChainLogo(walletInfo?.chainId, walletInfo?.token ?? '')

  return (
    <div
      className={cn('rounded-md mx-auto overflow-hidden border border-transparent', {
        '': activeWallet?.walletAddress === walletInfo?.walletAddress,
      })}
    >
      <div
        className={cn('p-4 gap-0 rounded-4x overflow-hidde', {
          'border-b-[1px] border-[#ececed14]': !isLast,
        })}
        onClick={() => onSwitchAccount(walletInfo?.walletAddress)}
      >
        <div className="flex items-center gap-3">
          {activeWallet?.walletAddress === walletInfo?.walletAddress ? (
            <img src="/images/orderForm/icon-checked-yellow.svg" className="w-5 h-5" alt="" />
          ) : (
            <div className="w-5 h-5 rounded-full border-[#ececed14] border-[0.5px]"></div>
          )}
          <div>
            <div className="">
              <p
                className={cn('text-sm font-medium leading-none truncate max-w-[100px]', {
                  'text-[#facc14]': activeWallet?.walletAddress === walletInfo?.walletAddress,
                })}
              >
                {/* {t('detail.tokenDetail.wallet')} {index} */}
                {walletInfo?.name}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-xs leading-none text-white/50">{formatAddressWallet(walletInfo?.walletAddress)}</p>
                <CopyButton text={walletInfo?.walletAddress} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 py-1.5 px-2 border-[#ececed14] border-[0.5px] rounded-[200px]">
            <img src={getImgIconChain(activeChain)} className="w-3 h-3" alt="" />
            <p className="text-[13px] text-white font-[380] leading-none truncate max-w-[40px]">
              {formatBalanceWallet({
                balance: walletInfo?.balance,
              })}
            </p>
          </div>
          <div className="ml-auto">
            {walletInfo?.isHoldingToken && (
              <div className="flex items-center gap-1 py-1.5 px-2 border-[#ececed14] border-[0.5px] rounded-[200px]">
                <div className="w-3 h-3">
                  <LogoWithChain
                    logo={tokenLogo}
                    name={walletInfo?.portfolioData?.[0]?.symbol}
                    logoClassName="border-[0.5px] border-[#2E0066] w-[12px] min-w-[12px] h-[12px] !rounded-[6px]"
                  />
                </div>
                <p className="text-[13px] text-white font-[380] leading-none truncate max-w-[40px]">
                  {fShortenNumber(walletInfo?.portfolioData?.[0]?.totalBaseAmount, 6, {
                    rounded: 'auto',
                  })}
                </p>
              </div>
            )}
            {!walletInfo?.isHoldingToken && (
              <div className="flex items-center gap-1 py-1.5 px-2 border-[#ececed14] border-[0.5px] rounded-[200px]">
                {/* {walletInfo?.portfolioData?.slice(0, 3).map((item: PortfolioDTO, index: number) => {
                  const tokenLogo = item?.logoUrl ?? getBlockChainLogo(item?.chainId, item?.token ?? '')
                  return (
                    <div className="flex items-center gap-1.5 mt-2 ml-[-8px]" key={index}>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <LogoWithChain
                              logo={tokenLogo}
                              name={item?.symbol}
                              logoClassName="border-[0.5px] border-[#2E0066] w-[16px] min-w-[16px] h-[16px] !rounded-[6px]"
                            />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[360px]">
                            <p className="text-xs leading-none">{item?.symbol}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                })}
                {walletInfo?.totalHoldingTokens > 3 && (
                  <p className="text-sm text-white mt-2 ml-1.5">{fShortenNumber(walletInfo?.totalHoldingTokens - 3)}</p>
                )} */}
                <div>
                  <p className="text-[12px] font-[330] leading-none text-white/70 text-nowrap">
                    Tokens: <span className="text-[13px] text-white">{walletInfo?.totalHoldingTokens}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* {activeWallet?.walletAddress === walletInfo?.walletAddress && (
          <img src="/images/icons/ic-wallet-checked.svg" className="absolute right-0 top-0 z-10" alt="" />
        )} */}
      </div>
    </div>
  )
}
