import React, { useRef, useState, useCallback, memo, useEffect, useMemo } from 'react'
import { toPng } from 'html-to-image'
import ListAppShare from '@components/common/share/listAppShare.tsx'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ShareContentProps = {
  fileName?: string
  text?: string
  url?: string
  children?: React.ReactNode
  hideSaveButton?: boolean
  classContent?: string
  classNameWrapper?: string
  t: (key: string) => string
}

const ShareContent = memo(
  ({ fileName, text, url, children, hideSaveButton, classContent, classNameWrapper, t }: ShareContentProps) => {
    const posterRef = useRef<HTMLDivElement>(null)
    const [saving, setSaving] = useState<boolean>(false)
    const layoutStableRef = useRef<boolean>(false)

    const waitForLayoutStable = useCallback(async (container: HTMLElement): Promise<void> => {
      if (layoutStableRef.current) return
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve)
          })
        })
      })

      // Trigger layout recalculation
      void container.offsetHeight

      // Wait for styles to fully apply
      await new Promise((resolve) => setTimeout(resolve, 100))

      layoutStableRef.current = true
    }, [])

    // const waitForImages = useCallback(async (container: HTMLElement): Promise<void> => {
    //   if (imagesLoadedRef.current) return

    //   const images = container.querySelectorAll('img')
    //   const promises = Array.from(images).map((img) => {
    //     if (img.complete && img.naturalHeight !== 0) return Promise.resolve()
    //     return new Promise((resolve) => {
    //       img.onload = () => resolve(true)
    //       img.onerror = () => resolve(true)
    //       setTimeout(() => resolve(true), 4000)
    //     })
    //   })
    //   await Promise.all(promises)

    //   imagesLoadedRef.current = true
    // }, [])

    const customShareUrl = useMemo(() => {
      return `${text}\n${url}`
    }, [url, text])

    const onSave = useCallback(async () => {
      if (!posterRef.current) return

      try {
        setSaving(true)

        await waitForLayoutStable(posterRef.current)

        const dataUrl = await toPng(posterRef.current, {
          quality: 0.9,
          pixelRatio: 2,
          cacheBust: false,
          includeQueryParams: true,
          skipFonts: true,
          width: posterRef.current.offsetWidth,
          height: posterRef.current.offsetHeight,
        })

        const link = document.createElement('a')
        link.download = fileName ? `${fileName}.png` : 'poster.png'
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Error saving image:', error)
        toast.error(t('toast.saveFailed'))
      } finally {
        setSaving(false)
      }
    }, [fileName, waitForLayoutStable])

    return (
      <>
        <div
          className={cn(
            'overflow-y-auto overflow-x-hidden py-2 w-full h-full max-h-[calc(80vh-150px)] px-2',
            classContent,
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center h-fit w-full max-w-[350px] md:max-w-[450px] m-auto',
              classNameWrapper,
            )}
          >
            <div
              className="bg-[#232329] border-[0.5px] border-[#843BEA] rounded-[20px] flex items-center flex-col justify-center pointer-events-none w-full overflow-hidden"
              ref={posterRef}
              id="posterRef"
            >
              <div className="flex-1 flex items-center justify-center p-0 w-full overflow-hidden">{children}</div>
              <div className="w-full flex items-center justify-center gap-3.5 bg-[url('/images/map.png')] bg-cover bg-[#8159DE24] border-t-[0.5px] border-[#843BEA] p-3">
                <img className="w-[39px] h-[36px]" src="/images/xbit-logo.svg" alt="logo xbit" />
                <div>
                  <img src="/images/logo-xbit-text.svg" alt="logo xbit text" />
                  <span className="app-font-regular text-[calc(1rem*(12/16))] text-[#FFFFFFB2] leading-3 tracking-[1.63px] whitespace-nowrap">
                    {t('detail.myPositions.decentralizedExchange')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto py-2 flex items-center justify-center">
          <div className="bg-[#79778C29] rounded-[8px] flex-1 max-w-[350px] md:max-w-[450px] m-auto">
            <ListAppShare
              onSave={onSave}
              text={text}
              url={url}
              saving={saving}
              hideSaveButton={hideSaveButton}
              customShareUrl={customShareUrl}
            />
          </div>
        </div>
      </>
    )
  },
)

ShareContent.displayName = 'ShareContent'

export default ShareContent
