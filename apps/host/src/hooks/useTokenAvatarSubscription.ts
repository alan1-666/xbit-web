import { useSubscription } from '@/lib/mqtt'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectTokenAvatarByAddress, tokenAvatarsActions } from '@/redux/modules/tokenAvatars.slice.ts'
import { useAppDispatch } from '@/redux/store'

export interface UseTokenAvatarSubscriptionOptions {
  defaultAvatar?: string
  topic: string
  enabled?: boolean
}

export interface RealtimeAvatar {
  tokenAddress: string
  thumbnailUrl: string
  avatarUrl: string
}

export const useTokenAvatarSubscription = (options: UseTokenAvatarSubscriptionOptions) => {
  const { topic, defaultAvatar, enabled = true } = options
  const { message } = useSubscription(topic, {
    shouldSkip: !topic || !enabled,
    clientType: 'public',
  })
  // topic is like: public/meme/token_image/${token.chainId}/${token.token}
  const tokenAddress = topic.split('/').pop() || ''
  const dispatch = useAppDispatch()
  const avatar = useSelector(selectTokenAvatarByAddress(tokenAddress))
  const setAvatar = useCallback((realtimeAvatar: RealtimeAvatar) => {
    dispatch(
      tokenAvatarsActions.setTokenAvatar({
        tokenAddress: tokenAddress,
        avatarUrl: realtimeAvatar.avatarUrl,
        thumbnailUrl: realtimeAvatar.thumbnailUrl,
      }),
    )
  }, [])

  useEffect(() => {
    const msg = message?.message
    if (!msg) return
    const data = JSON.parse(msg.toString()) as RealtimeAvatar[]
    if (!data || data.length === 0) return
    const realtimeAvatar = data[0]
    setAvatar({
      tokenAddress: tokenAddress,
      thumbnailUrl: realtimeAvatar.thumbnailUrl,
      avatarUrl: realtimeAvatar.avatarUrl,
    })
  }, [message])

  return {
    avatarUrl: avatar?.avatarUrl || defaultAvatar,
    thumbnailUrl: avatar?.thumbnailUrl || defaultAvatar,
  }
}

export const useTokenAvatarsSubscriptions = (topics: string[]) => {
  const dispatch = useAppDispatch()
  const { message } = useSubscription(topics, {
    shouldSkip: topics.length === 0,
  })
  useEffect(() => {
    const msg = message?.message
    const topic = message?.topic
    if (!msg || !topic) return
    const tokenAddress = topic.split('/').pop() || ''
    if (!tokenAddress || tokenAddress.length === 0) return
    const data = JSON.parse(msg.toString()) as RealtimeAvatar[]
    if (!data || data.length === 0) return
    const realtimeAvatar = data[0]
    dispatch(
      tokenAvatarsActions.setTokenAvatar({
        tokenAddress: tokenAddress,
        avatarUrl: realtimeAvatar.avatarUrl,
        thumbnailUrl: realtimeAvatar.thumbnailUrl,
      }),
    )
  }, [message])
}
