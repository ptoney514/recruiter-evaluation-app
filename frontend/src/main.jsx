import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { showCompatibilityWarning } from './utils/browserCheck'

// Check browser compatibility before rendering app
const isCompatible = showCompatibilityWarning()

if (isCompatible) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  // Show fallback message for incompatible browsers
  document.getElementById('root').innerHTML = `
    <div style="font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center;">
      <h1 style="color: #dc2626;">Browser Not Supported</h1>
      <p style="color: #4b5563; margin: 20px 0;">
        This application requires a modern browser to function properly.
      </p>
      <p style="color: #4b5563;">
        Please use one of the following browsers:
      </p>
      <ul style="list-style: none; padding: 0; color: #1f2937; font-weight: 500;">
        <li>Chrome 90 or newer</li>
        <li>Firefox 88 or newer</li>
        <li>Safari 14 or newer</li>
        <li>Edge 90 or newer</li>
      </ul>
    </div>
  `
}
