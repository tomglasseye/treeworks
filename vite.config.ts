import netlifyReactRouter from '@netlify/vite-plugin-react-router'
import {reactRouter} from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'vite'

export default defineConfig({
  // netlifyReactRouter() must follow reactRouter(): it wraps the server build
  // that plugin produces into a Netlify function. Without it the SSR handler is
  // never emitted and Netlify serves the client build as a static site.
  plugins: [tailwindcss(), reactRouter(), netlifyReactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // Sanity Studio is large; it is code-split onto its own route.
    chunkSizeWarningLimit: 3000,
  },
})
