import { UpdateWalletOrderInputDto, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { TYPE_CHAIN } from '@/lib/blockchain'
import ls from '@/lib/local-storage'
import {
  mappedChainIdToTypeChain,
  mappedTypeChain,
  newWalletActions,
  updateWallet,
} from '@/redux/modules/newWallet.slice'
import { priceChain } from '@/redux/modules/price.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { DrawerHeader } from '@components/ui/drawer.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { useTranslation } from 'react-i18next'
import 'react-resizable/css/styles.css'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import WalletItem from './components/WalletItem'

type Props = {
  open: boolean
  setIsShowManage: Dispatch<SetStateAction<boolean>>
}

const NewManageWallet = ({ open, setIsShowManage }: Props) => {
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
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

  const onDragStart = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    e.stopPropagation()
    e.preventDefault?.()
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
          setIsShowManage(false)
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

  const onClickSave = () => {
    commitChangesToRedux()
  }

  const displayWallets = useMemo(() => {
    return localWalletOrder.length > 0 ? localWalletOrder : listWalletsByActiveChain
  }, [localWalletOrder, listWalletsByActiveChain])

  const widthContainer = refContainer.current?.clientWidth || 768

  useEffect(() => {
    const handles = document.querySelectorAll('.drag-handle')
    handles.forEach((handle) => {
      handle.addEventListener('pointerdown', (e) => {
        e.stopPropagation()
      })
      handle.addEventListener('touchstart', (e) => {
        e.stopPropagation()
      })
    })
  }, [displayWallets])

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
    <div ref={refContainer}>
      <DrawerHeader className={
        `px-3 grid grid-cols-[70px_1fr_70px] items-center ${isDesktop ? 'grid-cols-[1fr_70px]' : ''}`
      }>
        <img
          src="/images/icons/arrow-left.svg"
          className={`w-6 h-6 cursor-pointer ${isDesktop ? 'hidden' : ''}`}
          alt="arrow-left"
          onClick={() => setIsShowManage(false)}
        />
        <div className="font-normal text-white text-[18px] text-center leading-none">{t('wallet.manageWallet')}</div>
        <div className="flex justify-end cursor-pointer" onClick={onClickSave}>
          <p>{t('button.save')}</p>
        </div>
      </DrawerHeader>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className={`max-h-[400px] overflow-y-auto w-full ${isDesktop ? 'max-h-none' : ''}`}>
        <div className="px-3 pb-3">
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
                      onMoveToTop={handleMoveToTop}
                      listWalletsByActiveChain={localWalletOrder}
                    />
                  </div>
                )
              })}
            </GridLayout>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(NewManageWallet)
