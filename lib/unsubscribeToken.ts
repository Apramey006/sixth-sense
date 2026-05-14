import { createHmac, timingSafeEqual } from "node:crypto";

// HMAC-signed unsubscribe token. Format: <user_id>.<sig> where sig is the first
// 16 chars of HMAC-SHA256(user_id, secret). 64 bits of entropy is more than
// enough to make unsubscribe links unguessable.
//
// We deliberately don't expire tokens — once an unsubscribe link is sent, it
// stays valid forever. Re-subscribe is a separate flow.

const SECRET = process.env.UNSUBSCRIBE_SECRET ?? "sixth-sense-dev-fallback";

function sign(userId: string): string {
  return createHmac("sha256", SECRET).update(userId).digest("hex").slice(0, 16);
}

export function makeUnsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(userId);
  if (sig.length !== expected.length) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return userId;
}
