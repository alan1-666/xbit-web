import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { BLOCKCHAIN_NAMES, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { useTranslation } from 'react-i18next'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { motion } from 'framer-motion'
import { ARB_USDC_ADDRESS, ARB_USDC_ADDRESS_V2, NATIVE_TOKENS } from '@/lib/constant.ts'
import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'

type AssetOption = {
  token: string
  name: string
  symbol: string
  logo: string
  chainLogo: string
  chainName: string
  tokenAddress: string
  chainId: ChainIds
}

const assetsOptions: AssetOption[] = [
  {
    token: 'SOL',
    name: 'Solana',
    symbol: NATIVE_TOKENS.sol.SOL.symbol,
    chainId: ChainIds.Solana,
    logo: getBlockchainLogo2(ChainIds.Solana),
    chainLogo: getBlockchainLogo2(ChainIds.Solana),
    chainName: 'Solana',
    tokenAddress: 'So11111111111111111111111111111111111111111', // Native SOL token address
  },
  {
    token: 'BNB',
    name: 'BNB Chain',
    symbol: NATIVE_TOKENS.bsc.BNB.symbol,
    chainId: ChainIds.Bsc,
    logo: '/images/bnb.svg',
    chainLogo: getBlockchainLogo2(ChainIds.Bsc),
    chainName: 'BNB',
    tokenAddress: NATIVE_TOKENS.bsc.BNB.address,
  },
  {
    token: 'USDC',
    name: 'Arbitrum USDC',
    symbol: NATIVE_TOKENS.arb.USDC.symbol,
    chainId: ChainIds.Arbitrum,
    logo: getBlockChainLogo(ChainIds.Arbitrum, ARB_USDC_ADDRESS),
    chainLogo: getBlockchainLogo2(ChainIds.Arbitrum),
    chainName: 'Arbitrum',
    tokenAddress: ARB_USDC_ADDRESS_V2, // USDC token address on Arbitrum
  },
  {
    token: 'ARB-ETH',
    name: 'Ethereum',
    symbol: NATIVE_TOKENS.arb.ETH.symbol,
    chainId: ChainIds.Arbitrum,
    logo: '/images/icons/chains/ic-ethereum.svg',
    chainLogo: getBlockchainLogo2(ChainIds.Arbitrum),
    chainName: 'Arbitrum',
    tokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH token address on Arbitrum
  },
  {
    token: 'ETH',
    name: 'Ethereum',
    symbol: NATIVE_TOKENS.eth.ETH.symbol,
    chainId: ChainIds.Ethereum,
    logo: getBlockchainLogo2(ChainIds.Ethereum),
    chainLogo: getBlockchainLogo2(ChainIds.Ethereum),
    chainName: 'Ethereum',
    tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH token address
  },
]

const getAssetIcon = (option: AssetOption | 'all') => {
  if (option === 'all') return undefined
  return option.logo
}

const AssetOptionItem = (props: {
  icon: ReactNode
  name: string
  chain?: string
  selected: boolean
  onClick: () => void
}) => {
  const { icon, name, chain, selected, onClick } = props
  return (
    <div
      className="flex items-center py-3.5 border-b border-[#ECECED14] last:border-b-0 cursor-pointer gap-3"
      onClick={onClick}
    >
      <div>{icon}</div>
      <div className="flex-1">
        <div className="text-[1rem] font-medium">{name}</div>
        <div className="text-[calc(12rem/16)] text-[#FFFFFF80]">{chain}</div>
      </div>
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconCheckedCircle className="size-5" />
        </motion.div>
      )}
    </div>
  )
}

const AllAssetIcon = () => {
  return (
    // <div className="size-[30px] bg-[#ECECED1F] rounded-full border-[#ECECED14] border flex justify-center items-center">
    //   <IconWallet className="size-4" />
    // </div>
    <img src="/images/icons/ic-wallet-circle.svg?v=2" className="size-[30px]" alt="" />
  )
}

const AssetIcon = (props: { option: AssetOption }) => {
  const { option } = props
  const icon = getAssetIcon(option)
  const chainLogo = getBlockchainLogo2(option.chainId)
  return <ChainCurrencyIcon chainIcon={chainLogo} currencyIcon={icon!} avatarClassName="ml-0 mt-0" />
}

export interface AssetSelectProps {
  currentAsset?: string | 'all'
  onChange: (option: {
    token: string | undefined
    tokenAddress: string | undefined
    chainId: ChainIds | undefined
  }) => void
}

