import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.jsx'

posthog.init('phc_fV8JjTsbjyqKReV61MHASRBBSd0v08ZZyQ3k9QTc41O', {
  api_host: 'https://app.posthog.com',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
