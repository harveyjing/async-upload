import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { JobQueueProvider } from './components/v2/hooks/JobQueueContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JobQueueProvider>
      <App />
    </JobQueueProvider>
  </StrictMode>,
)
