import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import imageUploadPlugin from './plugins/vite-plugin-image-upload.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    imageUploadPlugin(), // Plugin Node.js fs xử lý upload ảnh vào thư mục public/
  ],
})


