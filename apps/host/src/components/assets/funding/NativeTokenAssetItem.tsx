import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive.ts'
import { SOL_ADDRESS } from '@/lib/blockchain.ts'
import { ARB_USDC_ADDRESS, NATIVE_TOKENS } from '@/lib/constant.ts'
import { formatBalance } from '@/lib/format'
import { ChainIds } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding.ts'
import { getNameFromChainId } from '@/utils/chain'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { getTokenSymbol } from '@/utils/token.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import SideSheet from '@components/common/SideSheet.tsx'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { usePriceOHLC } from '@hooks/useTokenPriceChange.ts'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FundingHistory from './FundingHistory.tsx'

export interface NativeTokenAssetItemProps {
  item: PortfolioDTO
}

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000' // ETH address on Ethereum
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH address on Ethereum
const WETH_ARB_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' // WETH address on Arbitrum
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC address on Ethereum
const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT address on Ethereum

const calculateETHHoldingValue = (item: PortfolioDTO, ethPrice: number) => {
  switch (item.token) {
    case ETH_ADDRESS.toLowerCase():
      return item.totalBaseAmount * ethPrice
    case USDC_ADDRESS.toLowerCase():
      return item.totalBaseAmount // Assuming USDC is priced in ETH
    default:
      return 0
  }
}

const calculateARBHoldingValue = (item: PortfolioDTO, ethPrice: number) => {
  switch (item.token.toLowerCase()) {
    case ETH_ADDRESS.toLowerCase():
      return item.totalBaseAmount * ethPrice
    case ARB_USDC_ADDRESS.toLowerCase():
      return item.totalBaseAmount * (item.price || 1)
    default:
      return 0
  }
}

