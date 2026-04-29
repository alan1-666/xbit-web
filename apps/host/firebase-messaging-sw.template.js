// @deprecated This file is deprecated and will be removed in future versions. Please refer to the new documentation for updated practices.
// importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js')
// importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js')
//
// const DB_NAME = 'ErrorMessagesDB'
// const STORE_NAME = 'cache-error-msg'
// const DB_VERSION = 1
//
// firebase.initializeApp({
//   apiKey: '__API_KEY__',
//   authDomain: '__AUTH_DOMAIN__',
//   projectId: '__PROJECT_ID__',
//   storageBucket: '__STORAGE_BUCKET__',
//   messagingSenderId: '__MESSAGING_SENDER_ID__',
//   appId: '__APP_ID__',
// })
//
// const openDB = () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME, DB_VERSION)
//
//     request.onerror = () => reject(request.error)
//     request.onsuccess = () => resolve(request.result)
//
//     request.onupgradeneeded = () => {
//       const db = request.result
//       if (!db.objectStoreNames.contains(STORE_NAME)) {
//         db.createObjectStore(STORE_NAME)
//       }
//     }
//   })
// }
//
// const getFromIndexedDB = async (key) => {
//   const db = await openDB()
//   const tx = db.transaction(STORE_NAME, 'readonly')
//   const store = tx.objectStore(STORE_NAME)
//
//   const request = store.get(key)
//
//   return new Promise((resolve, reject) => {
//     request.onsuccess = async () => {
//       const record = request.result
//       if (!record) return resolve(null)
//
//       if (Date.now() > record.expiry) {
//         const deleteTx = db.transaction(STORE_NAME, 'readwrite')
//         deleteTx.objectStore(STORE_NAME).delete(key)
//         deleteTx.oncomplete = () => resolve(null)
//         deleteTx.onerror = () => reject(deleteTx.error)
//       } else {
//         resolve(record.data)
//       }
//     }
//     request.onerror = () => reject(request.error)
//   })
// }
//
// const messaging = firebase.messaging()
//
// function getErrorMessage(errorMessages, errorCode, languageCode = 'zh') {
//   const error = errorMessages?.getErrorMessages?.[errorCode]
//
//   if (!error) {
//     return errorCode
//   }
//
//   if ('en' in error && 'vi' in error && 'zh' in error) {
//     const multiLangError = error
//     return multiLangError[languageCode] || multiLangError.zh || multiLangError.en
//   }
//
//   return errorCode
// }
//
// messaging.onBackgroundMessage(async (payload) => {
//   const messageId = payload.messageId || 'default-message-id'
//
//   const errorMessages = await getFromIndexedDB('errorMessages')
//
//   const notificationTitle = payload.notification.title
//   const lang_code = payload.data?.lang_code || 'zh'
//   let message = payload.notification.body
//
//   const errorCodePattern = /\{\{([A-Za-z0-9_]+)\}\}/g
//
//   if (errorCodePattern.test(message)) {
//     // Reset pattern
//     errorCodePattern.lastIndex = 0
//     const matches = message.match(errorCodePattern)
//
//     if (matches) {
//       for (const match of matches) {
//         const errorCode = match.replace(/[{}]/g, '')
//         const convertedMsg = getErrorMessage(errorMessages, errorCode, lang_code)
//         message = message.replace(match, convertedMsg)
//       }
//     }
//   }
//   const notificationOptions = {
//     body: message,
//     icon: '/logo192.png',
//     tag: messageId,
//   }
//
//   self.registration.showNotification(notificationTitle, notificationOptions)
// })
//
// self.addEventListener('notificationclick', function (event) {
//   event.notification.close()
//
//   const url = event.notification.data?.url || '/'
//
//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
//       for (let client of windowClients) {
//         if (client.url === url && 'focus' in client) {
//           return client.focus()
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow(url)
//       }
//     }),
//   )
// })
