import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initColorScheme } from '@/lib/colorScheme'
import { initTheme } from '@/lib/theme'

initColorScheme()
initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
