

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType === "application/zip") return "🗜️";
  if (mimeType.startsWith("text/")) return "📝";
  return "📁";
}

export function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/")
  );
}