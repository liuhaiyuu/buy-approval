"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
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
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
        <img
          src={previewUrl}
          alt="订单截图预览"
          className="h-44 w-full object-cover"
        />
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
          aria-label="移除图片"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[11px] text-white/90">
          {value.name} · {(value.size / 1024).toFixed(0)} KB
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
        "flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-[#07C160] hover:text-[#07C160] hover:bg-[#07C160]/5",
        dragOver && "border-[#07C160] text-[#07C160] bg-[#07C160]/5"
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-background shadow-sm">
        <ImagePlus className="h-6 w-6" />
      </div>
      <div className="text-sm font-medium">上传订单截图</div>
      <div className="text-[11px] text-muted-foreground/80">
        点击或拖拽图片到这里 · 最大 8MB
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

export { Loader2 };
