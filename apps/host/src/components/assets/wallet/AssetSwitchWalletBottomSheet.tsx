import { PortfolioManyWalletInput } from '@/@generated/gql/graphql-core'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import NewManageWallet from '@/components/auth/ManagementWallets/NewManageWallet'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { useRunOnceAfterLogin } from '@/hooks/useRunOnceLogined'
import { formatBalance } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getListPortfoliosByTokens } from '@/services/tokens.service'
import { ChainIds, EVM_CHAIN_TYPES } from '@/types/enums.ts'
import { encryptPrivateKey } from '@/utils/agent/cryptoUtils'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { AssetItemWallet } from '@components/assets/wallet/AssetItemWallet.tsx'
import AssetSwitchChains from '@components/assets/wallet/AssetSwitchChains.tsx'
import AddNewWallet from '@components/auth/ManagementWallets/AddNewWallet.tsx'
import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { getWalletBalance } from '@services/assets.service.ts'
import { Keypair } from '@solana/web3.js'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { decryptExportBundle, generateP256KeyPair } from '@turnkey/crypto'
import { useTurnkey } from '@turnkey/sdk-react'
import clsx from 'clsx'
import { getAddress } from 'ethers'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  tab?: 'crypto' | 'meme'
  onChange?: () => void
}

const getChainIdFromChainType = (chain: ChainType | undefined) => {
  switch (chain) {
    case ChainType.Solana:
      return ChainIds.Solana
    case ChainType.Evm:
      return ChainIds.Ethereum
    case ChainType.Arb:
      return ChainIds.Arbitrum
    case ChainType.Tron:
      return ChainIds.TRX
    default:
      return ChainIds.Solana
  }
}

