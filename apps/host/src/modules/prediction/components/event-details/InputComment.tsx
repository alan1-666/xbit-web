import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { futureClient } from '@/lib/gql/apollo-client'
import { useQuery } from '@apollo/client/react/hooks/useQuery'
import { getSmartMoneyInfoV2 } from '@/services/copytrade.service'
import { getChainType } from '@/utils/list-coin-helper'
import { useAppSelector } from '@/redux/store'
import { useState, useRef, useMemo, useEffect } from 'react'
import debounce from 'lodash/debounce'
import { useCreateCommentMutation } from '../../hooks/useCreateCommentMutation'
import { CommentSource, CommentType } from '@/@generated/gql/graphql-prediction'

import { useTranslation } from 'react-i18next'
import { predictionSelectors } from '../../slices/prediction.slice'
import { toast } from 'sonner'

const InputComment = ({
  order,
  parentId,
  type,
  parentCommentId,
  parentCommentSource,
  replyUserName,
  replyProxyWallet,
  placeholder,
  onPostSuccess,
}: {
  order: string
  parentId: string
  type: CommentType
  replyUserName?: string
  replyProxyWallet?: string
  parentCommentId?: string
  placeholder?: string
  parentCommentSource?: CommentSource
  onPostSuccess?: () => void
}) => {
  const [comment, setComment] = useState('')
  const { mutate: createComment, isPending: isCreating } = useCreateCommentMutation({ order })
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const currentProxyWallet = useSelector(predictionSelectors.selectCurrentProxyWallet)

  const { t } = useTranslation()
  const { data } = useQuery(getSmartMoneyInfoV2, {
    variables: { req: { address: activeWallet?.walletAddress, chain: getChainType(activeChain) } },
    client: futureClient,
    skip: !activeWallet?.walletAddress,
  })
  const onPostComment = (parentCommentId?: string) => {
    if (isCreating || comment.trim().length === 0) return
    if (!activeWallet?.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      return
    }
    const input = {
      body: comment,
      type,
      parentId,
      profileImage: data?.getSmartMoneyInfo?.avatar || '',
      profileName: data?.getSmartMoneyInfo?.name || '',
      parentCommentId,
      proxyWallet: currentProxyWallet,
      parentCommentSource,
      replyUserName,
      replyProxyWallet,
    }
    createComment(
      { input },
      {
        onSuccess: () => {
          setComment('')
          onPostSuccess?.()
        },
        onError: (error) => {
          console.error('Failed to create comment:', error)
        },
      },
    )
  }

  const onPostCommentRef = useRef(onPostComment)
  onPostCommentRef.current = onPostComment

  const debouncedOnPostComment = useMemo(
    () =>
      debounce(
        (id?: string) => {
          onPostCommentRef.current(id)
        },
        300,
        { leading: true, trailing: false },
      ),
    [],
  )

  useEffect(() => {
    return () => debouncedOnPostComment.cancel()
  }, [debouncedOnPostComment])
  return (
    <InputGroup>
      <InputGroupInput
        maxLength={3000}
        placeholder={placeholder}
        value={comment}
        disabled={isCreating}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            debouncedOnPostComment(parentCommentId)
          }
        }}
      />
      <InputGroupAddon align={'inline-end'}>
        <div
          onClick={() => debouncedOnPostComment(parentCommentId)}
          className={cn(comment.trim().length && !isCreating ? 'cursor-pointer' : 'cursor-auto opacity-50')}
        >
          {t('prediction.comments.post')}
        </div>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default InputComment
