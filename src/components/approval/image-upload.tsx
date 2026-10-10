"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: File | null;
  previewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
}

export function ImageUpload({ value, previewUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    onChange(file, url);
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (value && previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-white bg-[var(--cute-bg-2)] shadow-[0_4px_0_-1px_#ffe5d6]">
        <img
          src={previewUrl}
          alt="订单截图预览"
          className="h-44 w-full object-cover"
        />
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--cute-reject)] text-white shadow-md transition hover:scale-110"
          aria-label="移除图片"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-[11px] font-medium text-white">
          📸 {value.name} · {(value.size / 1024).toFixed(0)} KB
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "cute-dashed flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--cute-bg)] text-[var(--cute-ink-soft)] transition hover:border-[var(--cute-pink-deep)] hover:bg-[var(--cute-pink-soft)] hover:text-[var(--cute-pink-deep)]",
        dragOver &&
          "border-[var(--cute-pink-deep)] bg-[var(--cute-pink-soft)] text-[var(--cute-pink-deep)]"
      )}
    >
      <div className="cute-float grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_4px_0_-1px_#ffd5e0]">
        <ImagePlus className="h-7 w-7 text-[var(--cute-pink-deep)]" />
      </div>
      <div className="text-sm font-bold text-[var(--cute-ink)]">
        📷 上传订单截图
      </div>
      <div className="text-[11px] text-[var(--cute-ink-soft)]">
        点一点或拖进来都可以哟～（最大 8MB）
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
