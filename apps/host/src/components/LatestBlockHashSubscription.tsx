import { useSubscription } from '@/lib/mqtt'
// import { useAppDispatch } from '@/redux/store'
import React, { useEffect } from 'react'
// import { BlockHashData, updateLatestBlockHash } from '@/redux/modules/latestBlockHash.slice.ts'
import { latestBlockHash } from '@const/latestBlockHash.ts'
import useNetworkFeeSubcription from './mqtt/NetworkFeeSubcription'

const LatestBlockHashSubscription: React.FC = () => {
  // const dispatch = useAppDispatch()
  const { message: _latestBlockHashMessage } = useSubscription('public/latest_blockhash/SOLANA')
  useNetworkFeeSubcription()
  useEffect(() => {
    if (!_latestBlockHashMessage) return
    try {
      const message = _latestBlockHashMessage?.message
      const messageData = JSON.parse(message?.toString() || '')

      const newBlockHash = messageData?.blockhash ?? ''
      const newValidBlockHeight = messageData?.lastValidBlockHeight ?? 0

      // const newLatestBlockHashData: BlockHashData = {
      //   blockhash: messageData?.blockhash,
      //   lastValidBlockHeight: messageData?.lastValidBlockHeight,
      // }

      if (newBlockHash?.length > 0) {
        latestBlockHash.blockhash = newBlockHash
      }

      if (newValidBlockHeight && newValidBlockHeight > 0) {
        latestBlockHash.lastValidBlockHeight = newValidBlockHeight
      }

      // if (newLatestBlockHashData?.blockhash || newLatestBlockHashData?.lastValidBlockHeight) {
      //   dispatch(updateLatestBlockHash(newLatestBlockHashData))
      // }
    } catch (error) {
      console.warn('_latestBlockHashMessage error: ', error)
    }
  }, [_latestBlockHashMessage])
  
  return <></>
}

export default LatestBlockHashSubscription
