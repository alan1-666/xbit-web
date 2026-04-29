import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { cn } from '@/lib/utils.ts'
import { Options } from 'qr-code-styling/lib/types'

export interface QRCodeProps {
  text: string
  className?: string
  options?: Options
}

const qrCodeInstance = new QRCodeStyling({
  width: 200,
  height: 200,
  type: 'svg',
  image: '/images/xbit-logo-rounded.svg',
  margin: 0,
  dotsOptions: {
    type: 'extra-rounded',
  },
  backgroundOptions: {
    color: '#fff',
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 2,
  },
  cornersSquareOptions: {
    type: 'extra-rounded',
  },
})

export const QRCode = (props: QRCodeProps) => {
  const { text, className, options = {} } = props
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    qrCodeInstance.append(container)
    return () => {
      container.innerHTML = ''
    }
  }, [containerRef.current])

  useEffect(() => {
    qrCodeInstance.update({
      data: text,
      ...options,
    })
  }, [text, options])

  return <div className={cn('rounded-[20px] size-[200px] overflow-clip', className)} ref={containerRef} />
}
