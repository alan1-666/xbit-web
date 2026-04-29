import React, { useState } from 'react'
import { useReownWallet } from './useReownWallet'

export const ConnectButton: React.FC = () => {
  // const [messageToSign, setMessageToSign] = useState('Hello from Solana!')
  // const [signature, setSignature] = useState<string | null>(null)

  // const handleConnect = async () => {
  //   try {
  //     if (!provider) {
  //       throw new Error('Provider is not initialized')
  //     }
  //     await provider.connect({
  //       optionalNamespaces: {
  //         sui: {
  //           methods: ['sui_signPersonalMessage'],
  //           chains: ['sui:mainnet'],
  //           events: [],
  //         },
  //       },
  //     })
  //   } catch (error) {
  //     console.error('Failed to connect:', error)
  //   }
  // }

  return (
    // <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
    //   <div onClick={handleConnect}>abcs</div>
    // </div>
    <appkit-button />
  )
}
