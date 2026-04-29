import { PortfolioDto, PortfolioManyWalletDto, PortfolioManyWalletInput } from '@/@generated/gql/graphql-core'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { useRunOnceAfterLogin } from '@/hooks/useRunOnceLogined'
import { ServiceConfig } from '@/lib/gql/service-config'
import { formatBalanceWallet } from '@/lib/number.ts'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import {
  mappedTypeChain,
  mappedChainId,
  newWalletActions,
  mappedChainIdToTypeChain,
  _activeWallet,
} from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getListPortfoliosByTokens } from '@/services/tokens.service'
import { encryptPrivateKey } from '@/utils/agent/cryptoUtils'
import { useQuery } from '@apollo/client'
import SwitchChains from '@components/header/switch-chains.tsx'
import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { getWalletBalance } from '@services/assets.service.ts'
import { Keypair } from '@solana/web3.js'
import { decryptExportBundle, generateP256KeyPair } from '@turnkey/crypto'
import { useTurnkey } from '@turnkey/sdk-react'
import { memo, useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import AddNewWallet from './AddNewWallet'
import ItemWallet from './components/ItemWallet'
// import NewManageWalletBottomSheet from './NewManageWalletBottomSheet'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { useLocation } from 'react-router-dom'
import ls from '@/lib/local-storage'
import NewManageWallet from './NewManageWallet'
import clsx from 'clsx'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { EVM_CHAIN_TYPES } from '@/types/enums'
import { getAddress } from 'ethers'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  tab?: 'crypto' | 'meme'
  onChange?: () => void
}

const NewSwitchWalletBottomSheet = ({ open, setOpen, tab = 'meme', onChange }: Props) => {
  const { t } = useTranslation()
  // const [openManageWalletBottomSheet, setOpenManageWalletBottomSheet] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const activeWallet = useSelector(_activeWallet)
  const { indexedDbClient } = useTurnkey()
  const [isShowManage, setIsShowManage] = useState(false)
  const dispatch = useAppDispatch()
  const userInfo = useSelector(_userInfo)
  const { accountValue } = useWebData2()
  const { pathname } = useLocation()
  const isAssetsPage = pathname.includes('/assets')

  const listWalletsByActiveChain = useMemo(() => {
    if (listWalletsByChain) {
      if (isAssetsPage) {
        return listWalletsByChain?.filter(
          (item: UserEmbeddedWalletDto) => item.chain === mappedChainIdToTypeChain(ls.get('asset_chain_id')),
        )
      }
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain, activeChain])

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
  // const pv = useSelector(selectNewWalletPrivateKey)
  // pv.then((key) => {
  //   // console.log('private key decrypted: ', key)
  // })

  const exportPrivaKey = async (account: UserEmbeddedWalletDto) => {
    const isEvm = EVM_CHAIN_TYPES.includes(account.chain)
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

  const { data: dataListHolding } = useQuery(getListPortfoliosByTokens, {
    variables: {
      input: {
        userAddress: listWalletsByActiveChain.map((item: any) => item?.walletAddress),
        page: 1,
        limit: 5,
        isTopValue: true,
        chainId: activeWallet.chainId,
      } as PortfolioManyWalletInput,
    },
    skip: !ServiceConfig.token || listWalletsByActiveChain?.length === 0 || !open,
    pollInterval: open ? 60000 : 0,
  })

  const { data: dataWalletBalance } = useQuery(getWalletBalance, {
    variables: {
      input: {
        duration: 'w1',
        chainId: mappedChainId(activeChain),
      },
    },
    skip: !ServiceConfig.token || !open,
  })

  const listHoldingTokens = dataListHolding?.getPortfolioManyWallet?.data
  const walletBalanceByActiveChain = dataWalletBalance?.getWalletBalance || []
  const totalAssets = walletBalanceByActiveChain?.reduce(
    (total: number, item: { usdBalance?: string }) => total + +(item?.usdBalance ?? 0),
    0,
  )
  function mergeWalletsWithPortfolio(list1: UserEmbeddedWalletDto[], list2: PortfolioManyWalletDto[]): any[] {
    const addressMap = new Map<string, { portfolioData: PortfolioDto[]; totalHoldingTokens: number }>()

    for (const group of list2 || []) {
      const tokens = group.data || []
      const total = group.totalHoldingTokens || 0

      for (const portfolio of tokens) {
        const address = portfolio.userAddress
        if (!addressMap.has(address as string)) {
          addressMap.set(address as string, { portfolioData: [], totalHoldingTokens: total })
        }
        addressMap.get(address as string)!.portfolioData.push(portfolio)
      }
    }

    return list1.map((wallet) => {
      const match = addressMap.get(wallet.walletAddress)
      return {
        ...wallet,
        portfolioData: match?.portfolioData || [],
        totalHoldingTokens: match?.totalHoldingTokens || 0,
      }
    })
  }
  const listMerged = mergeWalletsWithPortfolio(listWalletsByActiveChain, listHoldingTokens)
  // 如果是合约钱包，余额直接显示可用余额
  const listMergedFutures = listMerged.map((item) => {
    if (tab === 'crypto') {
      return {
        ...item,
        balance: accountValue,
      }
    }
  })

  useEffect(() => {
    if (!open) {
      setIsShowManage(false)
    }
  }, [open])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full max-w-[768px] mx-auto bg-[#232329]">
        <DialogTitle></DialogTitle>
        <div className="relative overflow-hidden">
          <div
            className={clsx(
              'flex w-[200%] transition-transform duration-300 ease-in-out',
              isShowManage ? '-translate-x-1/2' : 'translate-x-0',
            )}
          >
            <div className={cn('w-1/2', isShowManage ? 'max-h-0' : '')}>
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
                      $
                      {formatBalanceWallet({
                        balance: tab === 'crypto' ? accountValue : totalAssets,
                        decimal: 2,
                        round: 'down',
                      })}
                    </div>
                  </div>
                  {activeChain !== TYPE_CHAIN.ARB && <SwitchChains />}
                </div>

                <div className="px-3 mt-5 flex flex-col gap-5 max-h-[275px] overflow-x-hidden overflow-y-auto">
                  {tab === 'crypto'
                    ? listMergedFutures?.map((item: any) => (
                        <ItemWallet key={item?.walletAddress} account={item} onChange={onChange} />
                      ))
                    : listMerged?.map((item: any) => (
                        <ItemWallet key={item?.walletAddress} account={item} onChange={onChange} />
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
  )
}

export default memo(NewSwitchWalletBottomSheet)
