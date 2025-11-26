import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid TypeScript error regarding missing 'cwd' property on Process type
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the GenAI SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});