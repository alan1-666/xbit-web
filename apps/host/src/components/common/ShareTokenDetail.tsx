import { formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils'
import EmblaCarousel from '@/pages/detail/EmblaCarouel/EmblaCarousel'
import { DotButton, useDotButton } from '@/pages/detail/EmblaCarouel/EmblaCarouselDotButton'
import { formatPercentage, getBlockChainLogo } from '@/utils/helpers'
import ListAppShare from '@components/common/share/listAppShare.tsx'
import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { toPng } from 'html-to-image'
import { isEqual } from 'lodash-es'
import { QRCodeCanvas } from 'qrcode.react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { IconGlobalStroke, IconTelegram2, IconTwitter } from '../icon'
import ChainCurrencyIcon from './ChainCurrencyIcon'
import CheckboxWithLabel from './CheckboxWithLabel'
import Text from './Text'
import MoneyFormatted from './MoneyFormatted'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  fileName?: string
  text?: string
  url?: string
  hideSaveButton?: boolean
  inviteCode?: string
  customShareUrl?: string
  data: {
    costPrice: string | number
    PnL: string | number
    chainId: number
    tokenName: string
    tokenAvatar: string
    tokenAddress: string
    totalBuy: string | number
    returnRate: string | number
    balance: string | number
  }
}

export const Cell = ({
  lable,
  value,
  classNameValue,
  classNameLable,
}: {
  lable: string
  value: string | number
  classNameValue?: string
  classNameLable?: string
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Text text={lable} fontSize={16} fontWeight="light" color="#CCCADB" className={cn('leading-4', classNameLable)} />
      <div className={cn('app-font-medium text-[calc(1rem*(16/16))] leading-4', classNameValue)}>
        <MoneyFormatted value={value} roundType="floor" />
      </div>
    </div>
  )
}

export const DOT_IMAGES = [
  '/images/share/dot-buton-1.png',
  '/images/share/dot-buton-2.png',
  '/images/share/dot-buton-3.png',
  '/images/share/dot-buton-4.png',
  '/images/share/dot-buton-5.png',
]

