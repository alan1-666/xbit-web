// TelegramPopupAuth.jsx
import { useTurnkey } from '@turnkey/sdk-react'
import React, { useState, useEffect } from 'react'
import { sha256 } from 'viem'
import { Button } from '../ui/button'
import { InputLoginTelegramV2Dto } from '@/@generated/gql/graphql-user'
import { useAppDispatch } from '@/redux/store'
import { authActions } from '@/redux/modules/auth.slice'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramAuthProps {
  botId: string
  onAuth?: (user: TelegramUser | null) => void
  onError?: (error: string) => void
  buttonText?: string
  buttonStyle?: React.CSSProperties
}

const TelegramPopupAuth: React.FC<TelegramAuthProps> = ({
  botId,
  onAuth,
  onError,
  buttonText = 'Login with Telegram',
  buttonStyle = {},
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const dispatch = useAppDispatch()

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('telegram_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        onAuth?.(userData)
      } catch (error) {
        localStorage.removeItem('telegram_user')
      }
    }
  }, [])

  const openTelegramWidget = () => {
    if (!botId) {
      onError?.('Bot ID is required')
      return
    }

    setIsLoading(true)

    console.log('botId', botId)
    // Widget popup dimensions
    const width = 550
    const height = 550
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    // Create the Telegram auth URL
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}&request_access=write`

    // Open popup window
    const popup = window.open(
      authUrl,
      'telegram-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`,
    )

    if (!popup) {
      setIsLoading(false)
      onError?.('Popup blocked. Please allow popups for this site.')
      return
    }

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      // Security check - only accept messages from our popup
      if (event.source !== popup) return
      const data = JSON.parse(event.data)
      console.log('data', data)
      try {
        // Check if the message is from Telegram OAuth
        if (data?.event === 'auth_result') {
          const userData = data?.result
          console.log('Received user data:', userData)

          if (userData && userData.id) {
            handleAuthSuccess(userData)
            const params: InputLoginTelegramV2Dto = {
              id: userData.id,
              firstName: userData.first_name,
              username: userData.username,
              photoUrl: userData.photo_url,
              authDate: userData.auth_date,
              hash: userData.hash,
            }

            dispatch(authActions.loginByTGv2({ input: params })).then((res) => {
              if (res) {
                console.log('res', res)
              }
            })
          } else {
            handleAuthError('Invalid user data received from Telegram')
          }
        }
      } catch (error) {
        console.error('Error processing message:', error)
        handleAuthError('Failed to process authentication response')
      }
    }

    window.addEventListener('message', messageListener)

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageListener)
        setIsLoading(false)
      }
    }, 1000)

    // Cleanup function
    const cleanup = () => {
      clearInterval(checkClosed)
      window.removeEventListener('message', messageListener)
      setIsLoading(false)
    }

    // Auto cleanup after 5 minutes
    setTimeout(cleanup, 5 * 60 * 1000)
  }

  const handleAuthSuccess = (userData: TelegramUser) => {
    try {
      console.log('userData', userData)
      // Validate user data
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received')
      }

      // Check if auth data is recent (within 5 minutes)
      const authTime = userData.auth_date * 1000
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      if (now - authTime > fiveMinutes) {
        throw new Error('Authentication data is too old')
      }

      // Store user data
      setUser(userData)
      localStorage.setItem('telegram_user', JSON.stringify(userData))

      // Call success callback
      onAuth?.(userData)
    } catch (error) {
      if (error instanceof Error) {
        handleAuthError(error.message)
      } else {
        handleAuthError('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthError = (errorMessage: string) => {
    console.error('Telegram auth error:', errorMessage)
    onError?.(errorMessage)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    onAuth?.(null)
    localStorage.removeItem('telegram_user')
  }

  // If user is already logged in, show user info
  if (user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#f9f9f9',
        }}
      >
        {user.photo_url ? (
          <img
            src={user.photo_url}
            alt="User avatar"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
            }}
          />
        ) : (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#0088cc',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {user.first_name.charAt(0)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>
            {user.first_name} {user.last_name || ''}
          </div>
          {user.username && <div style={{ color: '#666', fontSize: '14px' }}>@{user.username}</div>}
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <Button
      onClick={openTelegramWidget}
      disabled={isLoading}
      // style={{
      //   display: 'flex',
      //   alignItems: 'center',
      //   justifyContent: 'center',
      //   gap: '8px',
      //   padding: '12px 24px',
      //   background: '#0088cc',
      //   color: 'white',
      //   border: 'none',
      //   borderRadius: '6px',
      //   cursor: isLoading ? 'not-allowed' : 'pointer',
      //   fontSize: '16px',
      //   fontWeight: '500',
      //   opacity: isLoading ? 0.7 : 1,
      //   ...buttonStyle,
      // }}
    >
      {isLoading ? (
        <>
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          Connecting...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.958-.896 6.728-.896 6.728-.379 2.655-1.407 3.119-2.752 1.93-1.112-.98-1.832-1.798-2.974-2.91-1.048-.982-1.842-1.988-.736-3.149 2.448-2.592 5.368-6.186 5.368-6.186.336-.336.224-.56-.168-.336 0 0-6.553 4.48-8.452 5.792-1.232.85-1.895 1.007-2.67.85-.89-.179-1.758-.376-2.583-.574-1.163-.268-1.163-.98.089-1.425L19.024 7.773c.89-.357 2.024.089 1.544 2.387z" />
          </svg>
          {buttonText}
        </>
      )}
    </Button>
  )
}

// Example usage component
export const TelegramAuthExample: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { authIframeClient } = useTurnkey()

  useEffect(() => {
    console.log('authIframeClient', authIframeClient)
    if (authIframeClient?.iframePublicKey) {
      const hashedPublicKey = sha256(authIframeClient.iframePublicKey as `0x${string}`).replace(/^0x/, '')
      console.log('hashedPublicKey', hashedPublicKey)
      // setNonce(hashedPublicKey)
    }
  }, [authIframeClient?.iframePublicKey])

  console.log('user', user)
  const handleAuth = (userData: TelegramUser | null) => {
    console.log('User authenticated:', userData)
    setUser(userData)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    console.error('Auth error:', errorMessage)
    setError(errorMessage)
  }

  return (
    <div style={{ padding: '8px', maxWidth: '400px', margin: '0 auto' }}>
      {error && (
        <div
          style={{
            padding: '10px',
            background: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          Error: {error}
        </div>
      )}

      <TelegramPopupAuth
        botId="7030300131" // Replace this with your actual bot ID (numbers only)
        onAuth={handleAuth}
        onError={handleError}
        buttonText="🚀 Connect with Telegram"
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default TelegramPopupAuth
