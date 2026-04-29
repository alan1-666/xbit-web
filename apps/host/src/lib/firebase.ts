import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { Observable } from '@apollo/client'

let firebaseApp: ReturnType<typeof initializeApp> | null = null

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// Initialize Analytics
const analytics = getAnalytics(app)

const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
  }
  return firebaseApp
}

const getMessagingInstance = () => {
  try {
    const firebaseApp = getFirebaseApp()
    return getMessaging(firebaseApp)
  } catch (error) {
    console.error('Error getting Firebase Messaging instance:', error)
    return null
  }
}

/**
 * Request permission for Notifications and get FCM token
 * @deprecated Use alternative push notification service
 */
const requestForToken = async () => {
  const messaging = getMessagingInstance()
  if (!messaging) {
    console.error('Firebase Messaging instance is not available')
    return null
  }
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })
    if (currentToken) {
      console.log('FCM token:', currentToken)
      return currentToken
    } else {
      console.log('No registration token available')
      return null
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err)
    return null
  }
}

/**
 * Handle foreground messages
 * @deprecated Use alternative push notification service
 */
const onMessageListener = () => {
  const messaging = getMessagingInstance()
  return new Observable((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload)
        resolve.next(payload)
      })
    }
  })
}

/**
 * Register service worker for handling background messages
 * @deprecated Use alternative push notification service
 */
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    // try {
    //   const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    //   console.log('Firebase service worker registered:', registration)
    //   return registration
    // } catch (error) {
    //   console.error('Service worker registration failed:', error)
    //   return null
    // }
  }
  return null
}

export {
  app,
  analytics,
  getFirebaseApp,
  getMessagingInstance,
  requestForToken,
  onMessageListener,
  registerServiceWorker,
}
