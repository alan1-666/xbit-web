import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { BLOCKCHAIN_NAMES, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { useTranslation } from 'react-i18next'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { motion } from 'framer-motion'
import { ARB_USDC_ADDRESS, ARB_USDC_ADDRESS_V2, NATIVE_TOKENS, APP_PATH } from '@/lib/constant.ts'
import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'

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
  {
    token: 'BNB',
    name: 'Binance Coin',
    symbol: NATIVE_TOKENS.bsc.BNB.symbol,
    chainId: ChainIds.Bsc,
    logo: '/images/bnb.svg',
    chainLogo: getBlockchainLogo2(ChainIds.Bsc),
    chainName: 'BNB Chain',
    tokenAddress: NATIVE_TOKENS.bsc.BNB.address,
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
      className="flex items-center py-2 border-b border-[#25242B] last:border-b-0 cursor-pointer gap-3"
      onClick={onClick}
    >
      <div>{icon}</div>
      <div className="flex-1">
        <div className="text-[1rem] font-medium">{name}</div>
        <div className="text-[calc(12rem/16)] text-[#908E98]">{chain}</div>
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

const AssetIcon = (props: { option: AssetOption }) => {
  const { option } = props
  const icon = getAssetIcon(option)
  const chainLogo = getBlockchainLogo2(option.chainId)
  return <ChainCurrencyIcon chainIcon={chainLogo} currencyIcon={icon!} avatarClassName="ml-0 mt-0" />
}

export interface AssetSelectProps {
  currentAsset?: string | 'all'
  onChange?: (option: {
    token: string | undefined
    tokenAddress: string | undefined
    chainId: ChainIds | undefined
  }) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  shouldNavigateOnSelect?: boolean // 是否在选择后自动跳转到 deposit 页面
}

export const DepositCoinSelect = (props: AssetSelectProps) => {
  const { currentAsset, open: controlledOpen, onOpenChange} = props
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [selectedOption, setSelectedOption] = useState<'all' | AssetOption>('all')
  const { t } = useTranslation()
  // const [searchValue, setSearchValue] = useState<string>('')
  const [filteredAssetsOptions, setFilteredAssetsOptions] = useState<AssetOption[]>(assetsOptions)
  const navigate = useNavigate()
  const navigateWithLocation = useNavigateWithLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!currentAsset) return
    const assetOption = filteredAssetsOptions.find(
      (option) => option.tokenAddress === currentAsset || option.token === currentAsset,
    )
    setSelectedOption(assetOption || 'all')
  }, [currentAsset])

  // useEffect(() => {
  //   let assetsOptionsFiltered = assetsOptions
  //   if (searchValue) {
  //     const searchValueLower = searchValue.toLowerCase()
  //     assetsOptionsFiltered = assetsOptions.filter(
  //       (option) =>
  //         option.name.toLowerCase().includes(searchValueLower) ||
  //         option.symbol.toLowerCase().includes(searchValueLower) ||
  //         option.chainName.toLowerCase().includes(searchValueLower) ||
  //         option.tokenAddress.toLowerCase() === searchValueLower,
  //     )
  //   }
  //   setFilteredAssetsOptions(assetsOptionsFiltered)
  // }, [searchValue])

  // 处理代币选择后的跳转逻辑
  const handleNavigateToDeposit = (option: AssetOption) => {
    // 根据选择的代币构建跳转参数
    let depositType: string | undefined
    if (option.chainId === ChainIds.Arbitrum) {
      if (option.token === 'USDC') {
        depositType = 'ARB_USDC'
      } else if (option.token === 'ARB-ETH' || option.token === 'ETH') {
        depositType = 'ARB_ETH'
      }
    }
    if(option.chainId === ChainIds.Bsc) {
      depositType = 'BNB'
    }
    if(option.chainId === ChainIds.Ethereum) {
      depositType = 'ETH'
    }
    if(option.chainId === ChainIds.Solana) {
      depositType = 'SOL'
    }
    // 根据当前页面路由判断 source 类型
    const source = searchParams.get('page') === 'funding' ? 'funding' : 'overview'
    // 跳转到 deposit 页面，传递 type 参数
    if (depositType) {
      navigate(`${APP_PATH.DEPOSIT}`, { state: { type: depositType, source } })
    } else {
      navigate(`${APP_PATH.DEPOSIT}`, { state: { source } })
 
    }
  }

  const handleSelect = (option: 'all' | AssetOption) => {
    handleNavigateToDeposit(option as AssetOption)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6">
        {/* <DrawerTitle></DrawerTitle> */}
        <DrawerHeader className="flex items-center justify-between">
          <div className="text-white text-[18px] font-medium">{t('assets.deposit.selectToken')}</div>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3">
          {filteredAssetsOptions.map((option) => (
            <AssetOptionItem
              icon={<AssetIcon option={option} />}
              name={option.symbol}
              chain={option.chainName}
              selected={selectedOption === option}
              onClick={() => handleSelect(option)}
              key={option.token}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
