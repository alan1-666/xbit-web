import { PortfolioManyWalletInput } from '@/@generated/gql/graphql-core'
import { UpdateWalletOrderInputDto, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { ChainType } from '@/@generated/gql/graphql-user.ts'
import ExportPrivateKey from '@/components/auth/ManagementWallets/ExportPrivateKey'
import { CopyButton } from '@/components/common/copy-button'
import InputBorderGradient from '@/components/orderForm/InputBorderGradient'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatBalance } from '@/lib/format'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { formatAddressWallet } from '@/lib/string'
import { extractLatestWalletPath } from '@/lib/utils'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { mappedTypeChain, newWalletActions, updateWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { approveCreateWalletMutation, updateEmbeddedWalletNameMutation } from '@/services/auth.service'
import { getListPortfoliosByTokens } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums.ts'
import { getLinkExplorer2 } from '@/utils/helpers'
import { useQuery } from '@apollo/client'
import {
  IconArrange,
  IconBscScan,
  IconCheckbox,
  IconCheckboxChecked,
  IconEdit2,
  IconSolScan,
  IconMonScan,
} from '@components/icon'
import { Button } from '@components/ui/button.tsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { defaultSolanaAccountAtIndex } from '@turnkey/sdk-browser'
import { useTurnkey } from '@turnkey/sdk-react'
import { useEffect, useRef, useState } from 'react'
import 'react-grid-layout/css/styles.css'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import 'react-resizable/css/styles.css'
import { toast } from 'sonner'

const mapChainTypeToChainId = (chain: ChainType): ChainIds => {
  switch (chain) {
    case ChainType.Solana:
      return ChainIds.Solana
    case ChainType.Evm:
      return ChainIds.Ethereum
    case ChainType.Arb:
      return ChainIds.Arbitrum
    case ChainType.Bsc:
      return ChainIds.Bsc
    case ChainType.Mon:
      return ChainIds.Mon
    default:
      return ChainIds.Solana
  }
}

type Props = {
  walletsByChain: UserEmbeddedWalletDto[]
  walletSelected: string
  setWalletSelected: (walletId: string) => void
  chain: string
}

const WalletManangement = ({ walletsByChain, walletSelected, setWalletSelected, chain }: Props) => {
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const dispatch = useAppDispatch()

  const subOrgId = useSelector(_userInfo)?.subOrgId

  const { data: portfolioManyWallet } = useQuery(getListPortfoliosByTokens, {
    variables: {
      input: {
        chainId: mapChainTypeToChainId(walletsByChain[0]?.chain),
        userAddress: walletsByChain.map((item: UserEmbeddedWalletDto) => item?.walletAddress),
        page: 1,
        limit: 20,
        isTopValue: true,
      } as PortfolioManyWalletInput,
    },
    skip: !ServiceConfig.token || walletsByChain?.length === 0,
    pollInterval: 60000,
  })

  const listHolding = portfolioManyWallet?.getPortfolioManyWallet?.data

  const getChainLogo = (chain: string) => {
    switch (chain) {
      case 'SOLANA':
        return '/images/solana.webp'
      case 'EVM':
      case 'ARB':
        return '/images/ether.svg'
      case 'BSC':
        return '/images/bnb.svg'
      case 'MON':
        return '/images/icons/chains/ic-monad.svg'
      default:
        return ''
    }
  }
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const [openDialog, setOpenDialog] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedWalletId, setDraggedWalletId] = useState<string | null>(null)
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null)
  const [editWalletName, setEditWalletName] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const handleCreateWallet = async () => {
    try {
      setLoading(true)
      const firstItem = listWalletsByChain[0]
      const walletId = firstItem?.wallet ? firstItem.wallet.walletId : firstItem?.walletId

      const solanaWallets = listWalletsByChain.filter((item: any) => {
        return item.chain === ChainType.Solana
      })

      const isExist = solanaWallets.some((item: any) => {
        return item.name.trim() === name.trim()
      })

      if (isExist) {
        toast.error(t('wallet.statusErrors.WALLET_NAME_ALREADY_EXISTS'))
        return
      }

      const latestSubPath = extractLatestWalletPath(solanaWallets.map((w: UserEmbeddedWalletDto) => w.hdPath || ''))

      const activity = await indexedDbClient?.createWalletAccounts({
        organizationId: subOrgId,
        walletId,
        accounts: [defaultSolanaAccountAtIndex(latestSubPath + 1)],
      })

      const response = await userGqlClient.mutate({
        mutation: approveCreateWalletMutation,
        variables: {
          input: {
            activityId: activity?.activity?.id,
            name: name,
          },
        },
      })

      const newWallet = response.data.approveCreateWallet?.wallet

      const walletWithBalance = {
        ...newWallet,
        balance: 0,
      }

      dispatch(
        updateWallet({
          listWalletsByChain: [...listWalletsByChain, walletWithBalance],
        }),
      )

      toast.success(t('wallet.createWalletSuccessfully'))
      setOpenDialog(false)
      setName('')
    } catch (error: any) {
      console.error('Error creating wallet:', error)
      const errorCode = error?.[0]?.code

      if (errorCode) {
        toast.error(t(`wallet.statusErrors.${errorCode}`))
      } else {
        toast.error(t('wallet.createWalletFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const preventSpecialChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
    const currentLength = e.currentTarget.value.length

    if (allowedKeys.includes(e.key)) return

    if (currentLength >= 50) {
      e.preventDefault()
      return
    }

    const isValid = /^[a-zA-Z0-9 ]$/.test(e.key)
    if (!isValid) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (openDialog) {
      setName('')
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [openDialog])

  const handleDragStart = (e: React.DragEvent, walletId: string) => {
    setIsDragging(true)
    setDraggedWalletId(walletId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', walletId)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedWalletId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetWalletId: string) => {
    e.preventDefault()
    const sourceWalletId = e.dataTransfer.getData('text/plain')

    if (sourceWalletId === targetWalletId) {
      return
    }

    // Find the indices of source and target wallets
    const sourceIndex = walletsByChain.findIndex((wallet) => wallet.id === sourceWalletId)
    const targetIndex = walletsByChain.findIndex((wallet) => wallet.id === targetWalletId)

    if (sourceIndex === -1 || targetIndex === -1) {
      return
    }

    // Reorder wallets
    const reorderedWallets = [...walletsByChain]
    const [movedWallet] = reorderedWallets.splice(sourceIndex, 1)
    reorderedWallets.splice(targetIndex, 0, movedWallet)

    const otherWallets = listWalletsByChain.filter(
      (wallet: UserEmbeddedWalletDto) => wallet.chain !== movedWallet.chain,
    )
    const finalWalletsOrder = [...otherWallets, ...reorderedWallets]

    // Update the wallet order in Redux store
    const wallets = finalWalletsOrder
      .filter((item: any) => item.chain === mappedTypeChain(TYPE_CHAIN.SOLANA))
      .map((item: any, index: number) => {
        return {
          id: item?.id,
          displayOrder: index,
          type: 'EMBEDDED',
        }
      })

    dispatch(
      newWalletActions.updateWalletOrder({
        input: {
          wallets: wallets,
        } as UpdateWalletOrderInputDto,
      }),
    ).then((res: any) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        toast.success(t('toast.saveSuccess'))
        dispatch(
          updateWallet({
            listWalletsByChain: finalWalletsOrder,
          }),
        )
      } else {
        toast.error(t('toast.saveFailed'))
      }
    })

    setIsDragging(false)
    setDraggedWalletId(null)
  }

  const handleEditWallet = (wallet: UserEmbeddedWalletDto) => {
    setEditingWalletId(wallet.id)
    setEditWalletName(wallet.name)
    // Focus the input after state update
    setTimeout(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }, 50)
  }

  const handleCancelEdit = () => {
    setEditingWalletId(null)
    setEditWalletName('')
  }

  const handleSaveWalletName = async (walletId: string) => {
    if (!editWalletName.trim()) {
      handleCancelEdit()
      return
    }

    // Check if name already exists
    const isExist = walletsByChain.some((item: UserEmbeddedWalletDto) => {
      return item.name.trim() === editWalletName.trim() && item.id !== walletId
    })

    if (isExist) {
      toast.error(t('wallet.statusErrors.WALLET_NAME_ALREADY_EXISTS'))
      return
    }

    try {
      setEditLoading(true)

      const response = await userGqlClient.mutate({
        mutation: updateEmbeddedWalletNameMutation,
        variables: {
          input: {
            id: walletId,
            name: editWalletName.trim(),
          },
        },
      })

      const updatedWallet = response.data.updateEmbeddedWalletName

      // Update the wallet in the Redux store
      const updatedWallets = listWalletsByChain.map((wallet: UserEmbeddedWalletDto) =>
        wallet.id === walletId ? { ...wallet, name: updatedWallet.name } : wallet,
      )

      dispatch(
        updateWallet({
          listWalletsByChain: updatedWallets,
        }),
      )

      toast.success(t('toast.saveSuccess'))
      handleCancelEdit()
    } catch (error: any) {
      toast.error(t('toast.saveFailed'))
    } finally {
      setEditLoading(false)
    }
  }

  const explorerIcon = (chainId: ChainIds) => {
    switch (chainId) {
      case ChainIds.Solana:
        return <IconSolScan className="size-4" />
      case ChainIds.Bsc:
        return <IconBscScan className="size-4" />
      case ChainIds.Mon:
        return <IconMonScan className="size-3" />
      default:
        return <IconSolScan className="size-4" />
    }
  }

  return (
    <div className="space-y-3">
      <div className="h-[28px] flex items-center justify-between">
        <div>
          {t('assets.wallet.manageWallet')} ({walletsByChain?.length || 0})
        </div>
        <div className="flex items-center gap-4">
          {chain === 'solana' && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <div
                  className="bg-[#FBFBFB] px-2.5 py-[7.5px] rounded-md font-[330] text-[13px] text-[#000000] leading-none cursor-pointer"
                  onClick={() => setOpenDialog(true)}
                >
                  {t('assets.wallet.createWallet')}
                </div>
              </DialogTrigger>
              <DialogContent className="bg-[#232329] border-none max-w-[400px]">
                <DialogHeader className="border-b border-[#ECECED0A] pb-3">
                  <DialogTitle>{t('wallet.addWallet.title')}</DialogTitle>
                </DialogHeader>
                <div className="">
                  <InputBorderGradient
                    unit={''}
                    value={name}
                    onChange={(value) => {
                      if (value.length <= 15) {
                        setName(value)
                      }
                    }}
                    placeHolder={t('wallet.enterWalletName')}
                    inputProps={{
                      onKeyDown: (e) => preventSpecialChars(e),
                      ref: inputRef,
                      maxLength: 15,
                    }}
                  />
                </div>
                <DialogFooter className="border-[#ECECED14] flex items-center !justify-between">
                  <Button
                    className="rounded-full w-full font-normal text-[#FFFFFF]"
                    variant="gradient"
                    onClick={handleCreateWallet}
                    disabled={loading || !name.trim()}
                    isLoading={loading}
                  >
                    <div className="flex items-center text-[16px] leading-none font-medium">{t('wallet.create')}</div>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <div className="bg-[#18181B] border border-[#212127] rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2.5 border-b border-[#212127] font-[380] text-[13px] text-[#6C6A74] leading-none">
          <div className="col-span-2 flex">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => {
                walletsByChain.length === 1 ? setWalletSelected(walletsByChain[0]?.id) : setWalletSelected('all')
              }}
            >
              <span>
                {walletSelected === 'all' || walletsByChain.length === 1 ? (
                  <IconCheckboxChecked className="size-4 text-[#843BEA]" />
                ) : (
                  <IconCheckbox className="size-4 text-[#843BEA]" />
                )}
              </span>
              <span>{t('assets.wallet.title')}</span>
            </div>
          </div>
          <div className="col-span-1">{t('assets.wallet.balance')}</div>
          <div className="col-span-1">{t('assets.wallet.holdingsAssets')}</div>
          <div className="col-span-1"></div>
        </div>
        <div className="h-[190px] overflow-auto">
          {walletsByChain.map((wallet: UserEmbeddedWalletDto, index: number) => (
            <div
              key={wallet.id}
              className={`grid grid-cols-5 px-4 py-[14px] cursor-pointer hover:bg-[#1F1E25] transition-colors ${
                isDragging && draggedWalletId === wallet.id ? 'opacity-50' : ''
              }`}
              onClick={() => setWalletSelected(wallet?.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, wallet.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, wallet.id)}
            >
              <div className="col-span-2 flex items-center gap-2">
                <div className="col-span-2 flex items-center gap-4">
                  <span className="cursor-pointer" onClick={() => setWalletSelected(wallet?.id)}>
                    {walletSelected === 'all' || walletSelected === wallet?.id ? (
                      <IconCheckboxChecked className="size-4 text-[#843BEA]" />
                    ) : (
                      <IconCheckbox className="size-4 text-[#843BEA]" />
                    )}
                  </span>
                  <div className="font-[330] text-[13px] text-[#FBFBFB] leading-none">
                    {editingWalletId === wallet.id ? (
                      <input
                        ref={editInputRef}
                        value={editWalletName}
                        onChange={(e) => {
                          if (e.target.value.length <= 15) {
                            setEditWalletName(e.target.value)
                          }
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          preventSpecialChars(e)
                          if (e.key === 'Enter') {
                            handleSaveWalletName(wallet.id)
                          }
                          if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#2B2B33] border border-[#79778C] rounded px-2 py-1 text-[13px] text-[#FBFBFB] w-full max-w-[120px] focus:outline-none focus:border-[#843BEA]"
                        maxLength={15}
                        disabled={editLoading}
                      />
                    ) : (
                      wallet.name
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="font-[330] text-[#79778C] text-[12px] leading-none">
                    {formatAddressWallet(wallet?.walletAddress)}
                  </div>
                  <CopyButton text={wallet?.walletAddress} className="h-[14px] w-[14px]" />
                </div>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="rounded-full border border-[#212127] px-2.5 py-2 font-[450] text-[13px] text-[#FBFBFB] leading-none flex items-center gap-1">
                  <img src={getChainLogo(wallet?.chain)} alt="chain-logo" className="w-4 h-4 rounded-full" />
                  {formatBalance(wallet?.balance, { roundMode: 'floor' })}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="rounded-full border border-[#212127] px-2.5 py-2 font-[330] text-[12px] text-[#79778C] leading-none">
                  {t('assets.wallet.tokens')}{' '}
                  <span className="text-[#FBFBFB]">{listHolding?.[index]?.totalHoldingTokens}</span>
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-4">
                {editingWalletId === wallet.id ? (
                  <div className="flex items-center gap-4">
                    <button
                      className="size-4 text-green-400 leading-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveWalletName(wallet.id)
                      }}
                      disabled={editLoading}
                    >
                      ✓
                    </button>
                    <button
                      className="size-4 text-red-400 leading-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelEdit()
                      }}
                      disabled={editLoading}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="size-4 text-[#79778C] hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditWallet(wallet)
                          }}
                        >
                          <IconEdit2 className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-1.5 text-[#908E98]">
                        {t('wallet.editWalletName')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <ExportPrivateKey wallet={wallet} type="icon" />
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="size-4 text-[#79778C] hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          const link = getLinkExplorer2(mapChainTypeToChainId(wallet?.chain), wallet?.walletAddress)
                          window.open(link, '_blank')
                        }}
                      >
                        {explorerIcon(mapChainTypeToChainId(wallet?.chain))}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-1.5 text-[#908E98]">
                      {t('assets.wallet.viewExplorer')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="size-4 text-[#79778C] hover:text-white cursor-move drag-handle">
                        <IconArrange className="size-[16px]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-1.5 text-[#908E98]">
                      {t('assets.wallet.arrange')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WalletManangement
