export interface BreakingIndexProps {
  index: number
}

export const BreakingIndex = (props: BreakingIndexProps) => {
  const { index } = props
  return <div className="text-sm text-[#908E98] font-normal min-w-5 mr-1">{index + 1}</div>
}
