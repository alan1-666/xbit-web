import { HTMLProps, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ImgWithFallbackProps {
  src: string
  srcFallback: string
  containerClassName?: HTMLProps<HTMLElement>["className"]
  className?: HTMLProps<HTMLElement>["className"]
  sharedClassName?: HTMLProps<HTMLElement>["className"],
  loadedClassName?: string
}

const ImgWithFallback: React.FC<ImgWithFallbackProps> = ({ src, srcFallback, containerClassName, className, sharedClassName, loadedClassName = '' }) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const imgFallbackRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setLoaded] = useState(false)

  const handleImgLoad = () => {
    setLoaded(true)
  }

  const handleImgError = () => {
    if (!imgRef.current) return

    imgRef.current.classList.add('invisible')
    imgRef.current.classList.add('opacity-[0]')
    imgRef.current.onerror = null

    if (!imgFallbackRef.current) return
    
    imgFallbackRef.current.classList.remove('invisible')
    imgFallbackRef.current.classList.remove('opacity-[0]')
  }

  return (
    <div
      className={cn(
        'relative inline-block',
        
        containerClassName,
      )}
    >
      <img
        ref={imgRef}
        src={src}
        onLoad={handleImgLoad}
        onError={handleImgError}
        className={cn(
          'max-w-[100%]',
          loadedClassName && isLoaded ? loadedClassName : '',
          sharedClassName,
          className,
          
        )}
        alt=""
      />
      <img
        ref={imgFallbackRef}
        src={srcFallback}
        className={cn(
          'invisible opacity-[0] absolute top-0 left-0',
          sharedClassName,
        )}
        alt=""
      />
    </div>
  )
}

export default ImgWithFallback
