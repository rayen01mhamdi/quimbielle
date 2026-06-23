import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@quimbielle/types',
        replacement: path.resolve(__dirname, '../../packages/types/src/index.ts'),
      },
      {
        find: '@quimbielle/pdf',
        replacement: path.resolve(__dirname, '../../packages/pdf/src/index.ts'),
      },
    ],
  },
})
