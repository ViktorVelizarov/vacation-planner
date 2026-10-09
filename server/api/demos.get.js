// GET /api/demos  ->  { limit, used, left }: the signed-in account's free trips. 401 when nobody is signed in.
import { demoStatus } from '../auth/demos.js'
import { defineAuthHandler } from '../auth/guard.js'
import { requireUser } from '../auth/session.js'
import { getAuthStore } from '../auth/store.js'

export default defineAuthHandler(async (event) => {
  const user = await requireUser(event)
  return demoStatus(getAuthStore(), user)
})
