import type {Config} from '@react-router/dev/config'

export default {
  // SSR everywhere. The Studio route opts out at the component level because
  // Sanity Studio is browser-only.
  ssr: true,
} satisfies Config
