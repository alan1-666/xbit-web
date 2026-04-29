export const ButtonGhost = ({
  label,
  icon,
  prefix,
  onClick,
  ref,
}: {
  label?: string
  icon?: React.ReactNode
  prefix?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  ref?: React.Ref<HTMLButtonElement>
}) => {
  return (
    <button 
      className="px-3 py-2.5 rounded-md bg-[#472468] hover:bg-[#6F3FF5] text-[13px] grid grid-flow-col auto-cols-max gap-2 items-center"
      onClick={onClick}
      ref={ref}
    >
      {icon}
      {prefix && <span className="opacity-80">{prefix}</span>}
      {label && <span>{label}</span>}
    </button>
  )
}
