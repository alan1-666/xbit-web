import { cn } from '@/lib/utils'
import { DotButton, useDotButton } from '@/pages/detail/EmblaCarouel/EmblaCarouselDotButton'
import EmblaCarouselPC from '@/pages/detail/EmblaCarouel/EmblaCarouselPC'
import { formatPercentage, getBlockChainLogo } from '@/utils/helpers'
import ListAppShare from '@components/common/share/listAppShare.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { toPng } from 'html-to-image'
import { isEqual } from 'lodash-es'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { IconGlobalStroke, IconTelegram2, IconTwitter } from '../icon'
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'
import ChainCurrencyIcon from './ChainCurrencyIcon'
import CheckboxWithLabel from './CheckboxWithLabel'
import { Cell, DOT_IMAGES } from './ShareTokenDetail'
import Text from './Text'

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

const ShareTokenHoldingContent = ({
  data,
  inviteCode,
  open,
  fileName,
  text,
  url,
  hideSaveButton,
  customShareUrl,
}: {
  data: Props['data']
  inviteCode?: string
  open: boolean
  fileName?: string
  text?: string
  url?: string
  hideSaveButton?: boolean
  customShareUrl?: string
}) => {
  const { t } = useTranslation()
  const posterRefs = useRef<(HTMLDivElement | null)[]>([])
  const selectedIndexRef = useRef<number>(0)

  const { chainId, PnL, costPrice, tokenAvatar, tokenName, tokenAddress, totalBuy, returnRate, balance } = data
  const tokenLogo = tokenAvatar ?? getBlockChainLogo(chainId, tokenAddress)

  const OPTIONS: EmblaOptionsType = { containScroll: false, loop: true }
  const SLIDE_COUNT = 5
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys())

  const [saving, setSaving] = useState<boolean>(false)
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)
  const [showCostPrice, setShowCostPrice] = useState(true)
  const [showTotalBuy, setShowTotalBuy] = useState(true)
  const [showBalance, setShowBalance] = useState(true)

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

  const renderItem = useCallback(
    ({
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
          className=" rounded-[16px]"
          ref={(el) => {
            posterRefs.current[arrayIndex] = el
          }}
        >
          <div className={cn(`relative`)}>
            <div className="relative z-0 w-full">
              {type === 1 && <img src="/images/share/pc/poster-1.webp" alt="" className="w-full h-auto" />}
              {type === 2 && <img src="/images/share/pc/poster-2.webp" alt="" className="w-full h-auto" />}
              {type === 3 && <img src="/images/share/pc/poster-3.webp" alt="" className="w-full h-auto" />}
              {type === 4 && <img src="/images/share/pc/poster-4.webp" alt="" className="w-full h-auto" />}
              {type === 5 && <img src="/images/share/pc/poster-5.webp" alt="" className="w-full h-auto" />}
            </div>

            <div className="absolute inset-0 z-10 pt-[30px] flex flex-col h-full">
              <div className="flex items-center justify-center gap-2 ">
                <img src="/images/kairox-logo.svg" alt="logo" className="cursor-pointer h-[24px]" />
                <img src="/images/share/pc/xbit.svg" alt="logo" className="cursor-pointer" />
              </div>
              <div className="mt-1 gap-2.5 px-6 flex-1">
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
                  <Text text={tokenName ?? ''} className="font-[520]!" fontSize={24} />
                </div>
                <div className="mt-2 text-left">
                  {returnRate !== '--' ? (
                    <Text
                      text={formatPercentage(Number(returnRate), true)}
                      className={cn(Number(PnL) >= 0 ? 'text-rise!' : 'text-fall!', 'text-[calc(calc(1rem*(64/16)))]')}
                      fontWeight="semibold"
                    />
                  ) : (
                    <Text text={'--'} className={cn('text-[calc(calc(1rem*(64/16)))]')} fontWeight="semibold" />
                  )}
                </div>

                <div className="mt-2 flex gap-14">
                  {showCostPrice && (
                    <Cell
                      lable={t('detail.myPositions.costPrice')}
                      value={costPrice}
                      classNameLable="!font-[400] !text-[18px] !text-[#908E98] mb-[8px]"
                      classNameValue="!font-[400] !text-[18px] !text-[#fff]"
                    />
                  )}
                  {showTotalBuy && (
                    <Cell
                      lable={t('detail.holdings.totalBuy')}
                      value={totalBuy}
                      classNameLable="!font-[400] !text-[18px] !text-[#908E98] mb-[8px]"
                      classNameValue="!font-[400] !text-[18px] !text-[#fff]"
                    />
                  )}
                  {showBalance && (
                    <Cell
                      lable={t('walletDetail.holderTable.balance')}
                      value={balance}
                      classNameLable="!font-[400] !text-[18px] !text-[#908E98] mb-[8px] "
                      classNameValue="!font-[400] !text-[18px] !text-[#fff]"
                    />
                  )}
                </div>
              </div>
              <div
                className={'absolute left-6 bottom-5 space-y-4.5  font-[330] text-[14px] leading-none text-[#FBFBFB]'}
              >
                <div className="flex gap-1">
                  <Text
                    text={t('assets.shareHolding.inviteCode')}
                    color="#908E98"
                    fontSize={16}
                    fontWeight="regular"
                    className={cn('leading-4')}
                  />

                  <Text text={inviteCode || '--'} fontSize={15} fontWeight="regular" className={cn('leading-4')} />
                </div>

                <div className="flex items-center gap-6 text-sm text-white">
                  <Link
                    to="https://xbit.com"
                    target="_blank"
                    className={'flex items-center gap-1.5 cursor-pointer mb-0'}
                  >
                    <IconGlobalStroke className="size-[14px]" />
                    <span>KairoX</span>
                  </Link>
                  <Link
                    to="https://twitter.com/KairoX"
                    target="_blank"
                    className={'flex items-center gap-1.5 cursor-pointer mb-0'}
                  >
                    <IconTwitter className="size-[14px]" />
                    <span>@KairoX</span>
                  </Link>
                  <Link
                    to="https://t.me/KairoX"
                    target="_blank"
                    className={'flex items-center gap-1.5 cursor-pointer mb-0'}
                  >
                    <IconTelegram2 className="size-[14px]" />
                    <span>@KairoX</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    [data, inviteCode, t, tokenLogo],
  )

  useEffect(() => {
    selectedIndexRef.current = selectedIndex
  }, [selectedIndex])

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
      <div className="_hidescrollbar h-full w-full overflow-auto">
        <div className="m-auto flex h-fit items-center justify-center relative rounded-[16px]">
          <EmblaCarouselPC
            slides={SLIDES}
            options={OPTIONS}
            children={renderItem}
            emblaRef={emblaRef}
            showCostPrice={showCostPrice}
            showTotalBuy={showTotalBuy}
            showBalance={showBalance}
          />
        </div>
        <div className="mt-[20px] grid grid-cols-2 gap-3">
          <div className="bg-[#2B2B33] p-[10px] rounded-[8px]">
            <Text text={t('futuresDetailsShare.selectBgImage')} color="#A9A9B3" fontSize={16} />
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
          </div>
          <div className="bg-[#2B2B33] p-[10px] rounded-[8px] ">
            <Text text={t('futuresDetailsShare.selectShareInfo')} color="#A9A9B3" fontSize={16} className="mb-2" />
            <div className="flex gap-4 mt-[12px]">
              <CheckboxWithLabel
                checked={showCostPrice}
                onChange={(checked) => setShowCostPrice(checked as boolean)}
                label={t('detail.myPositions.costPrice')}
                containerClassName="align-b"
                labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1 app-font-light"
              />
              <CheckboxWithLabel
                checked={showTotalBuy}
                onChange={(checked) => setShowTotalBuy(checked as boolean)}
                label={t('detail.holdings.totalBuy')}
                labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1 app-font-light"
              />
              <CheckboxWithLabel
                checked={showBalance}
                onChange={(checked) => setShowBalance(checked as boolean)}
                label={t('walletDetail.holderTable.balance')}
                labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1 app-font-light"
              />
            </div>
          </div>
        </div>
      </div>
      <ListAppShare onSave={onSave} text={text} url={url} saving={saving} hideSaveButton={hideSaveButton} customShareUrl={customShareUrl} />
    </>
  )
}

