import { Link, LinkProps } from 'react-router-dom'

export interface LinkCTAProps extends LinkProps {
  text: string
}

export const LinkCTA = (props: LinkCTAProps) => {
  const { text, ...rest } = props
  return (
    <Link
      className="purple-btn-gradient !max-h-[42px] mt-4 text-white text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))] p-[13px_12.5px] rounded-[50px]"
      {...rest}
    >
      {text}
    </Link>
  )
}
