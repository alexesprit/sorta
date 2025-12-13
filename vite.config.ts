import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const _env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    esbuild: {
      // Use legacy JSX transform for React 16
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },
    // Vite automatically exposes environment variables that start with SPOTIFY_
    // No need for manual definition as Vite handles it
    server: {
      open: false,
      host: '127.0.0.1',
      port: 5173,
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        external: ['react/jsx-runtime', 'react/jsx-dev-runtime'],
      },
    },
    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
