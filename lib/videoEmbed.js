// Best-effort parsing of common video link formats into something embeddable.
export function parseVideoUrl(url) {
  if (!url) return { type: "none" };

  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (youtubeMatch) {
    return { type: "youtube", id: youtubeMatch[1] };
  }

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (driveMatch) {
    return { type: "drive", embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  }

  return { type: "other", url };
}
