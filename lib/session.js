import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET;

export function signSession(payload) {
  // payload example: { role: "trainer", trainerId, username }
  //              or: { role: "student", studentId, name }
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "ca_session";
