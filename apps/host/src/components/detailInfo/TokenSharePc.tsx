import React, { useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@components/ui/dialog.tsx";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {TokenDetail} from "@/@generated/gql/graphql-meme2.ts";
import {useTranslation} from "react-i18next";
import {Textarea} from "@components/ui/textarea.tsx";
import {cn} from "@/lib/utils.ts";
import CopyBtn from "@components/common/CopyBtn.tsx";
import {Button} from "@components/ui/button.tsx";
import LineChartSharePc from "@components/detailInfo/LineChartSharePC.tsx";

type Slide = {
  id: string;
  src: string;     // image URL
  alt?: string;
  bg?: string;     // optional bg color fallback
};

type TokenShareProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  tokenData?: TokenDetail;
};

const variants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 30 }
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.18 }
  })
};

// --- arrow icons ---
const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M19 12H5m6 6-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const circleBtnCls = (disabled?: boolean) =>
  `w-9 h-9 grid place-items-center rounded-full border backdrop-blur-sm bg-[#79778C29]
   ${disabled ? "cursor-not-allowed text-[#908E98]" : "cursor-pointer border-transparent hover:border-[#FBFBFB] text-white"}`;

const TokenSharePc = (props: TokenShareProps) => {
  const { t } = useTranslation()
  const { open, setOpen, tokenData } = props

  const slides = useMemo<Slide[]>(() => ([
    { id: "1", src: '/images/share/share-bg-1.webp', alt: "Slide 1" },
    { id: "2", src: '/images/share/share-bg-2.webp', alt: "Slide 2" },
    { id: "3", src: '/images/share/share-bg-3.webp', alt: "Slide 3" }
  ]), []);

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const goPrev = useCallback(() => {
    setDir(-1);
    setIndex(i => (i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setDir(1);
    setIndex(i => (i < slides.length - 1 ? i + 1 : i));
  }, [slides.length]);

  // Arrow visibility rules:
  // - First item: only right arrow
  // - Second item: both arrows
  // - Third item: both arrows, right disabled
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  const showLeft = index !== 0;
  const rightDisabled = !canNext;

  const slide = useMemo(() => slides[index], [slides, index]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  }, [goNext, goPrev]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showDialogPrimitiveClose={false} className="min-w-[748px] p-0 bg-transparent border-0 shadow-none">
        <div className="bg-[#212127] px-4 pt-4 pb-5 rounded-[12px]">
          {/* Slider container */}
          <div
            className="relative rounded-[16px] overflow-hidden outline-none"
            style={{ width: 748, height: 460, background: "#212127" }}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Image slider"
            onKeyDown={handleKeyDown}
          >
            {/* Slide layer */}
            <div className="absolute inset-0">
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={slide.id}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 grid place-items-center"
                  style={{ background: slide.bg ?? "#111" }}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt ?? ""}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/*Content layer*/}
            <div className={'absolute top-0 left-0 w-full p-3'}>
              <img src="/images/share/logo-xbit-share.webp" alt="logo share" className={'mx-auto w-[144px] h-[48px]'}/>
              <div className='mt-[38px] flex items-center justify-between gap-6'>
                {/*info*/}
                <div>
                  <div className={'flex items-center gap-4'}>
                    <img src={tokenData?.info?.logoUrl} alt="logo token" className={'min-w-[56px] h-[56px] rounded-full'} />
                    <h3 className={'text-[28px] leading-[1] text-[#FBFBFB] font-medium'}>
                      {tokenData?.symbol}
                    </h3>
                  </div>
                  <div className={'w-[300px] mt-[17px] bg-[#79778C29] p-3'}>
                    <span className={'text-rise text-[36px] leading-[1] font-[450]'}>
                      +2784.36%
                    </span>
                  </div>
                  <div className={'mt-[24px] flex items-center justify-between w-[240px] text-[18px] leading-[1] font-light'}>
                    <span className={'text-[#908E98]'}>{t('detail.myPositions.costPrice')}</span>
                    <span className={'text-[#FBFBFB]'}>0.0002</span>
                  </div>
                  <div className={'mt-[94px]'}>
                    <span className={'text-[16px] leading-[1] font-[300] text-[#FBFBFB]'}>
                      Referral Code: XBITOFFICIAL
                    </span>
                  </div>
                  <div className={'mt-4 flex items-center gap-5'}>
                    <div className={'flex items-center gap-1.5'}>
                      <img src='/images/share/icon-web.svg' alt='icon' />
                      <span className='text-[14px] leading-[1] font-light text-[#6C6A74]'>
                        XBIT.com
                      </span>
                    </div>
                    <div className={'flex items-center gap-1.5'}>
                      <img src='/images/share/icon_twitter.svg' alt='icon' />
                      <span className='text-[14px] leading-[1] font-light text-[#6C6A74]'>
                        XBIT.com
                      </span>
                    </div>
                    <div className={'flex items-center gap-1.5'}>
                      <img src='/images/share/icon-tele.svg' alt='icon' />
                      <span className='text-[14px] leading-[1] font-light text-[#6C6A74]'>
                        XBIT.com
                      </span>
                    </div>
                  </div>
                </div>
                {/*chart*/}
                <LineChartSharePc token={tokenData?.address ?? ""} />
              </div>
            </div>

            {/* Controls — over image, bottom-right */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
              {showLeft && (
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={goPrev}
                  disabled={!canPrev}
                  className={circleBtnCls(!canPrev)}
                >
                  <IconArrowLeft />
                </button>
              )}
              <button
                type="button"
                aria-label="Next slide"
                onClick={goNext}
                disabled={rightDisabled}
                className={circleBtnCls(rightDisabled)}
              >
                <IconArrowRight />
              </button>
            </div>
          </div>

          <div className='mt-5 mb-4 text-[16px] leading-[1] font-light text-[#FBFBFB]'>
            自定义分享消息
          </div>

          <div className=''>
            <Textarea
              className={cn(
              'w-full min-h-[128px] p-4 resize-none overflow-y-auto',
                'text-['
              )}
            />
          </div>

          <div className={'mt-5 flex items-center justify-between'}>
            <div className={'w-[240px] py-3 pl-4 pr-3 flex items-center justify-between border-[0.5px] border-[#686A7A] rounded-[6px]'}>
              <span className={'text-[12px] leading-[1] font-light text-[#FBFBFB] truncate max-w-[176px]'}>
                {'http://.................'}
              </span>
              <CopyBtn text={'#'} />
            </div>

            <div className={'flex items-center gap-2.5'}>
              <Button
                className={'text-[#000] bg-[#FBFBFB] px-4 py-[11px] border-none flex items-center gap-2.5'}
              >
                <img src="/images/share/icon-arrow-down.svg" alt="arrow down" />
                <span>{t('wallet.downloadWallet')}</span>
              </Button>
              <Button
                className={'text-[#000] bg-[#FBFBFB] px-4 py-[11px] border-none flex items-center gap-2.5'}
              >
                <img src="/images/share/icon-copy.svg" alt="arrow down" />
                <span>{t('button.copy')}</span>
              </Button>
              <Button
                className={'text-[#000] bg-[#FBFBFB] px-4 py-[11px] border-none flex items-center gap-2.5'}
              >
                <img src="/images/share/icon-x-share.svg" alt="arrow down" />
                <span>Twitter</span>
              </Button>
              <Button
                className={'text-[#000] bg-[#FBFBFB] px-4 py-[11px] border-none flex items-center gap-2.5'}
              >
                <img src="/images/share/icon-tele-share.svg" alt="arrow down" />
                <span>Telegram</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(TokenSharePc);
