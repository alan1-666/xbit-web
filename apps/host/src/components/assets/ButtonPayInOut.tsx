import ButtonGradient from '@components/common/buttons/ButtonGradient.tsx'
const ButtonPayInOut = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ButtonGradient type="submit" className="rounded-full font-normal w-full hover-scale ">
        <div className="flex items-center text-[calc(18rem/16)] leading-[calc(18rem/16)]">
          <img src='/images/assets/down-arrow-icon.svg' className='mr-1' alt=''/>
          充值
        </div>
      </ButtonGradient>

      <ButtonGradient type="submit" className="rounded-full w-full font-normal  hover-scale">
        <div className="flex items-center text-[calc(18rem/16)] leading-[calc(18rem/16)]">
          <img src='/images/assets/down-arrow-icon.svg' className='mr-1 rotate-180' alt=''/>
          提现
        </div>
      </ButtonGradient>
    </div>
  )
}
export default ButtonPayInOut