export const AssetSelect = (props: AssetSelectProps) => {
  const { onChange, currentAsset } = props
  const [open, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'all' | AssetOption>('all')
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [filteredAssetsOptions, setFilteredAssetsOptions] = useState<AssetOption[]>(assetsOptions)
  const icon = getAssetIcon(selectedOption)
  const optionText = selectedOption === 'all' ? t('assets.overview.allAssets') : selectedOption.symbol
  const { isDesktop } = useResponsive()

  useEffect(() => {
    if (!currentAsset) return
    if (currentAsset === 'all') {
      setSelectedOption('all')
      return
    }
    const assetOption = filteredAssetsOptions.find(
      (option) => option.tokenAddress === currentAsset || option.token === currentAsset,
    )
    setSelectedOption(assetOption || 'all')
  }, [currentAsset])

  useEffect(() => {
    let assetsOptionsFiltered = assetsOptions
    if (searchValue) {
      const searchValueLower = searchValue.toLowerCase()
      assetsOptionsFiltered = assetsOptions.filter(
        (option) =>
          option.name.toLowerCase().includes(searchValueLower) ||
          option.symbol.toLowerCase().includes(searchValueLower) ||
          option.chainName.toLowerCase().includes(searchValueLower) ||
          option.tokenAddress.toLowerCase() === searchValueLower,
      )
    }
    setFilteredAssetsOptions(assetsOptionsFiltered)
  }, [searchValue])

  const handleSelect = (option: 'all' | AssetOption) => {
    setSelectedOption(option)
    if (option === 'all') {
      onChange({
        token: undefined,
        tokenAddress: undefined,
        chainId: undefined,
      })
    } else {
      onChange({
        token: option.token,
        tokenAddress: option.tokenAddress,
        chainId: option.chainId,
      })
    }
    setOpen(false)
  }

  const renderTrigger = () => {
    return (
      <div className="flex items-center gap-1 cursor-pointer text-[14px] leading-[14px] font-[330]">
        {!!icon && <img src={getAssetIcon(selectedOption)} alt="" className="size-4 rounded-full" />}
        {optionText}
        <IconTriangleDown />
      </div>
    )
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
        <DialogContent
          className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 p-0 pt-2 "
          showDialogPrimitiveClose={false}
        >
          <DialogHeader className="flex justify-end px-2">
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer ml-auto"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogHeader>
          <div className="px-3">
            <div className="relative w-full] mb-3">
              <input
                ref={inputRef}
                value={searchValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s+/g, '')
                  setSearchValue(value)
                }}
                placeholder={t('search.placeholder2')}
                type="text"
                className="w-full py-3 px-[38px] bg-[#ECECED0A] border border-solid border-[#ECECED14] rounded-[200px] text-[14px] leading-[14px] placeholder:font-[350] placeholder:capitalize"
              />
              <img
                alt=""
                className="size-[16px] absolute top-[15px] left-[16px]"
                src="/images/icons/search-icon-2.svg"
              />
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
            <AssetOptionItem
              icon={<AllAssetIcon />}
              name={t('assets.overview.allAssets')}
              selected={selectedOption === 'all'}
              onClick={() => handleSelect('all')}
            />
            {filteredAssetsOptions.map((option) => (
              <AssetOptionItem
                icon={<AssetIcon option={option} />}
                name={option.symbol}
                chain={BLOCKCHAIN_NAMES[option.chainId]}
                selected={selectedOption === option}
                onClick={() => handleSelect(option)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-end">
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3">
          <div className="relative w-full] mb-3">
            <input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value.replace(/\s+/g, '')
                setSearchValue(value)
              }}
              placeholder={t('search.placeholder2')}
              type="text"
              className="w-full py-3 px-[38px] bg-[#ECECED0A] border border-solid border-[#ECECED14] rounded-[200px] text-[14px] leading-[14px] placeholder:font-[350] placeholder:capitalize"
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
          <AssetOptionItem
            icon={<AllAssetIcon />}
            name={t('assets.overview.allAssets')}
            selected={selectedOption === 'all'}
            onClick={() => handleSelect('all')}
          />
          {filteredAssetsOptions.map((option) => (
            <AssetOptionItem
              icon={<AssetIcon option={option} />}
              name={option.symbol}
              chain={BLOCKCHAIN_NAMES[option.chainId]}
              selected={selectedOption === option}
              onClick={() => handleSelect(option)}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
