import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Professional Console Greeting for Recruiters
console.log(
  "%cHello there, You found me!",
  "color: #ffffff; background: #000000; font-size: 24px; font-family: 'Space Grotesk', sans-serif; font-weight: bold; padding: 10px 20px; border: 1px solid #333;"
);
console.log(
  "%cGive me a call @ +91 83748 22724 \nor email me @ sunny.vanamala4@gmail.com",
  "color: #ffffff; font-size: 14px; font-family: 'JetBrains Mono', monospace; font-weight: bold; margin-top: 10px; display: block; line-height: 1.5;"
);
console.log(
  "%cCheck out my works: https://github.com/sumukhteja",
  "color: #888; font-size: 11px; font-family: 'JetBrains Mono', monospace; margin-top: 5px;"
);
