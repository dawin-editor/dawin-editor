import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA


createRoot(document.getElementById('root')!).render(
    <App />
)
