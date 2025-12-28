import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 4000,
        host: '0.0.0.0',
        proxy: {
          '/api/bitrix-groups': {
            target: 'https://agroserra.bitrix24.com.br',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/bitrix-groups/, '/rest/187/wdalwcekbog0ke1r/sonet_group.get')
          },
          '/api/batividadeg': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
