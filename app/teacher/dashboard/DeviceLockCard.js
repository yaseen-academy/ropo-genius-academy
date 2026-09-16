"use client";

import { useState } from "react";

export default function DeviceLockCard() {
  const [status, setStatus] = useState("idle"); // idle | confirming | loading | done | error

  async function handleReset() {
    setStatus("loading");
    try {
      const res = await fetch("/api/trainer/reset-device-lock", { method: "POST" });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <h2 className="text-lg font-medium">Device lock</h2>
      <p className="mt-1 text-sm text-muted">
        Your account is locked to the first device you log in from — nobody else can sign in
        even with the right password. If you get a new device, unlock it here first, then log
        in from the new device.
      </p>

      {status === "idle" && (
        <button
          onClick={() => setStatus("confirming")}
          className="mt-4 rounded-md border border-line px-4 py-2 text-sm hover:border-amber hover:text-amber transition-colors focus-ring"
        >
          Unlock for a new device
        </button>
      )}

      {status === "confirming" && (
        <div className="mt-4 rounded-md border border-amber/40 bg-amber/10 p-4">
          <p className="text-sm">
            This removes the device lock. Anyone with your username and password could then log
            in from any device until you sign in again to re-lock it. Continue?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleReset}
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-ink hover:opacity-90 transition-opacity focus-ring"
            >
              Yes, unlock
            </button>
            <button
              onClick={() => setStatus("idle")}
              className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-text focus-ring"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === "loading" && <p className="mt-3 text-sm text-muted">Unlocking…</p>}
      {status === "done" && (
        <p className="mt-3 text-sm text-teal">
          Unlocked. Log in from your new device now — it will become the new locked device.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-danger">Something went wrong — try again.</p>
      )}
    </section>
  );
}
