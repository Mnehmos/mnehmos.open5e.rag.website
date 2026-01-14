import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://mnehmos.github.io',
  base: process.env.BASE_PATH || '/mnehmos.open5e.rag.website/',
  vite: {
    define: {
      'import.meta.env.CHAT_API_URL': JSON.stringify(
        process.env.CHAT_API_URL || 'https://open5e-rag-chatbot-production.up.railway.app'
      ),
    },
  },
});
