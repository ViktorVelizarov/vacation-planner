// The account store for this process: always Upstash Redis, never a file. A deployment without it answers 503.
import { AuthConfigError, isProduction } from './config.js'
import { createUpstashStore } from './stores.js'

let store

export function getAuthStore() {
  if (store) return store

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new AuthConfigError('No account storage: set KV_REST_API_URL and KV_REST_API_TOKEN to an Upstash Redis database.')
  }
  try {
    new URL(url)
  } catch {
    throw new AuthConfigError('KV_REST_API_URL is not a web address (it looks like https://your-name-12345.upstash.io).')
  }

  // One database can serve this machine, Vercel previews and production; each keeps its own accounts.
  const environment = process.env.VERCEL_ENV || (isProduction() ? 'production' : 'development')
  store = createUpstashStore({ url, token, prefix: `vp:${environment}` })
  return store
}
