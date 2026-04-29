import { useEventComments } from '@/modules/prediction/hooks/useEventComments.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { CommentItem } from '@/modules/prediction/components/event-details/CommentItem.tsx'
import { CommentWithReplies } from '@/modules/prediction/models/CommentModel.ts'
import { useMemo, useRef, useState } from 'react'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { CommentType } from '@/@generated/gql/graphql-prediction.ts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loading } from '@/components/common/Loading'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import InputComment from './InputComment'
import { useTranslation } from 'react-i18next'

export const TabComments = () => {
  const { event } = useEventDetailsPageContext()
  const { t } = useTranslation()
  const commentTabRef = useRef<HTMLDivElement>(null)
  // const scrollToTopBtn = useRef<HTMLButtonElement>(null)
  const [selectedSort, setSelectedSort] = useState<string>('created_at')

  const sortOptions = useMemo(
    () => [
      { label: t('prediction.comments.sortBy.newest'), value: 'created_at' },
      { label: t('prediction.comments.sortBy.mostLiked'), value: 'reaction_count' },
    ],
    [t],
  )

  const input = useMemo(() => {
    const series = event?.series ? event.series[0] : null
    if (series) {
      return {
        entityId: series?.id || '',
        entityType: CommentType.Series,
        order: selectedSort,
      }
    }
    return {
      entityId: event?.id || '',
      entityType: CommentType.Event,
      order: selectedSort,
    }
  }, [event?.id, event?.series, selectedSort])
  const { data, isPending, loadMore, isFetchingNextPage, hasNextPage } = useEventComments(input)

  const tree = useMemo(() => {
    if (!data) return []
    const map = new Map<string, CommentWithReplies>()
    const roots: CommentWithReplies[] = []
    data.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] as CommentWithReplies[] })
    })
    map.forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = map.get(comment.parentCommentId)
        if (parent) {
          parent.replies.push(comment)
        }
      } else {
        roots.push(comment)
      }
    })
    return roots
  }, [data])

  const loadMoreComment = () => {
    if (!isFetchingNextPage) {
      loadMore()
    }
  }

  // useEffect(() => {
  //   const container = document.getElementById('desktop-layout-content')
  //   container?.classList.remove('overflow-y-auto')
  //   const handleScroll = () => {
  //     if (window.scrollY > 1000) {
  //       if (scrollToTopBtn.current) {
  //         scrollToTopBtn.current.style.display = 'flex'
  //       }
  //     } else {
  //       if (scrollToTopBtn.current) {
  //         scrollToTopBtn.current.style.display = 'none'
  //       }
  //     }
  //   }
  //   window.addEventListener('scroll', handleScroll)
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll)
  //     container?.classList.add('overflow-y-auto')
  //   }
  // }, [])

  // const scrollToTop = () => {
  //   document.documentElement.scrollTo({
  //     top: 0,
  //     left: 0,
  //     behavior: 'smooth',
  //   })
  // }
  return (
    <>
      <InputComment
        order={input.order}
        parentId={input.entityId}
        type={input.entityType}
        placeholder={t('prediction.comments.addCommentPlaceholder')}
      />
      <div ref={commentTabRef} className="w-full py-4 max-w-full">
        <div className="mb-6">
          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Min balance" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {'amount' in option ? <span className="flex items-center gap-1">{option.label}</span> : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <>
          {isPending ? (
            <div className="space-y-4 max-w-full">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="flex gap-4" key={index}>
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="flex-1 h-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {tree.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  order={input.order}
                  parentId={input.entityId}
                  type={input.entityType}
                />
              ))}
              {tree.length === 0 && (
                <div className="text-center text-[#FFFFFF80] py-10">{t('prediction.comments.noComments')}</div>
              )}
            </div>
          )}
          {!isPending && hasNextPage && (
            <div className="w-full flex justify-center mt-4">
              {isFetchingNextPage ? (
                <>
                  <Loading />
                </>
              ) : (
                <button onClick={loadMoreComment} className="rounded-xl px-8 py-2 border border-[#292929]">
                  {t('prediction.comments.showMore')}
                </button>
              )}
            </div>
          )}
        </>
      </div>
      {/* <div
        className="fixed hidden gap-1 items-center justify-center z-30 left-[calc(50vw-16.375rem)] w-fit text-sm px-3 py-2 rounded-4xl bg-[#292929] text-white bottom-20 cursor-pointer"
        onClick={scrollToTop}
      >
        Back to top <BackToTopIcon />
      </div> */}
    </>
  )
}
