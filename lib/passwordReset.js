import crypto from "crypto";

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
