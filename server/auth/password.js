// Password hashing with scrypt from Node's standard library: nothing native to compile or bundle on Vercel.
// N=2^15, r=8, p=3 is OWASP's memory-equivalent setting for scrypt (about 32 MiB and 150 ms on a laptop).
// The cost is written into every hash, so it can be raised later and older hashes still verify.

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const COST = { N: 2 ** 15, r: 8, p: 3 }
const KEY_LENGTH = 32
const MAX_MEMORY = 256 * 1024 * 1024
const MAX_ACCEPTED_MEMORY = 128 * 1024 * 1024 // refuse to run a stored hash that asks for more than this

const prepare = (password) => String(password).normalize('NFKC')

/** -> "scrypt$N$r$p$salt$hash" (salt and hash base64url) */
export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scryptAsync(prepare(password), salt, KEY_LENGTH, { ...COST, maxmem: MAX_MEMORY })
  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('base64url'), key.toString('base64url')].join('$')
}

/** True only when `password` matches `stored`. A malformed or absurdly expensive record is simply "no match". */
export async function verifyPassword(password, stored) {
  const parts = String(stored ?? '').split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [N, r, p] = parts.slice(1, 4).map(Number)
  const sane = [N, r, p].every(Number.isInteger) && N >= 2 ** 10 && r >= 1 && p >= 1 && p <= 16 && 128 * N * r <= MAX_ACCEPTED_MEMORY
  if (!sane) return false

  const salt = Buffer.from(parts[4], 'base64url')
  const expected = Buffer.from(parts[5], 'base64url')
  if (!salt.length || !expected.length) return false

  const key = await scryptAsync(prepare(password), salt, expected.length, { N, r, p, maxmem: MAX_MEMORY })
  return key.length === expected.length && timingSafeEqual(key, expected)
}

let dummy
/**
 * A real hash to check against when the email is unknown, so "no such account" takes as long as
 * "wrong password" and the response time does not reveal which emails are registered.
 */
export const dummyHash = () => (dummy ??= hashPassword('not-a-real-password'))
