import ButtonFilter from './ButtonFilter'
import { cn } from '@/lib/utils'

export default function OptionsBar() {
  return (
    <div className={cn('flex items-center pr-2 sticky top-0 right-0 z-10 bg-[#0A0A0A] h-7.5 w-8')}>
      <ButtonFilter />
    </div>
  )
}
