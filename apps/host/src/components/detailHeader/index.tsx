import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Container from '@components/common/Container.tsx'
import { TokenDetail } from '@/@generated/gql/graphql-core'
import { ChainIds } from '@/types/enums'
import TokenSelectionDrawer from './TokenSelectionDrawer'
import { useMutation } from '@apollo/client'
import { addTokenToFavorite, removeTokenFromFavorite } from '@services/tokens.service.ts'
import useSignWallet from '@hooks/useSignWallet.ts'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import TradeSettingsBottomSheet from '../common/TradeSettingsBottomSheet'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

interface DetailHeaderProps {
  tokenData: TokenDetail
}

const DetailHeader = ({ tokenData }: DetailHeaderProps) => {
  const { t } = useTranslation()
  const tokenSymbol = tokenData?.symbol || '--'
  const chain = tokenData?.chainId ? ChainIds[Number(tokenData?.chainId)].slice(0, 3).toUpperCase() : '--'
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const activeChainType = useActiveChainType()

  useSignWallet({
    isAutoConnect: true,
  })
  useEffect(() => {
    setIsFavorite(tokenData?.isFavorite || false)
  }, [tokenData])

  const [addToFavoritesMutation] = useMutation(addTokenToFavorite, { client: futureClient })
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
  const { handleSignMessage } = useSignWallet({ isAutoConnect: false })

  const performAddFavorites = () => {
    setIsFavorite(true)
    addToFavoritesMutation({ variables: { token: tokenData.address, chain: activeChainType } })
      .then(() => {
        toast.success(t('toast.addFavoriteSuccess'))
      })
      .catch((e) => {
        setIsFavorite(false)
        if (e[0]?.code === 'Following_LimitExceeded') {
          toast.warning(t('toast.addFavoriteFailed2'))
        } else {
          toast.warning(t('toast.addFavoriteFailed'))
        }
      })
  }

  const performRemoveFavorites = () => {
    setIsFavorite(false)
    removeFromFavoritesMutation({ variables: { token: tokenData.address, chain: activeChainType } })
      .then(() => {
        toast.success(t('toast.removeFavoriteSuccess'))
      })
      .catch(() => {
        setIsFavorite(true)
        toast.warning(t('toast.removeFavoriteFailed'))
      })
  }

  const addToFavorites = () => {
    if (!ServiceConfig.token) {
      handleSignMessage().then(() => {
        setTimeout(() => {
          if (ServiceConfig.token) {
            // sign successfully, perform add/remove action
            performAddFavorites()
          } else {
            toast.warning(t('appSettings.loginRequired'))
          }
        }, 500)
      })
      return
    }
    performAddFavorites()
  }

  const removeFromFavorites = () => {
    if (!ServiceConfig.token) {
      handleSignMessage().then(() => {
        setTimeout(() => {
          if (ServiceConfig.token) {
            // sign successfully, perform add/remove action
            performRemoveFavorites()
          } else {
            toast.warning(t('appSettings.loginRequired'))
          }
        }, 500)
      })
      return
    }
    performRemoveFavorites()
  }
  return (
    <header>
      <Container className="flex items-center gap-[15px] pb-[6px] pt-[10px]">
        <div className="flex items-center gap-[4px] mr-auto cursor-pointer" onClick={() => setIsTokenDrawerOpen(true)}>
          <div className="flex items-center gap-[4px] mr-auto">
            <div className="app-font-medium text-[calc(1rem*(18/16))] text-white leading-[1]">{tokenSymbol}</div>
            <div className="text-[calc(1rem*(13/16))] text-[#FFFFFF7A] leading-[1]">/ {chain}</div>
            <img src="/images/detailHeader/icon-arrow-down.svg" className="w-[5.83px] min-w-[5.83px]" alt="" />
          </div>
        </div>
        <div className="flex items-center gap-[12px]">
          <img
            onClick={isFavorite ? removeFromFavorites : addToFavorites}
            className="cursor-pointer transition-all duration-100 hover:scale-[1.1]"
            src={isFavorite ? '/images/icons/vector-star-icon-active.svg?v=2' : '/images/icons/star-icon.svg'}
            alt="start-icon"
          />
          <TradeSettingsBottomSheet open={openTradeSettings} setOpen={setOpenTradeSettings} type={2} />
        </div>
      </Container>
      <TokenSelectionDrawer open={isTokenDrawerOpen} setOpen={setIsTokenDrawerOpen} currentToken={tokenData} />
    </header>
  )
}

export default DetailHeader
