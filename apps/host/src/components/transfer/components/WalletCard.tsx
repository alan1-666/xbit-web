import { CopyButton } from '@/components/common/copy-button'
import LogoWithChain from '@/components/common/LogoWithChain'
import Text from '@/components/common/Text'
import { formatAmount } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils.ts'
import { mappedChainTypeToChainId } from '@/redux/modules/newWallet.slice.ts'
import { selectAllTokens, tokenActions } from '@/redux/modules/tokens.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getTokenData } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'
import { useResponsive } from '@hooks/useResponsive.ts'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SOL_ADDRESS = 'So11111111111111111111111111111111111111111'
const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const ARB_ETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const USDC_HYPERLIQUID_ADDRESS = '0x00000000000000000000000000000000'
const POLYGON_USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'

type WalletCardProps = {
  amount?: string
  walletAddress?: string
  tokenAddress?: string
  chainId?: string | number
  isFrom?: boolean
}

const WalletCard = ({
  amount = '--',
  walletAddress = '',
  tokenAddress = '',
  chainId = '',
  isFrom = false,
}: WalletCardProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [tokenImage, setTokenImage] = useState<string>('')
  const [chainLogoImage, setChainLogoImage] = useState<string>('')
  const [accountType, setAccountType] = useState<string>('assets.transfers.memeAccount')
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const walletName = useMemo(() => {
    return (
      listWalletsByChain.find(
        (item: any) =>
          item?.walletAddress?.toLowerCase() === walletAddress?.toLowerCase() &&
          mappedChainTypeToChainId(item?.chain) == chainId,
      )?.name || ''
    )
  }, [walletAddress, chainId, listWalletsByChain])
  const tokensState = useAppSelector(selectAllTokens)
  const { isDesktop } = useResponsive()

  const fetchTokenData = async (token: string) => {
    try {
      const response = await gqlClient.query({
        query: getTokenData,
        variables: {
          input: { address: token },
        },
      })
      const tokenData = response?.data?.getTokenDetail
      dispatch(
        tokenActions.setTokenData({
          address: tokenData?.address,
          chainId: tokenData?.chainId,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          logo: tokenData?.info?.logoUrl,
          isBlacklisted: tokenData?.isBlacklisted || false,
          totalSupply: tokenData?.totalSupply || '0',
        }),
      )
      return {
        logo: tokenData?.logo,
        symbol: tokenData?.symbol,
        name: tokenData?.name,
      }
    } catch (error) {
      console.error('Error fetching token detail:', error)
      return null
    }
  }

  const getFundingRecordTokenUnit = (tokenAddress: string, chainId: number | string) => {
    if (!tokenAddress && !chainId) return 'USDC'

    if (!tokenAddress) {
      switch (+chainId) {
        case ChainIds.Ethereum:
        case ChainIds.Arbitrum:
        case ChainIds.Base:
          return 'ETH'
        case ChainIds.Solana:
          return 'SOL'
        case ChainIds.Bsc:
          return 'BNB'
        case ChainIds.Mon:
          return 'MON'
        default:
          return 'USDC'
      }
    }

    switch (tokenAddress.toLowerCase()) {
      case SOL_ADDRESS.toLowerCase():
        return 'SOL'
      case ETH_ADDRESS.toLowerCase():
        return 'ETH'
      case ARB_ETH_ADDRESS.toLowerCase():
        return 'ETH'
      case NATIVE_ETH_ADDRESS.toLowerCase():
        if (+chainId === ChainIds.Bsc) return 'BNB'
        if (+chainId === ChainIds.Mon) return 'MON'
        return 'ETH'
      case USDC_ADDRESS_ARBITRUM.toLowerCase():
        return 'USDC'
      case '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'.toLowerCase():
        return 'USDC' // Fallback for USDC.e
      case USDC_HYPERLIQUID_ADDRESS.toLowerCase():
        return 'USDC'
      case POLYGON_USDC_ADDRESS.toLowerCase():
        return 'USDC'
      default:
        const tokenData = tokensState[tokenAddress] || fetchTokenData(tokenAddress)
        return tokenData?.symbol || '--'
    }
  }

  useEffect(() => {
    const isHyperPerps = chainId === ChainIds.HyperEVM || +chainId === ChainIds.Hyperliquid
    const isPrediction = chainId === ChainIds.Polygon
    const chainLogo =
      chainId === ChainIds.HyperEVM ? getBlockchainLogo2(ChainIds.Hyperliquid) : getBlockchainLogo2(+chainId)
    setChainLogoImage(chainLogo)
    const isEvmChain = [ChainIds.Ethereum, ChainIds.Arbitrum, ChainIds.Base].includes(+chainId)

    if (isHyperPerps) {
      setAccountType('assets.transfers.contractAccount')
    } else if (isPrediction) {
      setAccountType('assets.transfers.predictionAccount')
    } else {
      setAccountType('assets.transfers.memeAccount')
    }

    if (!tokenAddress) {
      if (isHyperPerps) {
        setTokenImage('/images/icons/chains/ic-usdc.svg')
        return
      }

      if (isEvmChain) {
        setTokenImage('/images/icons/chains/ic-ethereum.svg')
        return
      }

      if (+chainId === ChainIds.Bsc) {
        setTokenImage('/images/bnb.svg')
        return
      }
      if (+chainId === ChainIds.Mon) {
        setTokenImage('/images/icons/chains/ic-monad.svg')
        return
      }

      const tokenImage = getBlockChainLogo(ChainIds.Solana, SOL_ADDRESS)
      setTokenImage(tokenImage)
      return
    }

    if (tokenAddress === SOL_ADDRESS) {
      setTokenImage('/images/icons/chains/ic-solana2.png')
      return
    }

    if (tokenAddress === NATIVE_ETH_ADDRESS) {
      if (+chainId === ChainIds.Bsc) {
        setTokenImage('/images/bnb.svg')
        return
      }
      if (+chainId === ChainIds.Mon) {
        setTokenImage('/images/icons/chains/ic-monad.svg')
        return
      }
      setTokenImage('/images/icons/chains/ic-ethereum.svg')
      return
    }

    if (tokenAddress === ETH_ADDRESS && +chainId === ChainIds.Ethereum) {
      setTokenImage('/images/icons/chains/ic-ethereum.svg')
      return
    }

    if (tokenAddress === ARB_ETH_ADDRESS && +chainId === ChainIds.Arbitrum) {
      setTokenImage('/images/icons/chains/ic-ethereum.svg')
      return
    }

    if (tokenAddress.toLowerCase() === USDC_HYPERLIQUID_ADDRESS || +chainId === ChainIds.Hyperliquid) {
      setTokenImage('/images/icons/chains/ic-usdc.svg')
      return
    }

    if (tokenAddress.toLowerCase() === POLYGON_USDC_ADDRESS && +chainId === ChainIds.Polygon) {
      setTokenImage('/images/icons/chains/ic-usdc.svg')
      return
    }

    const chainNum = chainId === ChainIds.HyperEVM ? ChainIds.Arbitrum : +chainId

    const tokenImage = tokensState[tokenAddress]?.logo ?? getBlockChainLogo(chainNum, tokenAddress)
    setTokenImage(tokenImage)
  }, [tokenAddress, chainId])

  return (
    <div>
      <div
        className={cn(
          'bg-[#141414CC] rounded-[12px] py-[14px] px-[16px] border border-[#ECECED14]',
          isDesktop ? 'bg-[#2B2B33]' : '',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-[12px]">
          <Text
            text={isFrom ? t('assets.transfers.from') : t('assets.transfers.to')}
            color="#FFFFFFB2"
            fontSize={14}
            fontWeight="light"
          />
          <Text text={t(accountType)} color="#FFFFFFB2" fontSize={14} fontWeight="light" />
          {walletName && (
            <span className="bg-[#ECECED14] p-1 rounded-[4px] text-[11px] text-white/70 font-[330] leading-none">
              {walletName}
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="flex items-center gap-2">
          {/* Token Icon */}
          <LogoWithChain
            logo={tokenImage}
            name={getFundingRecordTokenUnit(tokenAddress, chainId)}
            chainContainerClassName="!bg-none"
            logoClassName="size-[40px]"
            chainLogo={chainLogoImage}
          />

          <div className="flex-1">
            <span className="!font-[380] text-[20px]">
              {isFrom ? '-' : '+'}
              {formatAmount(amount, {
                roundMode: 'floor',
                unit: getFundingRecordTokenUnit(tokenAddress, chainId),
              })}
            </span>

            <div className="flex gap-2 items-end">
              <Text
                text={formatAddressWallet(walletAddress, 5, 5)}
                fontSize={12}
                fontWeight="light"
                color="#FFFFFF80"
              />
              <CopyButton text={walletAddress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletCard
