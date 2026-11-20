import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CRMProvider } from './store/CRMProvider'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CRMProvider>
        <App />
      </CRMProvider>
    </BrowserRouter>
  </StrictMode>,
)
