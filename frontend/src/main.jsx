import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext' // 👈 전역 설정 창고 불러오기

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* SettingsProvider로 App을 감싸서 온 동네 컴포넌트들이 설정을 공유할 수 있게 만듭니다. */}
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