const ShareTokenHoldingPC = ({
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="px-3 max-w-[783px] bg-[#212127] py-2 pb-4" showDialogPrimitiveClose={false}>
        <DialogHeader className="flex w-full flex-row items-center justify-between px-3">
          {/* <DialogTitle>
            <div className="text-[18px] font-medium text-white" style={{ visibility: 'hidden' }}>
              {title}
            </div>
          </DialogTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="h-6 w-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          /> */}
        </DialogHeader>

        <ShareTokenHoldingContent
          data={data}
          inviteCode={inviteCode}
          open={open}
          fileName={fileName}
          text={text}
          url={url}
          hideSaveButton={hideSaveButton}
          customShareUrl={customShareUrl}
        />
      </DialogContent>
    </Dialog>
  )
}

export default memo(
  ShareTokenHoldingPC,
  (prevProps, nextProps) =>
    isEqual(prevProps.open, nextProps.open) &&
    isEqual(prevProps.customShareUrl, nextProps.customShareUrl) &&
    isEqual(prevProps.inviteCode, nextProps.inviteCode) &&
    isEqual(prevProps.url, nextProps.url) &&
    isEqual(prevProps.text, nextProps.text) &&
    isEqual(prevProps.data.costPrice, nextProps.data.costPrice) &&
    isEqual(prevProps.data.returnRate, nextProps.data.returnRate) &&
    isEqual(prevProps.data.totalBuy, nextProps.data.totalBuy) &&
    isEqual(prevProps.data.balance, nextProps.data.balance) &&
    isEqual(prevProps.data, nextProps.data),
)
