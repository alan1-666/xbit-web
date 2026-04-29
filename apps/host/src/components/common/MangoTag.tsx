type MangoTagProps = {
  value: string,
}

const MangoTag = ({value}: MangoTagProps) => {
  return (
    <div
      className="px-[4px] py-[2px] rounded-tl-[4px] rounded-tr-[2px] rounded-br-[4px] bg-[linear-gradient(45deg,#5F18C0,#09AC78)] relative app-font-medium text-[calc(1rem*(9/16))] text-white leading-[1]"
    >
      <div
        className="rounded-tl-[4px] rounded-tr-[2px] rounded-br-[4px] absolute top-0 left-0 bottom-0 right-0 border-[1px] border-[#ECECED1F]"
      />
      <span className="inline-block relative top-[-1px]">{value}</span>
    </div>
  )
}

export default MangoTag
