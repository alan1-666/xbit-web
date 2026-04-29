import Tag from '../common/Tag'
import Text from '../common/Text'
import { Button } from '../ui/button'

const SignalSlick = () => {
  return (
    <div className=" w-full relative h-[208px] max-w-[505px] mx-auto">
      <div className="size-full relative p-3 z-10 bg-black overflow-hidden rounded-[10px] ">
        <div className="size-full bg-[url('/images/futuresDiscover/subtract_2.png')] bg-no-repeat bg-cover z-0 absolute bottom-0 left-0" />
        <div className="size-full bg-[url('/images/futuresDiscover/subtract-1.png')] bg-no-repeat bg-cover z-0 absolute bottom-0 left-0" />
        <div className="size-full bg-[url('/images/futuresDiscover/rectangle-34627152.svg')] bg-no-repeat bg-contain z-0 absolute bottom-0 left-0" />
        <div className="size-full bg-[url('/images/futuresDiscover/group_1430104969.png')] bg-no-repeat bg-cover z-0 absolute bottom-0 left-0" />
        <div className="size-full z-0 absolute inset-0 bg-[#23585F33] scale-x-100" />
        <div className="size-full bg-[url('/images/futuresDiscover/ellipse-7552.svg')] bg-no-repeat bg-contain z-0 absolute inset-0 bg-center top-[59%] h-[50%]" />
        <div className="size-full bg-[url('/images/futuresDiscover/ellipse-7553.svg')] bg-no-repeat bg-contain z-0 absolute inset-0 bg-center top-[17%] h-[100%]" />

        {/* <div className="size-full bg-[url('/images/futuresDiscover/subtract-bottom.svg')] bg-no-repeat bg-contain z-0 absolute bottom-[-89%] left-0 scale-x-[100.5%]" /> */}
        <div className="flex justify-between items-center relative z-2">
          <div className="flex gap-2">
            <Text text="哪吒3号" fontSize={20} fontWeight="semibold" className="z-1" />
            <Tag label="自动抄底逃项" color="#00FFF6" containerClassName="text-[calc(1rem*(13/16))] pt-1" />
          </div>
          <div className="flex items-center gap-[30px]  text-[calc(13rem/16)] leading-[calc(13rem/16)]">
            <p className="flex items-center">
              <img src="/images/futuresDetail/running-icon.svg" className="mr-1.5" alt="icon running" />
              运行中
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-5 z-2 relative">
          <div className="flex justify-center items-end ">
            <Text
              text="+78.45"
              fontSize={32}
              color="#00FFB4"
              fontWeight="semibold"
              className="text-center leading-[1]"
            />
            <Text text="%" fontSize={16} color="#00FFB4" fontWeight="medium" className="text-center leading-[1] pl-1" />
          </div>
          <Text text="近1月收益率" color="#FFFFFFB2" className="text-center" />
          <Button variant="gradient" className="rounded-full text-[#141414] w-full max-w-[200px] mx-auto" type="button">
            立即下单
          </Button>
        </div>
      </div>
      <div className="sadasdas absolute w-full left-0 z-0 rounded-[10px] top-[-8%] scale-x-[100.28%] h-[20px]" />
    </div>
  )
}

export default SignalSlick
