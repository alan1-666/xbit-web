import LogoWithChain from '@/components/common/LogoWithChain'
import { Result, RouteResponse } from '../types/Route'
import { cn } from '@/lib/utils'
import Text from '@/components/common/Text'

type RouteSelectorProps = {
  routes?: RouteResponse
  onSelect: (selectedRoute: Result) => void
  hasArbEth: boolean
}

const Tag = ({ text, isHighLight }: { text: string; isHighLight?: boolean }) => {
  return (
    <div
      className={`
        px-[6px] py-[3px] rounded-[2px]
        ${isHighLight ? 'tag-high-light' : 'border-gradient-selector'}
        transition-all duration-300 hover:scale-105 cursor-pointer
      `}
    >
      <Text text={text} fontSize={10} fontWeight="light" color={isHighLight ? '#141414' : '#FFFFFF'} />
    </div>
  )
}

const RouteSelector = ({routes, onSelect, hasArbEth}: RouteSelectorProps) => {

  return (
    <div className="w-full mx-auto relative">
      <div className="flex flex-col max-h-80 overflow-y-auto">
        {routes &&
          routes.results.map((item, index) => (
            <button
              key={index}
              className={cn(
                'relative mt-3 p-[1px] rounded-[8px] bg-[#ECECED14] border border-[#ECECED2E]',
                index === 0 && 'bg-gradient-selector-swap border-gradient-selector',
              )}
              onClick={() => onSelect(item)}
            >
              {
                index === 0 &&
                <img src="/images/cryptoDeposit/card-wallet-s.svg" className="absolute top-0 right-0" alt="card wallet" />
              }
              <div className="px-[14px] py-[16px] rounded-[8px]">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5">
                    <Text text={'跨链路径'} fontSize={11} fontWeight="light" color="#FFFFFFB2" />
                    <div className="inline-flex items-center gap-0.5">
                      {
                        item.swaps.map(swap => (
                          <>
                          <img src={swap.swapperLogo} className="size-[14px]" alt="swapper logo"/>
                          <Text text={swap.swapperId} fontSize={11} fontWeight="light" />
                          </>
                        ))
                      }
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="inline-flex items-center gap-1.5">
                      <Tag text="最优" isHighLight={true} />
                      <Tag text="最快" />
                      <Tag text="Gas费最低" />
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-2 mt-3 rounded-[10px]">
                  <LogoWithChain
                    logo="/images/cryptoDeposit/usdc.svg"
                    name="USDC"
                    chainContainerClassName="!bg-none"
                    logoClassName="w-[26px] h-[26px]"
                    chainLogo="/images/cryptoDeposit/cryptoDeposit/arbitrum-chain.png"
                  />
                  <span className="ml-[6px] text-[16px]">
                    {hasArbEth ? item.outputAmount : item.recalculatedOutputAmount} USDC
                  </span>
                </div>
                <div className="mt-[10px] space-y-2">
                  <div className="flex items-center justify-between">
                    <Text text="预估时间" fontWeight="light" fontSize={11} color="#FFFFFFB2" />
                    <div className="flex">
                      <Text
                        text={`${item?.estimatedTimeInSeconds ? item?.estimatedTimeInSeconds / 60 : 0}`}
                        fontWeight="light"
                        fontSize={11}
                        color="#FFFFFFCC"
                      />
                      <Text text="min" fontWeight="light" fontSize={11} color="#FFFFFFCC" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text text="预估网络费用" fontWeight="light" fontSize={11} color="#FFFFFFB2" />
                    <div className="flex">
                      <Text text={`$${item.fee}`} fontWeight="light" fontSize={11} color="#FFFFFFCC" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

export default RouteSelector
