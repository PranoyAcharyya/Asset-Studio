export type AssetKind = "image" | "video" | "audio" | "font" | "other";
export type ExtractedAsset = {
  id: string; name: string; mime: string; extension: string; kind: AssetKind;
  size: number; dataUrl: string; blob: Blob; source: string;
};

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
  "image/svg+xml": "svg", "image/avif": "avif", "image/bmp": "bmp", "image/x-icon": "ico",
  "video/mp4": "mp4", "video/webm": "webm", "video/ogg": "ogv", "video/quicktime": "mov",
  "audio/mpeg": "mp3", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mp4": "m4a",
  "font/woff": "woff", "font/woff2": "woff2", "application/font-woff": "woff", "application/vnd.ms-fontobject": "eot",
  "application/pdf": "pdf"
};

function kindFor(mime: string): AssetKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.includes("font") || ["font/woff", "font/woff2", "application/font-woff"].includes(mime)) return "font";
  return "other";
}

function decodeDataUri(uri: string): { mime: string; blob: Blob } | null {
  const comma = uri.indexOf(",");
  if (comma < 0) return null;
  const metadata = uri.slice(5, comma);
  const payload = uri.slice(comma + 1);
  const parts = metadata.split(";");
  const mime = (parts[0] || "text/plain").toLowerCase();
  try {
    if (parts.includes("base64")) {
      const binary = atob(payload.replace(/\s/g, ""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return { mime, blob: new Blob([bytes], { type: mime }) };
    }
    const decoded = decodeURIComponent(payload);
    return { mime, blob: new Blob([decoded], { type: mime }) };
  } catch { return null; }
}

function safeName(name: string) {
  return name.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "asset";
}

export function extractAssets(html: string): ExtractedAsset[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const candidates: { uri: string; source: string; hint?: string }[] = [];
  const add = (value: string | null | undefined, source: string, hint?: string) => {
    if (value?.trim().toLowerCase().startsWith("data:")) candidates.push({ uri: value.trim(), source, hint });
  };

  doc.querySelectorAll("img,source,video,audio,track,script,link,input").forEach((el, index) => {
    ["src", "srcset", "poster", "href", "data-src"].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      if (attr === "srcset") value.split(",").forEach((item) => add(item.trim().split(/\s+/)[0], `${el.tagName.toLowerCase()}[${index}].srcset`));
      else add(value, `${el.tagName.toLowerCase()}[${index}].${attr}`, el.getAttribute("alt") || undefined);
    });
  });

  doc.querySelectorAll("style,[style]").forEach((el, index) => {
    const css = el.tagName.toLowerCase() === "style" ? el.textContent || "" : el.getAttribute("style") || "";
    const regex = /url\(\s*(['"]?)(data:[^'"\s)]+(?:\s*;[^'"\s)]*)?\s*,[^'"\s)]*)\1\s*\)/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(css))) add(match[2], `css[${index}]`);
  });

  // Catch data URIs in less common attributes and inline JavaScript/config payloads.
  const raw = html;
  const generic = /data:([a-z\d.+-]+\/[a-z\d.+-]+)?(?:;[a-z\d=.+-]+)*(?:;base64)?,[a-z\d+/=_%-]+/gi;
  let match: RegExpExecArray | null;
  while ((match = generic.exec(raw))) add(match[0], "html document");

  const seen = new Map<string, number>();
  const assets: ExtractedAsset[] = [];
  for (const candidate of candidates) {
    const decoded = decodeDataUri(candidate.uri);
    if (!decoded || decoded.blob.size === 0) continue;
    const ext = MIME_EXT[decoded.mime] || decoded.mime.split("/")[1]?.split("+")[0] || "bin";
    const signature = `${decoded.mime}:${decoded.blob.size}:${candidate.uri.slice(-80)}`;
    const occurrence = seen.get(signature) || 0;
    seen.set(signature, occurrence + 1);
    // De-duplicate identical data URIs, but retain the first meaningful source.
    if (occurrence > 0) continue;
    const base = safeName(candidate.hint || `${kindFor(decoded.mime)}-${assets.length + 1}`);
    const name = base.includes(".") ? base : `${base}.${ext}`;
    assets.push({ id: `${assets.length}-${decoded.blob.size}`, name, mime: decoded.mime, extension: ext, kind: kindFor(decoded.mime), size: decoded.blob.size, dataUrl: URL.createObjectURL(decoded.blob), blob: decoded.blob, source: candidate.source });
  }
  return assets;
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
