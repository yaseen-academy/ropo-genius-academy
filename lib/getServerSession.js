import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./session";

export function getServerSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
