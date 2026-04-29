import { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react'
import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { UpdateWalletOrderInputDto, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import {
  mappedTypeChain,
  updateWallet,
  mappedChainIdToTypeChain,
  newWalletActions,
} from '@/redux/modules/newWallet.slice'
import WalletItem from './components/WalletItem'
import { TYPE_CHAIN } from '@/lib/blockchain'
import ls from '@/lib/local-storage'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const NewManageWalletBottomSheet = ({ open, setOpen }: Props) => {
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [layout, setLayout] = useState<Array<{ i: string; x: number; y: number; w: number; h: number }>>([])
  const [isDragging, setIsDragging] = useState(false)
  const [localWalletOrder, setLocalWalletOrder] = useState<UserEmbeddedWalletDto[]>([])
  const refContainer = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const isAssetsPage = pathname.includes('/assets')

  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const listWalletsByActiveChain = useMemo(() => {
    if (isAssetsPage) {
      return listWalletsByChain?.filter(
        (item: UserEmbeddedWalletDto) => item.chain === mappedChainIdToTypeChain(ls.get('asset_chain_id')),
      )
    }
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain, open])

  useEffect(() => {
    if (listWalletsByActiveChain?.length > 0) {
      setLocalWalletOrder([...listWalletsByActiveChain])

      const initialLayout = listWalletsByActiveChain.map((wallet: UserEmbeddedWalletDto, index: number) => ({
        i: wallet.id,
        x: 0,
        y: index,
        w: 1,
        h: 1,
      }))
      setLayout(initialLayout)
    }
  }, [listWalletsByActiveChain])

  const onLayoutChange = useCallback((newLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
    setLayout(newLayout)
  }, [])

  const onDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const onDragStop = useCallback(
    (newLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      setIsDragging(false)

      const reorderedWallets = newLayout
        .sort((a, b) => a.y - b.y)
        .map((layoutItem) => localWalletOrder.find((wallet: UserEmbeddedWalletDto) => wallet.id === layoutItem.i))
        .filter((wallet): wallet is UserEmbeddedWalletDto => wallet !== undefined)

      setLocalWalletOrder(reorderedWallets)
    },
    [localWalletOrder],
  )

  const handleMoveToTop = useCallback(
    (index: number) => {
      const walletToMove = localWalletOrder[index]
      const otherWallets = localWalletOrder.filter((_: UserEmbeddedWalletDto, idx: number) => idx !== index)
      const reorderedWallets = [walletToMove, ...otherWallets]

      setLocalWalletOrder(reorderedWallets)

      const newLayout = reorderedWallets.map((wallet, idx) => ({
        i: wallet.id,
        x: 0,
        y: idx,
        w: 1,
        h: 1,
      }))
      setLayout(newLayout)
    },
    [localWalletOrder],
  )

  const commitChangesToRedux = useCallback(() => {
    if (localWalletOrder.length > 0) {
      const allWallets = [...listWalletsByChain]
      let otherChainWallets = allWallets.filter(
        (wallet: UserEmbeddedWalletDto) => wallet.chain !== mappedTypeChain(activeChain),
      )
      if (isAssetsPage) {
        otherChainWallets = allWallets.filter(
          (wallet: UserEmbeddedWalletDto) => wallet.chain !== mappedChainIdToTypeChain(ls.get('asset_chain_id')),
        )
      }

      const updatedWalletsByChain = [...otherChainWallets, ...localWalletOrder]

      const wallets = updatedWalletsByChain
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
      ).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          toast.success(t('toast.saveSuccess'))
          dispatch(
            updateWallet({
              listWalletsByChain: updatedWalletsByChain,
            }),
          )
        } else {
          toast.error(t('toast.saveFailed'))
        }
      })
    }
  }, [localWalletOrder, listWalletsByChain, activeChain, isAssetsPage, dispatch])

  // Handle modal close
  const handleClose = useCallback(
    (open: boolean) => {
      setOpen(open)
    },
    [setOpen],
  )

  const onClickSave = () => {
    commitChangesToRedux()
    handleClose(false)
  }

  const displayWallets = useMemo(() => {
    return localWalletOrder.length > 0 ? localWalletOrder : listWalletsByActiveChain
  }, [localWalletOrder, listWalletsByActiveChain])

  const widthContainer = refContainer.current?.clientWidth || 768

  // Add custom CSS for drag handle
  const customStyles = `
    .react-grid-item.react-grid-placeholder {
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 8px;
    }
    .react-grid-item {
      cursor: default !important;
    }
    .react-grid-item .drag-handle {
      cursor: move !important;
    }
    .react-grid-item.react-draggable-dragging {
      opacity: 0.8;
      transform: rotate(2deg);
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="w-full max-w-[768px] mx-auto max-h-[80vh] bg-[#232329]" ref={refContainer}>
          <DrawerHeader className="px-3 grid grid-cols-[70px_1fr_70px] items-center">
            <img
              src="/images/icons/arrow-left.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => handleClose(false)}
            />
            <div className="font-normal text-white text-[18px] text-center leading-none">
              {t('wallet.manageWallet')}
            </div>
            <div className="flex justify-end cursor-pointer" onClick={onClickSave}>
              <p>{t('button.save')}</p>
            </div>
          </DrawerHeader>
          <div className="max-h-[360px] overflow-y-auto w-full">
            <div className="px-3 pb-3 w">
              {displayWallets && displayWallets.length > 0 && (
                <GridLayout
                  className="layout"
                  layout={layout}
                  cols={1}
                  rowHeight={80}
                  width={widthContainer - 22}
                  onLayoutChange={onLayoutChange}
                  onDragStart={onDragStart}
                  onDragStop={onDragStop}
                  isDraggable={true}
                  isResizable={false}
                  margin={[0, 0]}
                  containerPadding={[0, 0]}
                  useCSSTransforms={true}
                  autoSize={true}
                  verticalCompact={true}
                  preventCollision={false}
                  draggableHandle=".drag-handle"
                >
                  {displayWallets?.map((item: UserEmbeddedWalletDto, index: number) => {
                    const balance = item?.balance * (priceNativeToken || 1)
                    return (
                      <div key={item.id} className="w-full">
                        <WalletItem
                          item={item}
                          index={index}
                          balance={item?.balance}
                        />
                      </div>
                    )
                  })}
                </GridLayout>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default memo(NewManageWalletBottomSheet)
