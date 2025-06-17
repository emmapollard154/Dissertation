// main.jsx

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import './index.css'
import EmailWebPage from './email_webpage.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmailWebPage />
  </StrictMode>,
)
