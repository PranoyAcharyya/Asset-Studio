"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import JSZip from "jszip";
import {
  Activity,
  Archive,
  ArrowDownToLine,
  Check,
  ChevronDown,
  CircleHelp,
  CloudUpload,
  FileCode2,
  FileImage,
  FileVideo,
  Files,
  Filter,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Layers3,
  Music2,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { ExtractedAsset, extractAssets, formatBytes } from "@/lib/extractor";

type FilterType = "all" | "image" | "video" | "audio" | "font" | "other";
const filters: { id: FilterType; label: string }[] = [
  { id: "all", label: "All files" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "font", label: "Fonts" },
  { id: "other", label: "Other" },
];
const iconFor = (kind: string) =>
  kind === "video"
    ? FileVideo
    : kind === "audio"
      ? Music2
      : kind === "image"
        ? FileImage
        : Files;

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<ExtractedAsset[]>([]);
  const [fileName, setFileName] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ExtractedAsset | null>(null);

  const extractMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!/\.html?$/i.test(file.name) && file.type !== "text/html")
        throw new Error("Please choose an HTML file (.html or .htm).");
      if (file.size > 50 * 1024 * 1024)
        throw new Error(
          "This file is larger than 50 MB. Try a smaller HTML export.",
        );
      const html = await file.text();
      return { items: extractAssets(html), name: file.name };
    },
    onSuccess: ({ items, name }) => {
      setAssets(items);
      setFileName(name);
      setFilter("all");
      setSearch("");
      setError("");
    },
    onError: (e: Error) =>
      setError(e.message || "Something went wrong while reading this file."),
  });

  const visibleAssets = useMemo(
    () =>
      assets.filter(
        (a) =>
          (filter === "all" || a.kind === filter) &&
          `${a.name} ${a.mime}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [assets, filter, search],
  );
  const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
  const counts = (kind: FilterType) =>
    kind === "all"
      ? assets.length
      : assets.filter((a) => a.kind === kind).length;

  const processFile = useCallback(
    (file?: File) => {
      if (file) extractMutation.mutate(file);
    },
    [extractMutation],
  );
  const downloadOne = (asset: ExtractedAsset) => {
    const url = URL.createObjectURL(asset.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = asset.name;
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadZip = async () => {
    if (!assets.length) return;
    setZipBusy(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("extracted-assets");
      assets.forEach((asset, i) =>
        folder?.file(
          asset.name.replace(/\.(?=[^.]+$)/, `-${i + 1}.`),
          asset.blob,
        ),
      );
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 5 },
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.html?$/i, "") || "assets"}-assets.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("ZIP creation failed. Try downloading fewer files at a time.");
    } finally {
      setZipBusy(false);
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Layers3 size={21} />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-white">
                asset<span className="text-violet-300">studio</span>
              </div>
              <div className="text-[10px] uppercase tracking-[.22em] text-slate-500">
                Base64 extractor
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 py-2 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />{" "}
            Local processing{" "}
            <span className="hidden sm:inline">
              · Your files stay on this device
            </span>
          </div>
        </header>

        <section className="mx-auto mb-9 mt-16 max-w-3xl text-center md:mt-20">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[.08] px-3 py-1.5 text-[11px] font-medium tracking-wide text-violet-200">
            <Sparkles size={13} /> YOUR CREATIVE ASSET WORKFLOW, SIMPLIFIED
          </div>
          <h1 className="text-4xl font-semibold tracking-[-.055em] text-white md:text-6xl">
            Every asset.
            <br />
            <span className="gradient-text">One clean export.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
            Pull embedded images, videos, SVGs and more from your Google Ads
            HTML exports. Preview what you need, then download individually or
            bundle everything into one ZIP.
          </p>
        </section>

        {!assets.length ? (
          <section
            className={`upload-zone mx-auto max-w-3xl rounded-3xl p-2 ${dragging ? "upload-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="rounded-[20px] border border-dashed border-white/[.17] bg-[#11131e]/80 px-6 py-14 text-center md:px-12 md:py-16">
              <div className="upload-icon mx-auto mb-5">
                <CloudUpload size={27} />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Drop your HTML file here
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                or browse files from your computer
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                disabled={extractMutation.isPending}
                className="primary-button mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {extractMutation.isPending ? (
                  <>
                    <Activity className="animate-pulse" size={16} /> Reading
                    file…
                  </>
                ) : (
                  <>
                    <FolderOpen size={16} /> Choose HTML file
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".html,.htm,text/html"
                className="hidden"
                onChange={(e) => processFile(e.target.files?.[0])}
              />
              <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} /> 100% local processing
                </span>
                <span>HTML / HTM</span>
                <span>Up to 50 MB</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[.09] bg-white/[.035] p-4 md:flex-row md:items-center md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="file-icon">
                  <FileCode2 size={20} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {fileName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    HTML source · {assets.length} unique embedded assets
                  </div>
                </div>
                <button
                  title="Remove file"
                  onClick={() => {
                    setAssets([]);
                    setFileName("");
                    setPreview(null);
                  }}
                  className="ml-1 rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="secondary-button inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
                >
                  <FolderOpen size={14} /> Replace HTML
                </button>
                <button
                  onClick={downloadZip}
                  disabled={zipBusy || !assets.length}
                  className="primary-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {zipBusy ? (
                    <Activity size={15} className="animate-spin" />
                  ) : (
                    <Archive size={15} />
                  )}{" "}
                  {zipBusy ? "Building ZIP…" : "Download all ZIP"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".html,.htm,text/html"
                  className="hidden"
                  onChange={(e) => processFile(e.target.files?.[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat
                label="Total assets"
                value={String(assets.length)}
                icon={<Layers3 size={16} />}
                detail="Unique embedded files"
              />
              <Stat
                label="Images"
                value={String(counts("image"))}
                icon={<ImageIcon size={16} />}
                detail="Photos, banners, SVGs"
              />
              <Stat
                label="Videos & audio"
                value={String(counts("video") + counts("audio"))}
                icon={<FileVideo size={16} />}
                detail="Media files"
              />
              <Stat
                label="Total size"
                value={formatBytes(totalSize)}
                icon={<HardDrive size={16} />}
                detail="Uncompressed assets"
              />
            </div>
            <div className="rounded-2xl border border-white/[.09] bg-[#11131e]/85 p-4 md:p-5">
              <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Extracted assets
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Preview, filter and save individual files
                  </p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={15}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search assets…"
                    className="search-input w-full rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none"
                  />
                </div>
              </div>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`filter-chip shrink-0 rounded-lg px-3 py-2 text-xs ${filter === f.id ? "filter-active" : "text-slate-400 hover:bg-white/[.06] hover:text-white"}`}
                  >
                    {f.label}
                    <span className="ml-2 text-[10px] opacity-60">
                      {counts(f.id)}
                    </span>
                  </button>
                ))}
              </div>
              {visibleAssets.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onPreview={() => setPreview(asset)}
                      onDownload={() => downloadOne(asset)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-500">
                  No assets match this filter.
                </div>
              )}
              <div className="mt-5 flex items-center justify-between border-t border-white/[.07] pt-4 text-[11px] text-slate-500">
                <span>
                  Showing {visibleAssets.length} of {assets.length} assets
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-400" /> Extraction
                  complete
                </span>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between rounded-xl border border-rose-400/20 bg-rose-400/[.08] px-4 py-3 text-xs text-rose-200">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={15} />
            </button>
          </div>
        )}
        <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/[.07] pt-6 text-[11px] text-slate-600 md:flex-row">
  <span>
    © 2026 Pranoy Acharyya. All rights reserved.
    <span className="px-1">·</span>
    Built with ❤️ using Next.js
  </span>

  <span className="inline-flex items-center gap-1.5">
    <ShieldCheck size={13} />
    Files are processed locally in your browser
  </span>
