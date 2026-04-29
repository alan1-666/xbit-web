import { useContext, useMemo, useState } from 'react'
import { LIST_CHAIN_SUPPORTED, SupportedChain, TYPE_CHAIN } from '@/lib/blockchain'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { Button } from '@components/ui/button.tsx'
import { CheckboxWallet } from '@components/icon'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'

const AssetSwitchChains = ({ iconRight = '/images/icons/arrow-right.svg' }: { iconRight?: string }) => {
  const [open, setOpen] = useState(false)

  const { selectedChainId, setSelectedWallet } = useContext(AssetOverviewContext)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])

  const handleSelectItem = (item: SupportedChain) => {
    const chainId = item.chain_id
    setOpen(false)

    if (chainId === ChainIds.Ethereum) {
      const ethWallets = listWalletsByChain?.filter((wallet) => wallet.chain === ChainType.Evm)
      if (ethWallets.length > 0) {
        setSelectedWallet?.(ethWallets[0])
      }
    } else if (chainId === ChainIds.Bsc) {
      const bscWallets = listWalletsByChain?.filter((wallet) => wallet.chain === ChainType.Bsc)
      if (bscWallets.length > 0) {
        setSelectedWallet?.(bscWallets[0])
      }
    } else if (chainId === ChainIds.Arbitrum) {
      const arbWallets = listWalletsByChain?.filter((wallet) => wallet.chain === ChainType.Arb)
      if (arbWallets.length > 0) {
        setSelectedWallet?.(arbWallets[0])
      }
    } else if (chainId === ChainIds.Solana) {
      const solWallets = listWalletsByChain?.filter((wallet) => wallet.chain === ChainType.Solana)
      if (solWallets.length > 0) {
        setSelectedWallet?.(solWallets[0])
      }
    }
  }

  const chainIcon = useMemo(() => {
    switch (selectedChainId) {
      case ChainIds.Solana:
        return '/images/icons/icon-sol.svg'
      case ChainIds.Ethereum:
        return '/images/ether.svg'
      case ChainIds.Arbitrum:
        return '/images/icons/chains/ic-arbitrum.svg'
      case ChainIds.Bsc:
        return '/images/bsc.svg'
      default:
        return '/images/icons/icon-sol.svg'
    }
  }, [selectedChainId])

  const chainLabel = useMemo(() => {
    switch (selectedChainId) {
      case ChainIds.Solana:
        return 'Solana'
      case ChainIds.Ethereum:
        return 'Ethereum'
      case ChainIds.Arbitrum:
        return 'Arbitrum'
      case ChainIds.Bsc:
        return 'BNB Chain'
      default:
        return 'Solana'
    }
  }, [selectedChainId])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 py-1 bg-[#ECECED14] rounded-[50px] gap-1 h-[26px] focus-visible:shadow-[none]"
        >
          <img src={chainIcon} alt="" className="w-3 h-3" />
          <span className="block text-[14px] text-[#ffffff] leading-[12px] tracking-[0px] font-normal">
            {chainLabel}
          </span>
          <img src={iconRight} alt="" className="w-4 h-4 -ml-1" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle></DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3 pb-8">
          {LIST_CHAIN_SUPPORTED.map((item, index) => (
            <div key={index} onClick={() => handleSelectItem(item)} className="cursor-pointer hover:bg-[#26282C]">
              <div className="flex items-center gap-3 py-3.5 border-b-[#ececed14] border-b-[0.5px] w-full">
                <img
                  src={item.value === TYPE_CHAIN.SOLANA ? '/images/icons/ic-solana.svg' : item.img}
                  className="w-8 h-8"
                  alt=""
                ></img>
                <p className="text-base font-medium leading-none">{item.label}</p>
                {selectedChainId === item.chain_id && (
                  <div className="ml-auto">
                    <CheckboxWallet />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AssetSwitchChains
