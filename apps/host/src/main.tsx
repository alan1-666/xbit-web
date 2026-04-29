import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as Sentry from '@sentry/react'
import { browserTracingIntegration } from '@sentry/react'
import { store } from '@/redux/store'
import { Provider } from 'react-redux'

// const allowedEnvironments = ['staging', 'prod', 'unstable']
const allowedEnvironments = ['staging', 'prod']
const env = import.meta.env.VITE_STAGE
if (allowedEnvironments.includes(env)) {
  Sentry.init({
    dsn: 'https://d73cbfcbb5e94713c2c8d37341c80e44@o4509093075156992.ingest.de.sentry.io/4509093709873232',
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 1.0, // Adjust this in production
    environment: env,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
