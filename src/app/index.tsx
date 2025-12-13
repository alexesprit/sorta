import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import '@/app/index.css'

import { App } from '@/app/App'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

const container = document.getElementById('app')
if (!container) {
  throw new Error('Failed to find the app element')
}

const root = ReactDOM.createRoot(container)
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
