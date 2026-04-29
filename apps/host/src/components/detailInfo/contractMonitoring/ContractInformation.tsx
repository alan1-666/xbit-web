export type ContractInformationProps = React.ComponentProps<'div'> & {
  type: 'danger' | 'ok',
  title: string,
  content: string,
  icon?: string
}

const iconByType: Record<string, string> = {
  danger: '/images/tokenDetail/icon-danger.svg',
  ok: '/images/tokenDetail/icon-shield.svg',
}

const ContractInformation = ({type, title, content, ...rest}: ContractInformationProps) => {
  return (
    <div {...rest}>
      <div className="flex items-center gap-[8px] mb-[10px]">
        <img src={iconByType[type]} className="w-[16px] min-1-[16px]" alt="" />
        <div className="text-[calc(1rem*(14/16))] text-white leading-none font-[330]">{title}</div>
      </div>
      <div className="rounded-[6px] bg-[#2b2b33] px-[8px] py-[6px] text-[calc(1rem*(11/16))] text-[#908e98] leading-[1.5]">{content}</div>
    </div>
  )
}

export default ContractInformation
