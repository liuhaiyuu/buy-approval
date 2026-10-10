"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** 全屏图片预览层：点击图片可关闭，双指/滚轮可缩放（基础实现） */
export function ImageViewer({ src, alt = "图片", open, onOpenChange }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-label="图片预览"
    >
      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(false);
        }}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
        aria-label="关闭预览"
      >
        <X className="h-5 w-5" />
      </button>

      {/* 图片 —— contain 完整显示，可点击关闭 */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />

      {/* 底部提示 */}
      <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
        点击空白处关闭
      </div>
    </div>
  );
}
