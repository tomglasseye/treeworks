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
  server: {
    /*
      The Studio is a separate application now, served by `sanity dev` on 3333.
      Proxying it onto this origin keeps development matching production, where
      Netlify serves the built Studio from the same host — same-origin is what
      lets the Presentation iframe and the draft-mode cookie work at all.

      `sanity dev` serves at /studio/ with a trailing slash; a bare /studio is a
      404 there, exactly as it is on Netlify.

      /static is not a typo: `sanity build` half-applies the base path and
      leaves the favicon and web manifest pointing at /static/*. Netlify has a
      rewrite for it, so dev has a proxy for it.
    */
    proxy: {
      '/studio': {target: 'http://localhost:3333', ws: true},
      '/static': {target: 'http://localhost:3333', ws: false},
    },
  },
})
