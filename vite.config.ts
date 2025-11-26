import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Vercel and other cloud providers expose variables in process.env.
  // We check both the loaded env object (from .env files) and the system process.env.
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    base: '/',
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the GenAI SDK by replacing it with the string value at build time.
      // JSON.stringify is crucial here as 'define' does raw text replacement.
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});