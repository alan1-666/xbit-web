import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { memo } from 'react'
import Slider, { Settings } from 'react-slick'
import Text from '../common/Text'
import FeatureToggles from './feature-toggles'
import SignalSlick from './signal-slick'
import Slider, { Settings } from 'react-slick'


const Signal = () => {
  const features = [
    { id: '24h', label: '24小时监控', checked: true },
    { id: 'realtime', label: '实时推送', checked: true },
    { id: 'highlow', label: '高抛低吸', checked: false },
  ]

  const handleChange = (id: string, checked: boolean) => {
    console.log(`Option ${id} changed to ${checked}`)
  }

  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    arrows: false,
    customPaging: function () {
      return <a className="block size-[4px] rounded-full bg-[#FFFFFF5C] active-paging transition-all duration-500" />
    },
    dotsClass: 'slick-dots',
  }

  return (
    <div className={cn('Signal-header -mt-3 z-2 relative rounded-tl-[8px] rounded-tr-[8px] p-3 mb-5')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <Text text="信号" fontSize={20} fontWeight="semibold" color="#FFFFFF" className="pr-3" />
          <Text text="发现潜力机会，追求高收益" fontSize={14} color="#FFFFFFB2" />
        </div>
        <ChevronRight className="size-4 text-[#B9B9B9]" />
      </div>

      <FeatureToggles options={features} onChange={handleChange} />

      <Slider {...settings} className="custom-slider">
        <div className="flex flex-1">
          <SignalSlick />
        </div>
        <div className="flex flex-1">
          <SignalSlick />
        </div>
        <div className="flex flex-1">
          <SignalSlick />
        </div>
        <div className="flex flex-1">
          <SignalSlick />
        </div>
        <div className="flex flex-1">
          <SignalSlick />
        </div>
      </Slider>
    </div>
  )
}

export default memo(Signal)
