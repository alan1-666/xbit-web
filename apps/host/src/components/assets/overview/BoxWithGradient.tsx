import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface BoxWithGradientProps {
  header: React.ReactNode
  content: React.ReactNode
  containerClassName?: string
  isExpand?: boolean
}
const BoxWithGradient = ({ header, content, containerClassName, isExpand }: BoxWithGradientProps) => {
  return (
    <div
      className={cn(
        'relative rounded-[12px] border bg-[linear-gradient(105.98deg,#9945FF05_46.27%,#01FFB520_93.65%)] overflow-hidden',
        containerClassName,
      )}
    >
      <div className="">{header}</div>

      <AnimatePresence>
        {isExpand && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 bg-[#14141480] rounded-[12px] pt-3.5">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default BoxWithGradient
