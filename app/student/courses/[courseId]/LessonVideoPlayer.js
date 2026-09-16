"use client";

import { useEffect, useRef, useState } from "react";
import { parseVideoUrl } from "@/lib/videoEmbed";

const MAX_VIEWS = 3;
const MAX_RATE = 1.5;

let youtubeApiPromise = null;
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return youtubeApiPromise;
}

export default function LessonVideoPlayer({ part, initialViewCount }) {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const playerContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);

  const info = parseVideoUrl(part.video_url);
  const remaining = MAX_VIEWS - viewCount;

  async function handleWatch() {
    if (remaining <= 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/student/record-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonPartId: part.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "limit_reached") {
          setViewCount(data.viewCount);
          setError("You've used all 3 views for this video.");
        } else {
          setError(data.error || "Couldn't start the video.");
        }
        return;
      }
      setViewCount(data.viewCount);
      setRevealed(true);
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  // enforce a 1.5x speed cap on YouTube embeds via the IFrame API
  useEffect(() => {
    if (!revealed || info.type !== "youtube") return;
    let interval;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !YT || !playerContainerRef.current) return;
      ytPlayerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: info.id,
        playerVars: { rel: 0 },
        events: {
          onReady: (e) => {
            try {
              e.target.setPlaybackRate(MAX_RATE);
            } catch {}
            interval = setInterval(() => {
              try {
                if (e.target.getPlaybackRate() > MAX_RATE) e.target.setPlaybackRate(MAX_RATE);
              } catch {}
            }, 1500);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [revealed, info.type, info.id]);

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium">
          Part {part.part_number}
          {part.title ? `: ${part.title}` : ""}
        </p>
        <span className="font-mono text-xs text-muted">
          {Math.max(remaining, 0)}/{MAX_VIEWS} views left
        </span>
      </div>

      {!revealed && (
        <button
          onClick={handleWatch}
          disabled={loading || remaining <= 0}
          className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
        >
          {remaining <= 0 ? "No views left" : loading ? "Loading…" : "▶ Watch"}
        </button>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {revealed && info.type === "youtube" && (
        <div className="mt-3 aspect-video overflow-hidden rounded-md">
          <div ref={playerContainerRef} className="h-full w-full" />
        </div>
      )}

      {revealed && info.type === "drive" && (
        <div className="mt-3 aspect-video overflow-hidden rounded-md">
          <iframe
            src={info.embedUrl}
            className="h-full w-full"
            allow="autoplay"
            title={`Part ${part.part_number}`}
          />
        </div>
      )}

      {revealed && info.type === "other" && (
        <a
          href={info.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-md border border-line px-4 py-2 text-sm text-teal hover:underline focus-ring"
        >
          Open video ↗
        </a>
      )}
    </div>
  );
}
