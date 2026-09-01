import netlifyReactRouter from '@netlify/vite-plugin-react-router'
import {reactRouter} from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig, type Plugin} from 'vite'

/**
 * `/studio` -> `/studio/`, matching the Netlify redirect.
 *
 * `sanity dev` serves the Studio at /studio/ and 404s the bare path, exactly as
 * Netlify does without the redirect rule. Doing it here too means the URL you
 * type in development is the URL that works in production.
 */
function studioTrailingSlash(): Plugin {
  return {
    name: 'treeworks:studio-trailing-slash',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [path] = (req.url ?? '').split('?')
        if (path !== '/studio') return next()
        res.statusCode = 301
        res.setHeader('Location', '/studio/')
        res.end()
      })
    },
  }
}

export default defineConfig({
  // netlifyReactRouter() must follow reactRouter(): it wraps the server build
  // that plugin produces into a Netlify function. Without it the SSR handler is
  // never emitted and Netlify serves the client build as a static site.
  plugins: [tailwindcss(), reactRouter(), netlifyReactRouter(), studioTrailingSlash()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    /*
      The Studio is a separate application, served by `sanity dev` on 3333.
      Proxying it onto this origin keeps development matching production, where
      Netlify serves the built Studio from the same host — and same-origin is
      what lets the draft-mode cookie and the Presentation iframe work at all.

      /static is not a typo. `sanity build` applies the base path to its script
      tags but leaves the favicon and web manifest links at /static/*, so both
      Netlify and this proxy have to send those on to the Studio. The rewrite is
      what the Netlify rule does with :splat.
    */
    proxy: {
      '/studio': {target: 'http://localhost:3333', ws: true},
      '/static': {
        target: 'http://localhost:3333',
        rewrite: (path) => `/studio${path}`,
      },
    },
    watch: {
      // The Studio has its own dev server and its own HMR. Without this, saving
      // a schema file reloads the site as well.
      ignored: ['**/studio/**'],
    },
  },
})
