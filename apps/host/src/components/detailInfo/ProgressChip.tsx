type ProgressChipProps = {
  progress: number;
}

const ProgressChip = ({progress}: ProgressChipProps) => {
  return (
    <div
      className="rounded-[50px] bg-[#00FFB433] w-[20px] min-w-[20px] max-w-[20px] h-[4px] relative"
    >
      <div
        className="rounded-[50px] absolute top-0 left-0 bottom-0 bg-[#00CE89]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  )
}

export default ProgressChip