const AssetSwitchWalletBottomSheet = ({ open, setOpen, tab = 'meme', onChange }: Props) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const { selectedWallet } = useContext(AssetOverviewContext)
  const [isShowManage, setIsShowManage] = useState(false)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const { indexedDbClient } = useTurnkey()
  const dispatch = useAppDispatch()
  const userInfo = useSelector(_userInfo)
  const { accountValue } = useWebData2()

  const listWalletsByActiveChain = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === selectedWallet?.chain)
    }
    return []
  }, [listWalletsByChain, selectedWallet])

  const listWalletsBySol = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === ChainType.Solana)
    }
    return []
  }, [listWalletsByChain])

  useRunOnceAfterLogin({
    isLoggedIn: listWalletsBySol?.length > 0 && !!indexedDbClient,
    callback: () => {
      listWalletsBySol.forEach((item: UserEmbeddedWalletDto) => {
        exportPrivaKey(item)
      })
    },
  })
  const token = useSelector(_userInfo)?.refresh_token

  const exportPrivaKey = async (account: UserEmbeddedWalletDto) => {
    const isEvm = EVM_CHAIN_TYPES.includes(account?.chain)
    const keypair = generateP256KeyPair()
    const activity = await indexedDbClient?.exportWalletAccount({
      address: isEvm ? getAddress(account?.walletAddress) : account?.walletAddress,
      targetPublicKey: keypair.publicKeyUncompressed,
    })
    if (activity) {
      dispatch(
        newWalletActions.approveExportPrivateKeyWithoutVerify({
          input: {
            activityId: activity?.activity?.id as string,
            publicKey: keypair?.publicKeyUncompressed,
          },
        }),
      ).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const privateKeyRes = res?.payload?.approveExportPrivateKeyWithoutVerify?.privateKey
          decryptExportBundle({
            exportBundle: privateKeyRes,
            embeddedKey: keypair?.privateKey,
            organizationId: userInfo?.subOrgId,
            returnMnemonic: false,
          }).then(async (key) => {
            if (key) {
              const seed = Uint8Array.from(Buffer.from(key, 'hex'))
              const keypair = Keypair.fromSeed(seed)
              const privateKey = bs58.encode(keypair.secretKey)

              const { iv, cipher } = await encryptPrivateKey(privateKey, account?.walletAddress + token)
              dispatch(
                newWalletActions.updateBundle({
                  key: account?.walletAddress,
                  iv: Buffer.from(iv).toString('base64'),
                  privateKeyEncrypted: Buffer.from(cipher).toString('base64'),
                }),
              )
            }
          })
        }
      })
    }
  }

  const { data: portfolioWallets } = useReactQuery({
    queryKey: ['portfolioManyWallet', listWalletsByActiveChain.map((item: any) => item?.walletAddress)],
    enabled: open && !!ServiceConfig.token && listWalletsByActiveChain?.length > 0,
    refetchInterval: 60000, // 1 minute
    queryFn: async () => {
      const walletAddresses = listWalletsByActiveChain.map((item: any) => item?.walletAddress)
      const res = await gqlClient.query({
        query: getListPortfoliosByTokens,
        variables: {
          input: {
            userAddress: listWalletsByActiveChain.map((item: any) => item?.walletAddress),
            page: 1,
            limit: 5,
            isTopValue: true,
          } as PortfolioManyWalletInput,
        },
      })
      const portfolioByWallets = res.data.getPortfolioManyWallet?.data || []
      const map: Record<string, { portfolioData: any[]; totalHoldingTokens: number }> = {}
      walletAddresses.forEach((item: string, index: number) => {
        const portfolioData = portfolioByWallets[index]?.data || []
        const totalHoldingTokens = portfolioByWallets[index]?.totalHoldingTokens || 0
        map[item] = {
          portfolioData: portfolioData,
          totalHoldingTokens: totalHoldingTokens,
        }
      })
      return map
    },
  })

  // const { data: dataWalletBalance } = useQuery(getWalletBalance, {
  //   variables: {
  //     input: {
  //       duration: 'w1',
  //       chainId: getChainIdFromChainType(selectedWallet?.chain),
  //     },
  //   },
  //   skip: !ServiceConfig.token || !open,
  // })
  const { data: dataWalletBalance } = useReactQuery({
    queryKey: ['walletBalance', getChainIdFromChainType(selectedWallet?.chain)],
    enabled: open && !!ServiceConfig.token,
    refetchInterval: 60000, // 1 minute
    queryFn: async () => {
      const res = await gqlClient.query({
        query: getWalletBalance,
        variables: {
          input: {
            duration: 'w1',
            chainId: getChainIdFromChainType(selectedWallet?.chain),
          },
        },
        fetchPolicy: 'no-cache',
      })
      return res.data
    },
  })

  // const listHoldingTokens = dataListHolding?.getPortfolioManyWallet?.data
  const walletBalanceByActiveChain = dataWalletBalance?.getWalletBalance || []
  const totalAssets = walletBalanceByActiveChain?.reduce(
    (total: number, item: { usdBalance?: string }) => total + +(item?.usdBalance ?? 0),
    0,
  )

  useEffect(() => {
    if (!open) {
      setIsShowManage(false)
    }
  }, [open])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showDialogPrimitiveClose={false} className="w-full max-w-[768px] mx-auto bg-[#232329] px-0">
          <div className="relative overflow-hidden">
            <div
              className={clsx(
                'flex w-[200%] transition-transform duration-300 ease-in-out',
                isShowManage ? '-translate-x-1/2' : 'translate-x-0',
              )}
            >
              <div className="w-1/2">
                <DialogHeader className="px-3 grid grid-cols-[70px_1fr_70px] items-center pb-4">
                  <img
                    src="/images/icons/arrow-left.svg"
                    className="w-6 h-6 cursor-pointer"
                    alt="arrow-left"
                    onClick={() => setOpen(false)}
                  />
                  <div className="font-normal text-white text-[18px] text-center leading-none">
                    {t('wallet.switchWallet')}
                  </div>
                  <div
                    className="font-normal text-white text-[18px] leading-none text-right cursor-pointer"
                    onClick={() => setIsShowManage(true)}
                  >
                    {t('wallet.manage')}
                  </div>
                </DialogHeader>

                <div className="pb-3 flex flex-col">
                  <div className="flex items-center justify-between px-3">
                    <div>
                      <div className="font-normal text-white text-[15px] leading-[16px]">{t('wallet.totalAssets')}</div>
                      <div>
                        {formatBalance(tab === 'crypto' ? accountValue : totalAssets, {
                          roundMode: 'floor',
                          showCurrency: true,
                        })}
                      </div>
                    </div>
                    {tab !== 'crypto' && <AssetSwitchChains />}
                  </div>
                  <div className="px-3 mt-5 flex flex-col gap-5 max-h-[275px] overflow-x-hidden overflow-y-auto">
                    {listWalletsByActiveChain?.map((wallet: UserEmbeddedWalletDto) => (
                      <AssetItemWallet
                        key={wallet?.id}
                        wallet={wallet}
                        onSelected={onChange}
                        portfolioData={portfolioWallets?.[wallet?.walletAddress]?.portfolioData || []}
                        totalHoldingTokens={portfolioWallets?.[wallet?.walletAddress]?.totalHoldingTokens || 0}
                      />
                    ))}
                  </div>

                  <div className="mt-5">
                    <AddNewWallet />
                  </div>
                </div>
              </div>

              {isShowManage && (
                <div className="w-1/2">
                  <NewManageWallet open={isShowManage} setIsShowManage={setIsShowManage} />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-full max-w-[768px] mx-auto bg-[#232329]">
          <div className="relative overflow-hidden">
            <div
              className={clsx(
                'flex w-[200%] transition-transform duration-300 ease-in-out',
                isShowManage ? '-translate-x-1/2' : 'translate-x-0',
              )}
            >
              <div className={cn("w-1/2", isShowManage ? 'max-h-0' : '')}>
                <DrawerHeader className="px-3 grid grid-cols-[70px_1fr_70px] items-center">
                  <img
                    src="/images/icons/arrow-left.svg"
                    className="w-6 h-6 cursor-pointer"
                    alt="arrow-left"
                    onClick={() => setOpen(false)}
                  />
                  <div className="font-normal text-white text-[18px] text-center leading-none">
                    {t('wallet.switchWallet')}
                  </div>
                  <div
                    className="font-normal text-white text-[18px] leading-none text-right cursor-pointer"
                    onClick={() => setIsShowManage(true)}
                  >
                    {t('wallet.manage')}
                  </div>
                </DrawerHeader>

                <div className="pb-3 flex flex-col">
                  <div className="flex items-center justify-between px-3">
                    <div>
                      <div className="font-normal text-white text-[15px] leading-[16px]">{t('wallet.totalAssets')}</div>
                      <div>
                        {formatBalance(tab === 'crypto' ? accountValue : totalAssets, {
                          roundMode: 'floor',
                          showCurrency: true,
                        })}
                      </div>
                    </div>
                    {tab !== 'crypto' && <AssetSwitchChains />}
                  </div>
                  <div className="px-3 mt-5 flex flex-col gap-5 max-h-[275px] overflow-x-hidden overflow-y-auto">
                    {listWalletsByActiveChain?.map((wallet: UserEmbeddedWalletDto) => (
                      <AssetItemWallet
                        key={wallet?.id}
                        wallet={wallet}
                        onSelected={onChange}
                        portfolioData={portfolioWallets?.[wallet?.walletAddress]?.portfolioData || []}
                        totalHoldingTokens={portfolioWallets?.[wallet?.walletAddress]?.totalHoldingTokens || 0}
                      />
                    ))}
                  </div>

                  <div className="mt-5">
                    <AddNewWallet />
                  </div>
                </div>
              </div>

              {isShowManage && (
                <div className="w-1/2">
                  <NewManageWallet open={isShowManage} setIsShowManage={setIsShowManage} />
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      {/* {!isExportedWallet && <MnemonicPrompt />} */}
    </>
  )
}

export default AssetSwitchWalletBottomSheet
