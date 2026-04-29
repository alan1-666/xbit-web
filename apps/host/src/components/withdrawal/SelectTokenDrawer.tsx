import AppDrawer from '@components/common/AppDrawer.tsx'
import { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { BLOCKCHAIN_NAMES, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { useTranslation } from 'react-i18next'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getPortfolio } from '@services/tokens.service.ts'
import { ServiceConfig } from '@/lib/gql/service-config'
import { SOL_ADDRESS } from '@/hooks/useCreateOrder'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getChainId } from '@/lib/blockchain'

export type SelectTokenDrawerVariant = 'iconOnly' | 'showLabel'

export interface SelectTokenDrawerHandle {
  show: (options: { variant: SelectTokenDrawerVariant; onTokenSelect: (token: Token) => void }) => void
}

type Token = { name: string; address: string; chainId: ChainIds, decimals: number }

export interface SelectTokenDrawerProps {
  ref: Ref<SelectTokenDrawerHandle>
}

export const SelectTokenDrawer = (props: SelectTokenDrawerProps) => {
  const { ref } = props
  const [open, setOpen] = useState(false)
  const activeWallet = useSelector(_activeWallet)
  const activeChain = activeWallet?.chainType
  const userAddress = activeWallet?.walletAddress
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [searchValue, setSearchValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [page, setPage] = useState(1)
  const [assets, setAssets] = useState<any[]>([])
  const networkSupported = [ChainIds.Solana, ChainIds.Ethereum]
  const [networkSelected, setNetworkSelected] = useState<ChainIds | undefined>(undefined)

  const { t } = useTranslation()

  const callbackRef = useRef<Function | null>(null)

  useEffect(() => {
    if (searchValue.length !== 0) {
      const filteredAssets = assets.filter(
        (item) =>
          item.token.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.symbol.toLowerCase().includes(searchValue.toLowerCase()),
      )
      setAssets(filteredAssets)
    } else {
      setPage(1)
      fetchPortfolio()
    }
  }, [searchValue])

  useEffect(() => {
    if (networkSelected) {
      const filteredAssets = assets.filter((item) => item.chainId === networkSelected)
      setAssets(filteredAssets)
    } else {
      setPage(1)
      fetchPortfolio()
    }
  }, [networkSelected])

  useImperativeHandle(ref, () => {
    return {
      show: (options: { variant: SelectTokenDrawerVariant; onTokenSelect: Function }) => {
        callbackRef.current = options.onTokenSelect
        setOpen(true)
      },
    }
  })

  const fetchPortfolio = async () => {
    if (!userAddress || !ServiceConfig.token) return
    const queryInput = {
      userAddress: userAddress,
      hideSmallBalance: false,
      limit: 20,
      page: page,
      chainId: getChainId(activeChain),
    }

    const response = await gqlClient.query({
      query: getPortfolio,
      variables: {
        input: queryInput,
      },
    })

    if (page > 1) {
      setAssets((prev) => [...prev, ...response.data.getPortfolio.data])
    } else {
      setAssets(response.data.getPortfolio.data)
    }
  }

  useEffect(() => {
    if (open) {
      fetchPortfolio()
    }
  }, [open])

  const handleOnClick = (token: Token) => {
    callbackRef.current?.(token)
    setOpen(false)
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

    if (scrollPercentage >= 0.75) {
      if (assets.length < 20 * page) return // Prevent fetching if we already have all items
      setPage((prevPage) => prevPage + 1)
      fetchPortfolio()
    }
  }

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      title={t('assets.withdrawal.selectToken')}
      drawerContentClassName="max-h-[75vh]"
      drawerContent={
        <>
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
              className="w-full py-3 px-[45px] bg-(--bg-secondary) border border-solid border-(--bg-secondary) rounded-[200px] text-[14px] leading-[14px]"
            />
            <img alt="" className="size-[16px] absolute top-[15px] left-[20px]" src="/images/icons/search-icon-2.svg" />
            {searchValue.length !== 0 && (
              <img
                className="size-[16px] absolute top-[15px] right-[20px]"
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
          <div className="text-[14px] text-white/50 leading-none">{t('assets.deposit.selectNetwork')}</div>
          <div className="mt-3 flex gap-2">
            <div
              className={`h-[30px] px-[8px] py-[6px] bg-[#ECECED14] rounded-[6px] cursor-pointer text-center text-[14px] text-white leading-none flex items-center gap-1 border-gradient style2 ${networkSelected === undefined ? 'bg-gradient-to-r from-[#E149F8]/10 via-[ #9945FF]/10 to-[#00F3AB]/10' : 'before:invisible hover:before:visible'}`}
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
              {t('assets.switchNetwork.allNetwork')}
            </div>
            {networkSupported.map((network) => (
              <div
                key={network}
                className={`h-[30px] px-[8px] py-[6px] bg-[#ECECED14] rounded-[6px] cursor-pointer text-center text-[14px] text-white leading-none flex items-center gap-1 border-gradient style2 ${networkSelected === network ? 'bg-gradient-to-r from-[#E149F8]/10 via-[ #9945FF]/10 to-[#00F3AB]/10' : 'before:invisible hover:before:visible'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (network === ChainIds.Ethereum) return // TODO: handle for Ethereum, Arb
                  if (networkSelected === network) {
                    setNetworkSelected(undefined)
                  } else {
                    setNetworkSelected(network)
                  }
                }}
                style={{
                  cursor: network === ChainIds.Ethereum ? 'not-allowed' : 'pointer',
                  opacity: network === ChainIds.Ethereum ? 0.5 : 1,
                }}
              >
                <LogoWithChain
                  logo={getBlockchainLogo2(network)}
                  logoClassName="w-[18px] h-[18px] min-w-none"
                  name={BLOCKCHAIN_NAMES[network]}
                />
                {BLOCKCHAIN_NAMES[network]}
              </div>
            ))}
          </div>
          <div className="my-4 text-[14px] text-white/50 leading-none">{t('assets.deposit.selectToken')}</div>
          <div
            className="flex flex-col gap-2 h-[calc(75vh-200px)] overflow-y-auto no-scrollbar"
            onScroll={handleScroll}
          >
            {activeChain === 'sol' && (!networkSelected || networkSelected === ChainIds.Solana) && (
              <div
                className="flex items-center justify-between p-3 rounded-[8px] border-gradient style2 border-[0.5px] border-[#ECECED1F] before:invisible hover:before:visible  cursor-pointer"
                onClick={() =>
                  handleOnClick({
                    name: 'SOL',
                    address: SOL_ADDRESS,
                    chainId: ChainIds.Solana,
                    decimals: 9,
                  })
                }
              >
                <div className="flex items-center gap-2.5">
                  <LogoWithChain
                    logo={getBlockchainLogo2(ChainIds.Solana)}
                    name={'SOL'}
                    chainLogo={getBlockchainLogo2(ChainIds.Solana)}
                    logoClassName="w-9 h-9"
                  />
                  <div>
                    <div className="font-[380] text-[16px] text-white leading-none">{'SOL'}</div>
                    <div className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none uppercase">
                      {activeChain}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <MoneyFormatted
                    value={Number(activeWallet?.balance?.formatted)}
                    className="font-sembold text-[16px] text-white leading-none"
                    showUnit={false}
                  />
                  <MoneyFormatted
                    value={Number(activeWallet?.balance?.formatted) * Number(priceNativeToken)}
                    className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none"
                  />
                </div>
              </div>
            )}

            {assets.map((item) => (
              <div
                className="flex items-center justify-between p-3 rounded-[8px] border-gradient style2 border-[0.5px] border-[#ECECED1F] before:invisible hover:before:visible cursor-pointer"
                // onClick={() =>
                //   handleOnClick({
                //     name: item.symbol,
                //     address: item.token,
                //     chainId: item.chainId,
                //     decimals: item.decimals,
                //   })
                // }
                key={item.token}
                style={{
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <LogoWithChain
                    logo={item.logoUrl ?? getBlockChainLogo(item.chainId, item.address)}
                    name={item.token}
                    chainLogo={getBlockchainLogo2(item.chainId)}
                    logoClassName="w-9 h-9"
                  />
                  <div>
                    <div className="font-[380] text-[16px] text-white leading-none">{item.symbol}</div>
                    <div className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none uppercase">
                      {activeChain}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <MoneyFormatted
                    value={Number(item.totalBaseAmount)}
                    className="font-sembold text-[16px] text-white leading-none"
                    showUnit={false}
                  />
                  <MoneyFormatted
                    value={Number(item.totalBaseAmount) * Number(item.avgPriceUsd)}
                    className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      }
    />
  )
}
