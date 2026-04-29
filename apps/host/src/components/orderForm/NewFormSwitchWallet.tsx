import { useEffect, useMemo, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import clsx from 'clsx'
import { f } from 'fintech-number'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { getImgIconChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import { CopyButton } from '../common/copy-button'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { getListPortfoliosByTokens } from '@/services/tokens.service'
import ChooseAccountPopup from '@components/assets/deposit/ChooseAccountPopup.tsx'
import { formatBalanceWallet, fShortenNumber } from '@/lib/number'
import { useQuery } from '@apollo/client'
import { Maybe, PortfolioDto, PortfolioManyWalletInput } from '@/@generated/gql/graphql-core'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useSelector } from 'react-redux'
import { _activeWallet, mappedTypeChain, newWalletActions } from '@/redux/modules/newWallet.slice'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { getBlockChainLogo } from '@/utils/helpers'
import LogoWithChain from '../common/LogoWithChain'
import { PortfolioDTO } from '@/types/holding'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { formatPrice, formatAmount, formatVolume, formatPercent, formatBalance } from '@/lib/format'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

const NewFormSwitchWallet = ({
  token,
  logoUrl,
  symbol,
}: {
  token: Maybe<string> | undefined
  logoUrl: Maybe<string> | undefined
  symbol: Maybe<string> | undefined
}) => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const [open, setOpen] = useState<boolean>(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [openChooseAccountPopup, setOpenChooseAccountPopup] = useState(false)

  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const listWalletsByActiveChain = useMemo(
    () => listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w?.chain === mappedTypeChain(activeChain)),
    [listWalletsByChain, activeChain],
  )
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
    pollInterval: open ? 60000 : 0,
  })

  const listHolding = dataListHoldingToken?.getPortfolioManyWallet?.data

  type MergedWallet = UserEmbeddedWalletDto & {
    isHoldingToken: boolean
    portfolioData?: PortfolioDto[]
  }

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
    pollInterval: open ? 60000 : 0,
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
    dataListNotHoldingToken?.getPortfolioManyWallet?.data as any[],
  )

  return (
    <div className="flex items-center mb-3.5">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild className="cursor-pointer">
          <div className="flex items-center gap-0.5">
            <p className="text-xs font-medium leading-none text-[#ffffff99]">{t('orderForm.form.available')}</p>
            <img className={clsx('w-4 h-4', open && 'rotate-180')} src="/images/icons/ic-down-new.svg" alt="" />
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-[#212127] max-w-[768px] mx-auto">
          <DrawerHeader className="flex items-center justify-between py-3 px-4.5">
            {/* <DrawerTitle>{t('orderForm.form.availableAssets')}</DrawerTitle> */}
            <div>
              {listWalletsHodingToken?.length > 0 && (
                <p className="text-[18px] font-[380] leading-[16px]">
                  {t('orderForm.form.hodingtoken', {
                    token: symbol,
                  })}
                </p>
              )}
            </div>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="w-full px-3 mt-2 max-h-[280px] overflow-y-auto">
            {listWalletsHodingToken?.length > 0 && (
              <div>
                {/* <p className="text-[15px] leading-[16px]">
                  {t('orderForm.form.hodingtoken', {
                    token: symbol,
                  })}
                </p> */}
                {listWalletsHodingToken?.map((item, index) => {
                  return <AccordionWallet key={index} walletInfo={item} open={open} logoUrl={logoUrl}></AccordionWallet>
                })}
              </div>
            )}
            {listNotHolding?.length > 0 && (
              <div
                className={cn('text-[15px] leading-[16px]', {
                  'mt-6': listWalletsHodingToken?.length > 0,
                })}
              >
                <p>
                  {listWalletsHodingToken?.length !== 0
                    ? t('orderForm.form.otherToken')
                    : t('orderForm.form.selectWallet')}
                </p>
                {listNotHolding?.map((item, index) => {
                  return <AccordionWallet key={index} walletInfo={item} open={open} logoUrl={logoUrl}></AccordionWallet>
                })}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      <div className="ml-auto mr-1">
        <p className="text-[11px] font-medium leading-none text-white">
          {formatAmount(activeWallet?.balance?.formatted, {
            roundMode: 'floor',
            unit: getNativeTokenByActiveChain(activeChain),
          })}
          <span className="text-[#ffffff99]">
            {' ≈ '}
            {formatBalance(activeWallet?.balance?.formatted * priceNativeToken, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </span>
        </p>
      </div>
      <img
        src="/images/icons/ic-add-circle.svg"
        className="w-3 h-3 cursor-pointer"
        alt=""
        onClick={() => {
          setOpenChooseAccountPopup(true)
          // navigate(APP_PATH.DEPOSIT)
        }}
      />
      <ChooseAccountPopup open={openChooseAccountPopup} setOpen={setOpenChooseAccountPopup} />
    </div>
  )
}

export default NewFormSwitchWallet

const AccordionWallet = ({
  walletInfo,
  open,
  logoUrl,
}: {
  walletInfo: any
  open: boolean
  logoUrl: Maybe<string> | undefined
}) => {
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const activeWallet = useSelector(_activeWallet)
  const dispatch = useAppDispatch()
  const onSwitchAccount = (account: string) => {
    dispatch(newWalletActions.setActiveAccountWallet(account))
  }
  const tokenLogo = logoUrl ?? getBlockChainLogo(walletInfo?.chainId, walletInfo?.token ?? '')

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(walletInfo?.walletAddress).then(setSrc)
  }, [walletInfo?.walletAddress])

  return (
    <div
      className={cn(
        'relative mt-3.5 rounded-md mx-auto overflow-hidden bg-[#2B2B33] border border-[#2B2B33] cursor-pointer',
        {
          'border-[#755AB3] bg-[#584487]': activeWallet?.walletAddress === walletInfo?.walletAddress,
        },
      )}
    >
      <div className="p-3 gap-0 rounded-4x overflow-hidden" onClick={() => onSwitchAccount(walletInfo?.walletAddress)}>
        <div className="flex items-center gap-3">
          {/* <img src="/images/xbit-logo-rounded.svg" className="w-10 h-10 rounded-full" alt="logo xbit" /> */}
          <img data-avatar-type="wallet" src={src} className="w-10 h-10 rounded-full shrink-0" alt="logo xbit" />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center">
              <p className="font-[380] text-[14px] text-white leading-none mr-2.5 whitespace-nowrap">
                {/* {t('detail.tokenDetail.wallet')} {index} */}
                {walletInfo?.name}
              </p>
              <p
                className={cn(
                  'font-[330] text-[12px] leading-none mr-1.5',
                  activeWallet?.walletAddress === walletInfo?.walletAddress ? 'text-[#C8A7FD]' : 'text-[#908E98]',
                )}
              >
                {formatAddressWallet(walletInfo?.walletAddress)}
              </p>
              <CopyButton text={walletInfo?.walletAddress} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <img src={getImgIconChain(activeChain)} className="w-3 h-3" alt="" />
                <p className="font-[450] text-[14px] text-white leading-none">
                  {formatBalanceWallet({
                    balance: walletInfo?.balance,
                  })}
                </p>
              </div>
              <div className="flex items-center justify-end overflow-hidden ml-2 min-w-0">
                {walletInfo?.isHoldingToken && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 shrink-0">
                      <LogoWithChain
                        logo={tokenLogo}
                        name={walletInfo?.portfolioData?.[0]?.symbol}
                        logoClassName="border-[0.5px] border-[#2E0066] w-[16px] min-w-[16px] h-[16px] !rounded-[6px]"
                      />
                    </div>
                    <p className="font-[380] text-[16px] text-white leading-none truncate">
                      {fShortenNumber(walletInfo?.portfolioData?.[0]?.totalBaseAmount, 6, {
                        rounded: 'auto',
                      })}
                    </p>
                  </div>
                )}
                {!walletInfo?.isHoldingToken && (
                  <div className="flex items-center">
                    {walletInfo?.portfolioData?.slice(0, 3).map((item: PortfolioDTO, index: number) => {
                      const tokenLogo = item?.logoUrl ?? getBlockChainLogo(item?.chainId, item?.token ?? '')
                      return (
                        <div className="flex items-center gap-1.5 ml-[-8px]" key={index}>
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
                      <p className="text-sm text-white ml-1.5">
                        {fShortenNumber(walletInfo?.totalHoldingTokens - 3)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {activeWallet?.walletAddress === walletInfo?.walletAddress && (
          <img src="/images/icons/ic-wallet-checked.svg" className="absolute right-0 top-0 z-10" alt="" />
        )}
      </div>
    </div>
  )
}
