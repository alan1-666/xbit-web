import { ReactNode, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { IconCheckCircleSolid } from '@components/icon'
import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'

export interface SelectableDrawerProps<T> {
  children: ReactNode
  title: string
  list: T[]
  renderItem: (item: T) => ReactNode
  defaultSelectedIndex?: number
  onItemClick?: (item: T, index: number) => void
}

export const SelectableDrawer = <T,>(props: SelectableDrawerProps<T>) => {
  const { children, title, list, renderItem, defaultSelectedIndex, onItemClick } = props
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex)
  const handleItemClick = (index: number) => {
    setOpen(false)
    setSelectedIndex(index)
    if (onItemClick) {
      onItemClick(list[index], index)
    }
  }
  return (
    <>
      <div onClick={() => setOpen(!open)}>{children}</div>
      <AppDrawer
        open={open}
        setOpen={setOpen}
        title={title}
        drawerContentClassName="h-full pb-6 max-h-[75vh]"
        drawerContent={
          <div>
            {list.map((item, index) => (
              <div
                key={index}
                className="py-3.5 w-full flex items-center justify-between gap-2 cursor-pointer"
                onClick={() => handleItemClick(index)}
              >
                {renderItem(item)}
                <AnimatePresence>
                  {selectedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <IconCheckCircleSolid />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        }
      />
    </>
  )
}
