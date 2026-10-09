// Where accounts live: Upstash Redis through its REST API (plain fetch, no driver to install or bundle), in development
// and on Vercel alike. Nothing here, or anywhere else in the app, writes account data to disk.
//
//   confirmed accounts (never expire)             key user:<email>
//     getUser(email)             -> user | null
//     createUser(user)           -> true, or false when that email already has a confirmed account (never overwrites)
//     deleteUser(email)
//   sign-ups waiting for their email link         key pending:<email>   (they expire by themselves)
//     getPending(email)          -> user | null
//     savePending(user, seconds)    replaces any earlier sign-up for that address
//     deletePending(email)
//   emailed links (only a hash of the token)      key link:<hash>
//     putLink(hash, record, seconds)
//     peekLink(hash)             -> record | null   (leaves it in place)
//     takeLink(hash)             -> record | null   (reads and deletes: a link works once)
//   short waits                                   key hold:<name>
//     claim(name, seconds)       -> true when the wait starts now, false while an earlier one is still running
//     release(name)
//     secondsLeft(name)          -> whole seconds until it ends (0 when it is not running)
//   free trips an account has used                key demos:<userId>   (never expires)
//     demoCount(userId)          -> trips used so far
//     demoReserve(userId, limit) -> true when a trip was taken from the allowance, false when none is left
//     demoRefund(userId)         -> gives one back (the plan could not be drafted)
//   drafted plans, so a refresh does not spend another trip   key plan:<userId>:<hash>
//     planGet(userId, hash)      -> text | null
//     planPut(userId, hash, text, seconds)
//   throttles                                     key rate:<key>
//     rateCount(key)             -> attempts counted inside the current window
//     rateHit(key, windowSec)    -> count after adding one (the window starts at the first hit)
//     rateReset(key)
//
// Every command is a single Redis command (or a pipeline of two), so nothing needs scripting or transactions.

const parse = (raw) => (raw ? JSON.parse(raw) : null)

/** https://upstash.com/docs/redis/features/restapi */
export function createUpstashStore({ url, token, prefix = 'vp', fetchImpl = fetch, timeoutMs = 8000 }) {
  const base = url.replace(/\/+$/, '')
  const k = (name) => `${prefix}:${name}`

  const post = async (path, body) => {
    const response = await fetchImpl(base + path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`Upstash answered ${response.status}: ${json.error ?? response.statusText}`)
    return json
  }
  const command = async (...args) => {
    const json = await post('', args)
    if (json.error) throw new Error(`Upstash: ${json.error}`)
    return json.result
  }
  const pipeline = async (commands) => {
    const results = await post('/pipeline', commands)
    return results.map((entry) => {
      if (entry.error) throw new Error(`Upstash: ${entry.error}`)
      return entry.result
    })
  }

  return {
    kind: 'upstash',

    getUser: async (email) => parse(await command('GET', k(`user:${email}`))),
    // SET ... NX is atomic: two confirmations racing for one email cannot both succeed.
    createUser: async (user) => (await command('SET', k(`user:${user.email}`), JSON.stringify(user), 'NX')) === 'OK',
    deleteUser: async (email) => {
      await command('DEL', k(`user:${email}`))
    },

    getPending: async (email) => parse(await command('GET', k(`pending:${email}`))),
    savePending: async (user, seconds) => {
      await command('SET', k(`pending:${user.email}`), JSON.stringify(user), 'EX', String(seconds))
    },
    deletePending: async (email) => {
      await command('DEL', k(`pending:${email}`))
    },

    putLink: async (hash, record, seconds) => {
      await command('SET', k(`link:${hash}`), JSON.stringify(record), 'EX', String(seconds))
    },
    peekLink: async (hash) => parse(await command('GET', k(`link:${hash}`))),
    // Of two requests presenting the same link, DEL reports 1 to only one of them, so only one gets the record.
    takeLink: async (hash) => {
      const record = parse(await command('GET', k(`link:${hash}`)))
      if (!record) return null
      return (await command('DEL', k(`link:${hash}`))) === 1 ? record : null
    },

    claim: async (name, seconds) => (await command('SET', k(`hold:${name}`), '1', 'EX', String(seconds), 'NX')) === 'OK',
    release: async (name) => {
      await command('DEL', k(`hold:${name}`))
    },
    secondsLeft: async (name) => Math.max(0, Number(await command('TTL', k(`hold:${name}`))) || 0),

    demoCount: async (userId) => Number(await command('GET', k(`demos:${userId}`))) || 0,
    // INCR is atomic: of two trips racing for the last place, only one sees a count within the limit.
    demoReserve: async (userId, limit) => {
      const used = Number(await command('INCR', k(`demos:${userId}`)))
      if (used <= limit) return true
      await command('DECR', k(`demos:${userId}`))
      return false
    },
    demoRefund: async (userId) => {
      await command('DECR', k(`demos:${userId}`))
    },

    planGet: async (userId, hash) => (await command('GET', k(`plan:${userId}:${hash}`))) ?? null,
    planPut: async (userId, hash, text, seconds) => {
      await command('SET', k(`plan:${userId}:${hash}`), text, 'EX', String(seconds))
    },

    rateCount: async (key) => Number(await command('GET', k(`rate:${key}`))) || 0,
    rateHit: async (key, windowSec) => {
      // the first SET creates the key with its expiry; INCR then counts without touching it
      const [, count] = await pipeline([
        ['SET', k(`rate:${key}`), '0', 'EX', String(windowSec), 'NX'],
        ['INCR', k(`rate:${key}`)],
      ])
      return Number(count)
    },
    rateReset: async (key) => {
      await command('DEL', k(`rate:${key}`))
    },
  }
}
