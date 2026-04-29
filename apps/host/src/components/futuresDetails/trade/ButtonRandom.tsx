import { cn } from '@/lib/utils.ts'
import { CheckboxXbit } from '@components/ui/checkbox-xbit.tsx'

interface IPButtonRandomize {
  className?: string
  handleChangeRandomize: (randomize: boolean) => void
  randomize: boolean
}

const ButtonReducePosition = ({ className, handleChangeRandomize, randomize }: IPButtonRandomize) => {
  return (
    <div
      className={cn('flex items-center', className)}
      onClick={() => {
        handleChangeRandomize(!randomize)
      }}
    >
      <CheckboxXbit checked={randomize} className="cursor-pointer mr-1"></CheckboxXbit>
      <span className="text-[calc(1rem*(10/16))] leading-[1] text-[#FFFFFFB2]">随机执行</span>
    </div>
  )
}
export default ButtonReducePosition
