import { CommentWithReplies } from '@/modules/prediction/models/CommentModel.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import dayjs from 'dayjs'
import { Link, useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { useMemo, useState } from 'react'
import { HeartIcon, MessageIcon, SolidHeartIcon } from '../icons'
import InputComment from './InputComment'
import { CommentSource, CommentType, ReactionType } from '@/@generated/gql/graphql-prediction'
import { useToggleCommentReaction } from '../../hooks/useToggleCommentReaction'
import { useSelector } from 'react-redux'
import { userIdSelector } from '@/redux/modules/newAuth.slice'
import { formatHoldingDuration } from '@/utils/time'
import { formatAddressWallet } from '@/lib/string'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

export interface CommentItemProps {
  comment: CommentWithReplies
  order: string
  parentId: string
  type: CommentType
  parentTree?: CommentWithReplies
}

export const CommentItem = (props: CommentItemProps) => {
  const { comment, order, parentId, type, parentTree } = props
  const location = useLocation()
  const profile = comment.profile
  const [showReplies, setShowReplies] = useState(true)
  const userId = useSelector(userIdSelector)
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)

  const [parentCommentIds, setParentCommentIds] = useState<string[]>([])
  const { mutate: toggleCommentReaction } = useToggleCommentReaction({ order, type, parentId, userId })
  const toggleCommentReactionHandler = (commentSource: string) => {
    if (!activeWallet?.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      return
    }

    const input = {
      commentId: comment.id,
      commentSource: commentSource as CommentSource,
      reactionType: ReactionType.Heart,
    }
    toggleCommentReaction({ input })
  }

  const replyProfile = useMemo(() => {
    if (!comment.replyAddress || !parentTree) return null
    if (parentTree.profile?.baseAddress === comment.replyAddress) {
      return parentTree.profile
    }
    const replyProfile = parentTree.replies.find(
      (reply) => reply.profile?.baseAddress === comment.replyAddress,
    )?.profile
    return replyProfile
  }, [comment, parentTree])

  return (
    <div className="">
      <div className="flex items-start gap-2 md:gap-4">
        <div className="shrink-0">
          <Avatar className="size-8">
            <AvatarImage src={profile?.profileImage || undefined} className="object-cover" />
            <AvatarFallback>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 pr-2">
            <div className="flex gap-2 items-center min-w-0 flex-1">
              {!profile?.proxyWallet ? (
                <span
                  className="text-sm font-semibold text-primary max-w-30 truncate block"
                  title={profile?.name || ''}
                >
                  {profile?.name || t('prediction.comments.anonymous')}
                </span>
              ) : (
                <Link
                  to={NAVIGATIONS.prediction.portfolioUser(profile?.proxyWallet)}
                  state={{ from: location }}
                  className="min-w-0 max-w-30 truncate"
                >
                  <span className="text-sm font-semibold text-primary hover:underline" title={profile?.name || ''}>
                    {profile.name
                      ? profile.name
                      : formatAddressWallet(profile?.proxyWallet || '') || t('prediction.comments.anonymous')}
                  </span>
                </Link>
              )}
            </div>
            <p className="text-xs font-medium text-white/60 whitespace-nowrap shrink-0">
              {formatHoldingDuration(dayjs().diff(dayjs(comment.createdAt), 'seconds'))}
            </p>
          </div>
          <p className="w-full text-sm text-white/80 mt-1 wrap-break-word overflow-wrap-anywhere">
            {comment.replyAddress && comment.provider === 'polymarket' ? (
              <>
                <Link
                  to={NAVIGATIONS.prediction.portfolioUser(replyProfile?.proxyWallet || '')}
                  className="text-[#627eeb] block max-w-30 truncate"
                >
                  {replyProfile?.name
                    ? `@${replyProfile.name}`
                    : `${formatAddressWallet(replyProfile?.proxyWallet || '')}`}{' '}
                </Link>{' '}
                <br />
              </>
            ) : comment.replyProxyWallet ? (
              <>
                <Link
                  to={NAVIGATIONS.prediction.portfolioUser(comment.replyProxyWallet || '')}
                  className="text-[#627eeb] max-w-30 truncate"
                >
                  {comment.replyUsername
                    ? `@${comment.replyUsername}`
                    : `${formatAddressWallet(comment.replyProxyWallet || '')}`}{' '}
                </Link>{' '}
                <br />
              </>
            ) : (
              ''
            )}

            {comment.body}
          </p>
          <div className="mt-1.5 flex items-center gap-4">
            <div className="flex gap-1.5 items-center text-sm text-white/60">
              <div className="cursor-pointer" onClick={() => toggleCommentReactionHandler(comment.provider)}>
                {comment.reactions?.find((reaction) => reaction.userId === userId) ? (
                  <SolidHeartIcon className="animate-like" />
                ) : (
                  <HeartIcon className="animate-unlike" />
                )}
              </div>
              {comment.reactionCount || 0}
            </div>
            <div
              className="flex gap-1.5 items-center text-sm text-white/60 cursor-pointer"
              onClick={() =>
                setParentCommentIds((prev) =>
                  prev.includes(comment.id) ? prev.filter((id) => id !== comment.id) : [...prev, comment.id],
                )
              }
            >
              <MessageIcon className="w-4 h-4" />
              {t('prediction.comments.reply')}
            </div>
          </div>
          {parentCommentIds.includes(comment.id) && (
            <div className="mt-3">
              <InputComment
                order={order}
                parentId={parentId}
                type={type}
                parentCommentSource={comment.provider as unknown as CommentSource}
                parentCommentId={comment.parentCommentId ? comment.parentCommentId : comment.id}
                replyProxyWallet={comment.profile?.proxyWallet || ''}
                replyUserName={comment.profile?.name || ''}
                onPostSuccess={() => {
                  setParentCommentIds((prev) => prev.filter((id) => id !== comment.id))
                }}
              />
            </div>
          )}
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div
          className="ml-7 md:ml-9 mt-1 cursor-pointer text-xs text-white/60 mb-4 hover:bg-[#232329] w-fit px-3 py-1.5 rounded"
          onClick={() => setShowReplies(!showReplies)}
        >
          {showReplies
            ? t('prediction.comments.hideReplies', { count: comment.replies.length })
            : t('prediction.comments.showReplies', { count: comment.replies.length })}
        </div>
      )}
      {showReplies && (
        <div className="pl-8 md:pl-12 space-y-4">
          {comment.replies
            .sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf())
            .map((reply) => (
              <CommentItem
                key={reply.providerId}
                comment={reply}
                order={order}
                parentId={parentId}
                type={type}
                parentTree={comment}
              />
            ))}
        </div>
      )}
    </div>
  )
}
