import crypto from "crypto";

export const DEVICE_COOKIE = "ca_device";

// Reads the device id from an incoming request's cookies, generating a new
// one if this browser doesn't have one yet. The caller is responsible for
// setting it back on the response via setDeviceCookie().
export function getOrCreateDeviceId(request) {
  const existing = request.cookies.get(DEVICE_COOKIE)?.value;
  if (existing) return { deviceId: existing, isNew: false };
  return { deviceId: crypto.randomUUID(), isNew: true };
}

export function setDeviceCookie(res, deviceId) {
  res.cookies.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400, // ~13 months, the practical max most browsers honor
  });
}