const ShareTokenDetail = ({
  open,
  setOpen,
  title,
  fileName,
  text,
  url,
  hideSaveButton,
  data,
  inviteCode,
  customShareUrl,
}: Props) => {
  const { t } = useTranslation()
  const posterRefs = useRef<(HTMLDivElement | null)[]>([])
  const selectedIndexRef = useRef<number>(0)

  const { chainId, PnL, costPrice, tokenAvatar, tokenName, tokenAddress, totalBuy, returnRate, balance } = data
  const tokenLogo = tokenAvatar ?? getBlockChainLogo(chainId, tokenAddress)

  const OPTIONS: EmblaOptionsType = { containScroll: false, loop: true }
  const SLIDE_COUNT = 5
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys())

  const waitForImages = useCallback(async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img')
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve(true)
        setTimeout(() => resolve(true), 4000)
      })
    })
    await Promise.all(promises)
  }, [])

  const renderItem = ({
    type,
    showCostPrice,
    showTotalBuy,
    showBalance,
  }: {
    type: number
    showCostPrice: boolean
    showTotalBuy: boolean
    showBalance: boolean
  }) => {
    const arrayIndex = type - 1
    return (
      <div
        className="w-[350px] md:w-[450px]"
        ref={(el) => {
          posterRefs.current[arrayIndex] = el
        }}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (!hideSaveButton) setOpen(false)
        }}
      >
        <div
          className={cn(
            `relative h-[333px]  bg-cover bg-top bg-no-repeat px-2 py-3 md:px-3`,
            type === 1 && "bg-[url('/images/share/h5-bg-share-1.webp')]",
            type === 2 && "bg-[url('/images/share/h5-bg-share-2.webp')]",
            type === 3 && "bg-[url('/images/share/h5-bg-share-3.webp')]",
            type === 4 && "bg-[url('/images/share/h5-bg-share-4.webp')]",
            type === 5 && "bg-[url('/images/share/h5-bg-share-5.webp')]",
          )}
        >
          <div className="mt-3 gap-2.5">
            <div className="flex items-center gap-x-1.5">
              <ChainCurrencyIcon
                currencyIcon={tokenLogo}
                name={tokenName ?? ''}
                fallbackClassName="bg-secondary"
                avatarClassName="size-[36px]"
                avatarImageClassName="size-[36px]"
                // avatarImageProps={{
                //   crossOrigin: 'anonymous',
                // }}
              />
              <Text text={tokenName ?? ''} className="font-[520]!" fontSize={20} />
            </div>
            <div className="mt-2">
              {returnRate !== '--' ? (
                <Text
                  text={formatPercentage(Number(returnRate), true)}
                  className={cn(Number(PnL) >= 0 ? 'text-rise!' : 'text-fall!', 'text-[calc(calc(1rem*(37/16)))]')}
                  fontWeight="semibold"
                />
              ) : (
                <Text text={'--'} className={cn('text-[calc(calc(1rem*(37/16)))]')} fontWeight="semibold" />
              )}
            </div>

            <div className="mt-2 flex gap-6">
              {showCostPrice && <Cell lable={t('detail.myPositions.costPrice')} value={costPrice} />}
              {showTotalBuy && <Cell lable={t('detail.holdings.totalBuy')} value={totalBuy} />}
              {showBalance && <Cell lable={t('walletDetail.holderTable.balance')} value={balance} />}
            </div>
            <div className="flex gap-1 mt-7">
              <Text
                text={t('assets.shareHolding.inviteCode')}
                color="#CCCADB"
                fontSize={16}
                fontWeight="light"
                className={cn('leading-4')}
              />

              <Text text={inviteCode || '--'} fontSize={15} fontWeight="medium" className={cn('leading-4')} />
            </div>
          </div>
          <div className={'absolute left-3 bottom-3 space-y-4 font-[330] text-[14px] leading-none text-[#FBFBFB]'}>
            <Link
              to="https://xbit.com"
              target="_blank"
              className={'flex items-center gap-1.5 cursor-pointer text-[12px] app-font-regular'}
              onClick={(e) => {
                window.open('https://xbit.com', '_blank')
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <IconGlobalStroke className="size-[14px]" />
              <span>KairoX</span>
            </Link>
            <Link
              to="https://twitter.com/KairoX"
              target="_blank"
              className={'flex items-center gap-1.5 cursor-pointer text-[12px] app-font-regular'}
              onClick={(e) => {
                window.open('https://twitter.com/KairoX', '_blank')
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <IconTwitter className="size-[14px]" />
              <span>@KairoX</span>
            </Link>
            <Link
              to="https://t.me/KairoX"
              target="_blank"
              className={'flex items-center gap-1.5 cursor-pointer text-[12px] app-font-regular'}
              onClick={(e) => {
                window.open('https://t.me/KairoX', '_blank')
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <IconTelegram2 className="size-[14px]" />
              <span>@KairoX</span>
            </Link>
          </div>
          <div className="">
            {type === 2 && <img src="/images/share/h5-logo-1.svg" alt="" className="absolute right-0 bottom-2" />}
            {type === 3 && <img src="/images/share/h5-logo-2.svg" alt="" className="absolute right-0 bottom-2" />}
            {type === 1 && <img src="/images/share/h5-logo-3.svg" alt="" className="absolute right-0 bottom-2" />}
            {type === 5 && (
              <img src="/images/share/h5-logo-4.webp" alt="" className="w-[225px] absolute right-0 bottom-0" />
            )}
            {type === 4 && (
              <img src="/images/share/h5-logo-5.webp" alt="" className="w-[225px] absolute right-0 bottom-0" />
            )}
          </div>
        </div>
        <div className="bg-[url('/images/share/footer-share.webp')] bg-cover bg-center bg-no-repeat h-[81px] w-full relative">
          <img src="/images/kairox-logo.svg" alt="xbit logo" className="w-[48px] h-[42px] absolute left-5 top-5" />
          <img
            src="/images/share/kairox-logo-text-dark.svg"
            alt="xbit logo"
            className="w-[80px] h-[28px] absolute left-21 top-5"
          />
          <Text
            text={t('appSettings.shareXBITSubtitle')}
            color="#0A0A0A"
            className="absolute top-[47px] left-[84px] md:top-[45px] md:left-[85px]"
            fontSize={11}
          />

          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center">
            <QRCodeCanvas
              marginSize={1}
              value={url ?? ''}
              width={75}
              height={70}
              size={60}
              imageSettings={{
                src: '/images/share/logo-inside-qr.svg',
                height: 20,
                width: 20,
                excavate: true,
              }}
              level="H"
            />
          </div>
        </div>
      </div>
    )
  }

  const RenderContent = () => {
    const [saving, setSaving] = useState<boolean>(false)
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)
    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)
    const [showCostPrice, setShowCostPrice] = useState(true)
    const [showTotalBuy, setShowTotalBuy] = useState(true)
    const [showBalance, setShowBalance] = useState(true)

    useEffect(() => {
      return () => {
        setSaving(false)
      }
    }, [open])

    const onSave = async () => {
      const currentPosterRef = posterRefs.current[selectedIndexRef.current]

      if (!currentPosterRef) {
        console.error('Poster ref not found for index:', selectedIndexRef.current)
        return
      }

      try {
        setSaving(true)

        await waitForImages(currentPosterRef)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const dataUrl = await toPng(currentPosterRef, {
          quality: 1,
          pixelRatio: 2,
          cacheBust: true,
          includeQueryParams: true,
        })

        const link = document.createElement('a')
        link.download = fileName ? `${fileName}.png` : `poster-${selectedIndexRef.current + 1}.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Error saving image:', error)
      } finally {
        setSaving(false)
      }
    }

    return (
      <>
        <div className="_hidescrollbar h-full w-full overflow-y-auto py-2 overflow-x-hidden">
          <div className="m-auto flex h-fit w-[350px] items-center justify-center md:w-[450px] relative">
            <EmblaCarousel
              slides={SLIDES}
              options={OPTIONS}
              children={renderItem}
              selectedIndexRef={selectedIndexRef}
              emblaRef={emblaRef}
              emblaApi={emblaApi}
              selectedIndex={selectedIndex}
              showCostPrice={showCostPrice}
              showTotalBuy={showTotalBuy}
              showBalance={showBalance}
            />
          </div>
          <div className="mt-4 w-full mx-3">
            <Text text={t('futuresDetailsShare.selectBgImage')} color="#908E98" fontSize={14} />
            <div className="flex gap-[20px] mt-[12px]">
              {scrollSnaps.map((_, index) => (
                <DotButton
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={`rounded-[6px] overflow-hidden border transition-all duration-300 w-[48px] h-[48px] ${
                    index === selectedIndex ? 'border-[#C8A7FD] border' : 'border-transparent '
                  }`}
                >
                  {<img src={DOT_IMAGES[index]} alt="" className="size-full object-cover" />}
                </DotButton>
              ))}
            </div>
            <div className="mt-[20px]">
              <Text text={t('futuresDetailsShare.selectShareInfo')} color="#908E98" fontSize={14} className="mb-2" />
              <div className="flex gap-4 mt-[12px]">
                <CheckboxWithLabel
                  checked={showCostPrice}
                  onChange={(checked) => setShowCostPrice(checked as boolean)}
                  label={t('detail.myPositions.costPrice')}
                  containerClassName="align-b"
                  labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                />
                <CheckboxWithLabel
                  checked={showTotalBuy}
                  onChange={(checked) => setShowTotalBuy(checked as boolean)}
                  label={t('detail.holdings.totalBuy')}
                  labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                />
                <CheckboxWithLabel
                  checked={showBalance}
                  onChange={(checked) => setShowBalance(checked as boolean)}
                  label={t('walletDetail.holderTable.balance')}
                  labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto py-2 flex items-center justify-center">
          <div className="bg-[#79778C29] rounded-[8px] w-full mx-3">
            <ListAppShare
              onSave={onSave}
              text={text}
              url={url}
              saving={saving}
              hideSaveButton={hideSaveButton}
              customShareUrl={customShareUrl}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="mx-auto max-h-[88vh] w-full max-w-[768px] bg-[#212127]">
        <DrawerHeader className="flex w-full items-center justify-between px-3">
          <DialogTitle>
            <div className="text-[18px] font-medium text-white">{title}</div>
          </DialogTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            alt="close"
          />
        </DrawerHeader>
        <RenderContent />
      </DrawerContent>
    </Drawer>
  )
}

export default memo(
  ShareTokenDetail,
  (prevProps, nextProps) =>
    isEqual(prevProps.open, nextProps.open) &&
    isEqual(prevProps.inviteCode, nextProps.inviteCode) &&
    isEqual(prevProps.url, nextProps.url) &&
    isEqual(prevProps.text, nextProps.text) &&
    isEqual(prevProps.data.costPrice, nextProps.data.costPrice) &&
    isEqual(prevProps.data.returnRate, nextProps.data.returnRate) &&
    isEqual(prevProps.data, nextProps.data) &&
    isEqual(prevProps.customShareUrl, nextProps.customShareUrl),
)
