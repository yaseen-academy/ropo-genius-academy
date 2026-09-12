"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }
  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:border-danger hover:text-danger transition-colors focus-ring"
    >
      Log out
    </button>
  );
}
