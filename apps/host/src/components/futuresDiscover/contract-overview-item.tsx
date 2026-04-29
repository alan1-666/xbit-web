import { cn } from '@/lib/utils'
import React, { useMemo } from 'react'
import Text from '../common/Text'
import ApexLineChart from './apex-line-chart'

interface IPContractOverviewItem {
  children: React.ReactNode
  className?: string
}

interface IPContractOverviewItemHeader {
  title: string
  subTitle?: string
  icon?: React.ReactNode
  className?: string
  titleClassName?: string
}

const ContractOverviewItem = ({ children, className }: IPContractOverviewItem) => {
  return (
    <div className={cn('ContractOverviewItem rounded-[8px] relative size-full', className)}>
      <div className="p-2.5 relative z-2 size-full flex-col justify-between">{children}</div>
      <div className="bg-size-[100%_100%] bg-no-repeat z-1 bg-[url('/images/futuresDiscover/ellipse-green.png')] size-full absolute inset-0 opacity-70" />
      <div className="bg-size-[100%_100%] bg-no-repeat z-1 bg-[url('/images/futuresDiscover/ellipse-purple.png')] size-full absolute inset-0 " />
    </div>
  )
}
ContractOverviewItem.displayName = 'ContractOverviewItem'

const ContractOverviewItemHeader = ({
  title,
  className,
  icon,
  titleClassName,
  subTitle,
}: IPContractOverviewItemHeader) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-1">
        {icon}
        <Text text={title} fontSize={13} fontWeight="semibold" color="#FFFFFF80" className={cn(titleClassName)} />
      </div>
      {subTitle && (
        <div className="">
          <Text text={subTitle} fontSize={12} fontWeight="regular" color="#FFFFFF80" />
        </div>
      )}
    </div>
  )
}

ContractOverviewItemHeader.displayName = 'ContractOverviewItemHeader'

interface IPContractOverviewItemContent {
  value: string
  subValue?: string
  className?: string
  valueClassName?: string
  subValueClassName?: string

  extraInfor?: boolean
  extraInforTitle?: string
  extraInforPercent?: string
  extraInforClassName?: string
  extraInforType?: 'purple' | 'green'

  showChart?: boolean
}
const ContractOverviewItemContent = ({
  value,
  subValue,
  className,
  valueClassName,

  extraInfor,
  extraInforType = 'green',
  extraInforTitle,
  extraInforPercent,
  subValueClassName,
  extraInforClassName,

  showChart,
}: IPContractOverviewItemContent) => {
  const handleSetColor = () => {
    if (extraInforType === 'green') {
      return {
        bg: 'bg-[#00FFB414]',
        text: '#00FFB4',
      }
    }
    return {
      bg: 'bg-[#AB57FF24]',
      text: '#AB57FF',
    }
  }

  return (
    <div>
      <div className={cn('flex items-center justify-between mt-1.5 min-w-[138px]', className)}>
        <div className="flex flex-col">
          <Text text={value} fontSize={13} fontWeight="medium" className={cn('w-max', valueClassName)} />
          {subValue && (
            <div className="">
              <Text
                text={subValue}
                fontSize={12}
                fontWeight="regular"
                color="#FFFFFF80"
                className={cn('w-max', subValueClassName)}
              />
            </div>
          )}
        </div>
        {showChart && (
          <div className="w-[100px] -my-8 -mr-[9px]">
            <ApexLineChart />
          </div>
        )}
        {extraInfor && (
          <div
            className={cn(
              'rounded-full p-2 flex justify-center items-center flex-col size-[50px]',
              extraInforClassName,
              handleSetColor().bg,
            )}
          >
            <div className="flex items-end">
              <Text text={extraInforPercent ?? ''} fontSize={11} fontWeight="semibold" color={handleSetColor().text} />
              <Text text={'%'} fontSize={8} fontWeight="regular" color={handleSetColor().text} className="pl-0.5" />
            </div>
            <Text text={extraInforTitle ?? ''} fontSize={8} fontWeight="regular" color={handleSetColor().text} />
          </div>
        )}
      </div>
    </div>
  )
}
ContractOverviewItemContent.displayName = 'ContractOverviewItemContent'

interface IPContractOverviewItemFooter {
  className?: string
  value: number
}

const ContractOverviewItemFooter = ({ ...props }: IPContractOverviewItemFooter) => {
  const { className, value } = props

  // const dotPosition = useMemo(() => {
  //   // Convert 0-100 range to -140 to 140 degrees (280 degree arc)
  //   const angle = -140 + (value / 100) * 280

  //   console.log(angle, 'angle');

  //   // Convert angle to radians
  //   const radians = (angle * Math.PI) / 180
  //   // Calculate position on the ellipse
  //   // The ellipse is 78.19px wide and 52px high
  //   const ellipseWidth = 78.19
  //   const ellipseHeight = 52

  //   // Radius of the ellipse at the given angle
  //   // For an ellipse, the radius varies based on the angle
  //   const radiusX = ellipseWidth / 2
  //   const radiusY = ellipseHeight / 2

  //   // Position of the dot
  //   const x = radiusX * Math.cos(radians) + radiusX
  //   const y = radiusY * Math.sin(radians) + radiusY

  //   return { x, y }
  // }, [value])

  return (
    <div className={cn('flex items-center justify-center flex-col relative', className)}>
      <Text text="恐惧与贪婪指数" fontSize={12} color="#FFFFFF80" className="mb-2" />
      <div className="relative bg-size-[100%_100%] bg-no-repeat bg-[url('/images/futuresDiscover/ellipse-stroke.png')] w-[78.19px] h-[52px]">
        <img
          src="/images/futuresDiscover/ellipse-dot.png"
          className="size-[9.44px] absolute top-[4%] translate-y-[-50%] left-[43%]"
          alt="icon ellipse dot"
        />
        <div className="flex items-center justify-end flex-col h-full">
          <Text text={`${value}`} fontSize={18} fontWeight="semibold" />
          <Text text={'中性的'} color="#FFFFFFB2" fontSize={10} fontWeight="light" />
        </div>
      </div>
    </div>
  )
}

ContractOverviewItemFooter.displayName = 'ContractOverviewItemFooter'

export { ContractOverviewItem, ContractOverviewItemHeader, ContractOverviewItemContent, ContractOverviewItemFooter }