export const NativeTokenAssetItem = (props: NativeTokenAssetItemProps) => {
  const { item } = props
  const { isDesktop } = useResponsive()
  const { solPrice, ethPrice } = useNativeTokenPrices()
  const [openFundingHistory, setOpenFundingHistory] = useState(false)
  const priceOHLC = usePriceOHLC({ address: item?.token ?? '', defaultValue: '0' })
  const priceMqtt = useTokenPrice(item?.token ?? '', '0')
  const fallBackPrice = item?.price || 0
  const price =
    priceOHLC && Number(priceOHLC) != 0 ? Number(priceOHLC) : priceMqtt != 0 ? priceMqtt : Number(fallBackPrice)
  const holdingValue = useMemo(() => {
    if (item.chainId === ChainIds.Solana && item.token === SOL_ADDRESS) return item.totalBaseAmount * solPrice
    if (item.chainId === ChainIds.Ethereum) return calculateETHHoldingValue(item, ethPrice)
    if (item.chainId === ChainIds.Arbitrum) return calculateARBHoldingValue(item, ethPrice)
    return item.totalBaseAmount * (Number(price) || item.price || 0)
  }, [item, solPrice, ethPrice, price])
  const [searchParams, setSearchParams] = useSearchParams()
  const fundingToken = searchParams.get('funding')

  const logo = useMemo(() => {
    if (item.token === SOL_ADDRESS) return '/images/icons/chains/ic-solana2.png'
    if (item.token.toLocaleLowerCase() === WETH_ADDRESS || item.token.toLocaleLowerCase() === WETH_ARB_ADDRESS)
      return '/images/icons/chains/ic-ethereum.svg'
    if (item.chainId === ChainIds.Ethereum && item.token.toLocaleLowerCase() == ETH_ADDRESS)
      return '/images/icons/chains/ic-ethereum.svg'
    if (item.chainId === ChainIds.Arbitrum && item.token.toLocaleLowerCase() == ETH_ADDRESS)
      return '/images/icons/chains/ic-ethereum.svg'
    if (item.chainId === ChainIds.Bsc && item.token.toLocaleLowerCase() == ETH_ADDRESS) return '/images/bnb.svg'
    if (item.token.toLocaleLowerCase() === ARB_USDC_ADDRESS || item.token.toLocaleLowerCase() == USDC_ADDRESS)
      return '/images/icons/chains/ic-usdc.svg'
    if (item.token.toLocaleLowerCase() === USDT_ADDRESS) return '/images/icons/chains/ic-usdt.svg'
    return getBlockChainLogo(item.chainId, item.token)
  }, [item.chainId, item.token])

  const tokenSymbol = useMemo(() => {
    if (
      item.chainId === ChainIds.Ethereum &&
      item.token.toLowerCase() === NATIVE_TOKENS.eth.WETH.address.toLowerCase()
    ) {
      return NATIVE_TOKENS.eth.WETH.symbol
    }
    if (
      item.chainId === ChainIds.Arbitrum &&
      item.token.toLowerCase() === NATIVE_TOKENS.arb.WETH.address.toLowerCase()
    ) {
      return NATIVE_TOKENS.arb.WETH.symbol
    }
    return getTokenSymbol(item.chainId, item.token, item.symbol)
  }, [item.chainId, item.token, item.symbol])

  useEffect(() => {
    if (openFundingHistory) {
      setSearchParams({ ...Object.fromEntries(searchParams), funding: item.token })
    } else if (fundingToken) {
      setSearchParams((prev) => {
        const params = Object.fromEntries(prev)
        delete params.funding
        return params
      })
    }
  }, [openFundingHistory])

  useEffect(() => {
    if (fundingToken === item.token) {
      setOpenFundingHistory(true)
      setSearchParams({ ...Object.fromEntries(searchParams), funding: item.token })
    }
  }, [])
  return (
    <div>
      <div
        className="flex justify-between items-center px-3 py-4 cursor-pointer hover:bg-[#ECECED14] transition-colors duration-200"
        onClick={() => {
          setSearchParams({ ...Object.fromEntries(searchParams), funding: item.token })
          setOpenFundingHistory(true)
        }}
      >
        <div className="flex justify-center items-center gap-2">
          <LogoWithChain
            logo={logo}
            logoClassName="w-[28px] h-[28px]"
            name={item?.symbol}
            chainLogo={getBlockchainLogo2(item.chainId)}
          />
          <div>
            <div className="font-medium text-[16px] leading-none text-white">{tokenSymbol}</div>
            <div className="mt-1.5 font-[330] text-[14px] leading-none text-white/50">
              {getNameFromChainId(item.chainId)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="font-[450] text-[18px] leading-none text-white">
            {formatBalance(item?.totalBaseAmount, {
              roundMode: 'floor',
            })}
          </span>
          <div className="mt-1 font-[330] text-[14px] leading-none text-white/50">
            {formatBalance(holdingValue, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </div>
        </div>
      </div>
      {isDesktop ? (
        <Dialog open={openFundingHistory} onOpenChange={setOpenFundingHistory}>
          <DialogContent className="p-0 max-h-[80vh] min-w-[768px] overflow-hidden gap-0">
            <DialogHeader className="bg-[#232329] flex items-center p-3">
              <div className="flex items-center gap-1.5">
                <LogoWithChain
                  logo={logo}
                  logoClassName="w-6 h-6"
                  name={item.symbol}
                  chainLogo={getBlockchainLogo2(item.chainId)}
                />
                <span className="text-[18px] font-[380] text-white">{item.symbol}</span>
              </div>
            </DialogHeader>
            <FundingHistory
              token={{
                chainId: item.chainId,
                address: item.token,
                symbol: tokenSymbol,
                logo: logo,
                amount: item.totalBaseAmount,
                decimals: item.decimals,
                value: holdingValue,
              }}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <SideSheet isOpen={openFundingHistory} onClose={() => setOpenFundingHistory(false)} direction="right">
          <FundingHistory
            token={{
              chainId: item.chainId,
              address: item.token,
              symbol: tokenSymbol,
              logo: logo,
              amount: item.totalBaseAmount,
              decimals: item.decimals,
              value: holdingValue,
            }}
            onClose={() => setOpenFundingHistory(false)}
          />
        </SideSheet>
      )}
    </div>
  )
}
