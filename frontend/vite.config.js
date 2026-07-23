import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    // 🌟 아래 server 설정을 추가해 줍니다.
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001', // 우리 백엔드 주소
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
