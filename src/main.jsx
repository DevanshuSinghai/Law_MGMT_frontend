import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initChunkErrorHandler } from './utils/chunkErrorHandler.js'
import App from './App.jsx'

// Initialize chunk error handler before rendering
// This catches stale cache errors and does a single hard refresh
initChunkErrorHandler()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