</footer>
      </div>
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#151722] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {preview.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {preview.mime} · {formatBytes(preview.size)}
                </div>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </div>
            <div className="flex max-h-[65vh] min-h-48 items-center justify-center overflow-auto bg-[#0b0d14] p-5">
              {preview.kind === "image" && preview.mime !== "image/svg+xml" ? (
                <img
                  src={preview.dataUrl}
                  alt={preview.name}
                  className="max-h-[55vh] max-w-full object-contain"
                />
              ) : preview.mime === "image/svg+xml" ? (
                <iframe
                  title={preview.name}
                  src={preview.dataUrl}
                  className="h-[55vh] w-full bg-white"
                  sandbox=""
                />
              ) : preview.kind === "video" ? (
                <video
                  src={preview.dataUrl}
                  controls
                  className="max-h-[55vh] max-w-full"
                />
              ) : preview.kind === "audio" ? (
                <audio src={preview.dataUrl} controls />
              ) : (
                <div className="text-center text-sm text-slate-400">
                  <Files size={30} className="mx-auto mb-3" />
                  Preview unavailable for this file type
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[11px] text-slate-500">
                Source: {preview.source}
              </span>
              <button
                onClick={() => downloadOne(preview)}
                className="primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white"
              >
                <ArrowDownToLine size={14} /> Download file
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
  detail,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  detail: string;
}) {
  return (
    <div className="stat-card rounded-2xl border border-white/[.08] bg-white/[.035] p-4">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs">{label}</span>
        <span className="text-violet-300">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">{detail}</div>
    </div>
  );
}
function AssetCard({
  asset,
  onPreview,
  onDownload,
}: {
  asset: ExtractedAsset;
  onPreview: () => void;
  onDownload: () => void;
}) {
  const Icon = iconFor(asset.kind);
  return (
    <div className="asset-card group overflow-hidden rounded-xl border border-white/[.08] bg-[#171a27]">
      <button
        onClick={onPreview}
        className="preview-tile relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#0d1019]"
      >
        {asset.kind === "image" && asset.mime !== "image/svg+xml" ? (
          <img
            src={asset.dataUrl}
            alt={asset.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        ) : asset.mime === "image/svg+xml" ? (
          <img
            src={asset.dataUrl}
            alt={asset.name}
            className="h-full w-full object-contain bg-white p-3"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-violet-300">
            <Icon size={30} />
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              {asset.extension}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
          <span className="rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur group-hover:opacity-100">
            Preview
          </span>
        </div>
      </button>
      <div className="p-3">
        <div
          className="truncate text-xs font-medium text-slate-200"
          title={asset.name}
        >
          {asset.name}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-[10px] text-slate-500">
            {asset.mime}
          </span>
          <span className="shrink-0 text-[10px] text-slate-500">
            {formatBytes(asset.size)}
          </span>
        </div>
        <button
          onClick={onDownload}
          className="download-link mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium text-violet-200"
        >
          <ArrowDownToLine size={13} /> Download
        </button>
      </div>
    </div>
  );
}
