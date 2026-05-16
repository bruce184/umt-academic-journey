import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { initAppearance } from './lib/appearance.js'

initAppearance()

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ToastProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </ToastProvider>
    </React.StrictMode>,
)
