import { useRef, useEffect, useState, Ref, ReactNode } from 'react'
import { Skeleton } from '@components/ui/skeleton.tsx'

const childDivIdentifyingAttribute = 'twdiv'
const twScriptUrl = 'https://platform.twitter.com/widgets.js'
const twScriptWindowFieldName = 'twttr'

const options = {
  theme: 'dark',
  cards: 'hidden',
  conversation: 'none',
}

type UseTwitterWidgetReturn = {
  ref: Ref<HTMLDivElement>
  error: Error | null
  loading: boolean
}

function loadTwitterLibrary() {
  if (!(window as any)[twScriptWindowFieldName]) {
    const script = document.createElement('script')
    script.src = twScriptUrl
    script.async = true
    document.body.appendChild(script)
  }
}

export function twWidgetFactory(timeout: number = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    loadTwitterLibrary()
    const checkTwitterLibrary = () => {
      if ((window as any)[twScriptWindowFieldName]) {
        resolve((window as any)[twScriptWindowFieldName].widgets)
      } else {
        timeout -= 100
        if (timeout <= 0) {
          reject(new Error('Twitter library loading timed out'))
          return
        }
        setTimeout(checkTwitterLibrary, 100)
      }
    }
    checkTwitterLibrary()
  })
}

function useTwitterWidget(tweetId: string): UseTwitterWidgetReturn {
  const [error, setError] = useState<Error | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setError(null)
    let isCanceled = false

    if (ref.current) {
      ref.current.innerHTML = ''

      const childEl = document.createElement('div')
      childEl.setAttribute(childDivIdentifyingAttribute, 'yes')
      ref.current.appendChild(childEl)

      twWidgetFactory()
        .then((wf: any) => wf.createTweet(tweetId, childEl, options))
        .then((resultMaybe) => {
          if (!resultMaybe && !isCanceled) {
            throw new Error('Twitter could not create widget. Check tweetId.')
          }

          if (isCanceled && childEl) {
            childEl.remove()
          }
          setLoading(false)
        })
        .catch((e: any) => {
          console.error(e)
          setError(e)
        })
    }

    return () => {
      isCanceled = true
    }
  }, [tweetId, setLoading])

  return { ref, error, loading }
}

interface TweetProps {
  tweetId: string
  renderError?: (e: Error) => ReactNode
}

export const EmbeddedTweet = ({ tweetId, renderError }: TweetProps) => {
  const { ref, error, loading } = useTwitterWidget(tweetId)
  return (
    <>
      <div className="h-full w-full max-h-[40vh] overflow-y-scroll no-scrollbar" ref={ref}>
        {error && renderError?.(error)}
      </div>
      {loading && (
        <div className="w-full bg-[#15202b] px-4 py-3 border border-[#425364] rounded-[12px]">
          <Skeleton className="w-full h-32" />
          <hr className="my-2" />
          <Skeleton className="w-full h-12" />
        </div>
      )}
    </>
  )
}
