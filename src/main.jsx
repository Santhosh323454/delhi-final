import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { TherapyProvider } from './context/TherapyContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <TherapyProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </TherapyProvider>
    </React.StrictMode>,
)
