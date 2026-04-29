import Container from '@components/common/Container.tsx'
import OrderSetting from '@components/detailHeader/OrderSetting.tsx'
import DetailHeaderButton from '@components/detailHeader/DetailHeaderButton.tsx'
import { useActiveAssetCtx } from '@/hooks/hyperliquid/useActiveAssetCtx'
import { baseCoinSelector, quoteCoinSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import {  useAppSelector, useAppDispatch } from '@/redux/store'
import { setSymbolInfo } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useEffect, useMemo } from 'react'
import ImgWithFallback from '@/components/common/ImgWithFallback'
import { cn, showRate } from '@/lib/utils'
import { Configs } from '@/const/configs'



const DetailHeader = () => {
  
  const baseCoin = useAppSelector(baseCoinSelector)
  const quoteCoin = useAppSelector(quoteCoinSelector)
  const { price, markPrice, change } = useActiveAssetCtx(baseCoin)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setSymbolInfo({ price, markPrice, change }))
  }, [price, markPrice, change, dispatch])

  
  

  return (
    <header>
      <Container
        className="flex items-center gap-[15px] pb-[6px] pt-[10px]"
      >
        <div className="flex items-center gap-[4px] mr-auto">
          <ImgWithFallback
              src={`${Configs.getHyperliquidConfig().imgUrl}/${baseCoin}.svg`}
              srcFallback="/images/logo-pair-fallback.webp"
              sharedClassName="size-8"
              loadedClassName="bg-[#fff] rounded-full"
            />
            <div className="">
                <div className="flex items-center text-[calc(16/16)] leading-[calc(16/16)] mb-1">
                    {`${baseCoin}${quoteCoin}`}永续
                    <img src="/images/futuresDetail/arrow-down.svg" className="ml-1 w-[14px] min-w-[14px]" alt="" />
                </div>
                <div className={cn('text-[calc(12rem/16)] leading-[calc(12rem/16)]',
                  parseFloat(change) >= 0 ? 'text-rise' : 'text-fall'
                )}>
                    <span className='mr-1.5'>{price}</span>
                    <span>{showRate(change)}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-[12px]">
          <DetailHeaderButton
            className="transition-all duration-100 hover:scale-[1.1]"
            icon="/images/detailHeader/icon-star.svg"
          />
          <OrderSetting />
        </div>
      </Container>
    </header>
  )
}

export default DetailHeader
