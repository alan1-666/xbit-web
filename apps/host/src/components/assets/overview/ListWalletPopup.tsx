import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import BottomSheet from '@/components/common/BottomSheet'
import { formatAddressWallet } from '@/lib/string'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const ListWalletPopup = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const solWallets = listWalletsByChain.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === 'SOLANA')
  const predictionWallet = useProxyWallet()
  const isPredictionEnabled = useFeatureIsOn('enable_prediction')

  const wallets = useMemo(() => {
    const allWallets = [
      {
        label: t('assets.futures.futures'),
        chainId: ChainIds.Hyperliquid,
        icon: '/images/icons/chains/ic-hyperliquid.png',
        address: EVMAddress,
      },
      {
        label: t('assets.funding.title'),
        chainId: ChainIds.Solana,
        icon: '/images/icons/sol-rounded-icon.svg',
        children: solWallets,
      },
      {
        label: 'BNB Chain Meme',
        chainId: ChainIds.Bsc,
        icon: '/images/bsc.svg',
        address: EVMAddress,
      },
      {
        label: 'Monad Meme',
        chainId: ChainIds.Mon,
        icon: '/images/icons/chains/ic-monad.svg',
        address: EVMAddress,
      },
    ]

    if (isPredictionEnabled) {
      allWallets.push({
        label: 'Prediction',
        chainId: ChainIds.Polygon,
        icon: getBlockchainLogo2(ChainIds.Polygon),
        address: predictionWallet?.toLowerCase(),
      })
    }

    return allWallets
  }, [solWallets, t, predictionWallet, isPredictionEnabled, EVMAddress])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('assets.address')} hiddenBgImg>
      <div className="space-y-2 max-h-[80vh] overflow-auto no-scrollbar">
        {wallets.map((wallet) => (
          <div key={wallet.chainId} className="p-3.5 bg-[#2B2B33] border-[0.5px] border-[#444455] rounded-[10px]">
            {wallet.chainId === ChainIds.Solana ? (
              <div>
                <div className="font-semibold text-[16px] leading-4">{wallet.label}</div>
                <div className="mt-2 bg-[#212127] p-3 rounded-xl transition-all duration-300 ease-in-out max-h-55 overflow-y-auto no-scrollbar">
                  {wallet.children?.map((child: UserEmbeddedWalletDto) => (
                    <div
                      key={child.walletAddress}
                      className="flex items-center justify-between cursor-pointer mt-2 first:mt-0 pt-2 first:pt-0 border-t border-[#2E2E2E] first:border-0"
                    >
                      <div>
                        <div className="font-semibold text-[12px] leading-3">{child.name}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[12px] leading-5.5 text-[#908E98]">
                            {formatAddressWallet(child.walletAddress || '')}
                          </span>
                          <img className="size-4 rounded-full overflow-hidden" src={wallet.icon} alt="" />
                        </div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center bg-[#212127] rounded-full">
                        <CopyButton text={child.walletAddress || ''} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[16px] leading-4">{wallet.label}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[12px] leading-5.5 text-[#908E98]">
                      {formatAddressWallet(wallet.address)}
                    </span>
                    <img className="size-4 rounded-full overflow-hidden" src={wallet.icon} alt="" />
                  </div>
                </div>
                <div className="w-6 h-6 flex items-center justify-center bg-[#212127] rounded-full">
                  <CopyButton text={wallet.address || ''} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

export default ListWalletPopup
