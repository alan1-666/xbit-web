interface TopInfoProps {
  text: string
}
const TopInfo = ({text}: TopInfoProps) => {
  return (
    <div className='mb-3 rounded-[4px] px-[10px]'>
      <div className="py-1.5  flex items-center  bg-[#9945FF14] ">
        <img className="mr-1" src="/images/futuresDetail/danger-icon.svg" alt=""/>
        <div className="flex-1 text-[calc(1rem*(12/16))] leading-[calc(1rem*(16/16))] text-[#FFFFFFCC]">
          {text}
        </div>
      </div>
    </div>
  )
    
}
export default TopInfo