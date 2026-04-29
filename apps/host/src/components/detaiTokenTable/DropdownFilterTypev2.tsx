import { cn } from '@/lib/utils'
import { Ref, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react'
import Text from '../common/Text'
import { useDetailTokenTableContext } from './DetailTokenTableContext'

export type TypeFilterDropdownHandle = {
  open: (targetElement: HTMLElement) => void
  close: () => void
}

interface TypeFilterDropdownProps {
  ref?: Ref<TypeFilterDropdownHandle>
}

const TypeFilterDropdownv2 = ({ ref }: TypeFilterDropdownProps) => {
  const { currentType, listTabs, updateCurrentType } = useDetailTokenTableContext()
  const [isOpen, setIsOpen] = useState(true)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  const openDropdown = useCallback((targetElement: HTMLElement) => {
    console.log('run thisÏ')

    const rect = targetElement.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    console.log({ rect, scrollTop, scrollLeft })

    setPosition({
      top: rect.bottom + scrollTop + 4,
      left: rect.left + scrollLeft,
    })
    setIsOpen(true)
  }, [])

  useImperativeHandle(ref, () => ({
    open: openDropdown,
    close: closeDropdown,
  }))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeDropdown])

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        closeDropdown()
      }
    }

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, closeDropdown])

  console.log(isOpen, 'isOpen')

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] w-[180px] bg-[#232329] p-[6px] border border-[#ECECED0A] rounded-md shadow-lg"
      style={{
        top: 0,
        left: 0,
        // top: position.top,
        // left: position.left,
      }}
    >
      {listTabs.map((e) => (
        <div
          key={e.value}
          className={cn(
            'hover:bg-[#ECECED14] cursor-pointer px-2 py-1 rounded text-center',
            currentType === e.value && 'bg-[#ECECED14]',
          )}
          onClick={() => {
            updateCurrentType(e.value)
            closeDropdown()
          }}
        >
          <Text text={e.label as string} className="!font-[330] text-center mx-auto" />
        </div>
      ))}
    </div>
  )
}

export default TypeFilterDropdownv2
