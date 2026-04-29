import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { setErrorMessages } from '@/redux/modules/errorMessages.slice'
import { useAppDispatch } from '@/redux/store'
import { getErrorMessages } from '@/services/notifications.service'
import { getFromIndexedDB, saveToIndexedDB } from '@/utils/indexedDB/errorMessagesDB'
import { memo, useCallback, useEffect, useRef } from 'react'

const ErrorCodeMsgListen = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dispatch = useAppDispatch()

  const handleGetErrorMsg = useCallback(async () => {
    try {
      const response = await gqlMeme2.query({
        query: getErrorMessages,
      })
      return response.data
    } catch (error) {
      console.warn('Error fetching error messages:', error)
      return undefined
    }
  }, [])

  const handleUpdateCache = useCallback(async () => {
    const data = await handleGetErrorMsg()
    if (data) {
      dispatch(setErrorMessages({ ...data }))
      await saveToIndexedDB('errorMessages', { ...data }, 720)
    }
  }, [handleGetErrorMsg])

  const handleInitialLoad = useCallback(async () => {
    await handleUpdateCache()
  }, [handleUpdateCache])

  useEffect(() => {
    handleInitialLoad()
    intervalRef.current = setInterval(
      () => {
        handleUpdateCache()
      },
      30 * 60 * 1000,
    )

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [handleInitialLoad, handleUpdateCache])

  return null
}

export default memo(ErrorCodeMsgListen, () => false)
