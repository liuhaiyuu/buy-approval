"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Info } from "lucide-react";

interface Props {
  onSubmitted: () => void;
}

export function SubmitView({ onSubmitted }: Props) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!reason.trim() && !!file && !submitting;

  function reset() {
    setReason("");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  async function submit() {
    if (!file || !canSubmit) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("reason", reason.trim());
      fd.append("orderImage", file);
      const res = await fetch("/api/approvals", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "提交失败");
      toast({
        title: "提交成功啦 🎉",
        description: `购买申请已发送，等老板翻牌子哟～`,
      });
      reset();
      onSubmitted();
    } catch (e) {
      toast({
        title: "哎呀出错了 😿",
        description: e instanceof Error ? e.message : "请稍后再试一次",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 p-4">
      {/* 规则提示 —— 软萌卡片 */}
      <div className="flex gap-2 rounded-2xl border-2 border-[#ffe0b8] bg-[var(--cute-cream-soft)] p-3 text-[12px] leading-relaxed text-[#a9742a]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          买东东前先在这里报备一下，上传订单截图说清楚理由，
          <b className="text-[#c25e1a]">老板点头了才能下单哟</b>
          ～表现好可能还有零花钱赞助呢 ✨
        </div>
      </div>

      {/* 订单截图 */}
      <SectionCard title="订单截图" emoji="📸" required>
        <ImageUpload
          value={file}
          previewUrl={preview}
          onChange={(f, url) => {
            setFile(f);
            setPreview(url);
          }}
        />
      </SectionCard>

      {/* 购买理由 */}
      <SectionCard title="购买理由" emoji="💭" required>
        <Label className="sr-only">购买理由</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="想买啥、为啥要买，都说给老板听听～理由越真诚越容易过审哟"
          className="min-h-[140px] resize-none rounded-xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] text-[13px] leading-relaxed text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
          maxLength={300}
        />
        <div className="mt-1 text-right text-[11px] text-[var(--cute-ink-soft)]">
          {reason.length}/300
        </div>
      </SectionCard>

      {/* 提交 */}
      <div className="pt-1">
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-base font-bold text-white shadow-[0_6px_0_-1px_#ff5c86,0_12px_22px_-8px_rgba(255,122,157,0.55)] transition hover:shadow-[0_8px_0_-1px_#ff5c86,0_16px_28px_-8px_rgba(255,122,157,0.65)] active:translate-y-0.5 active:shadow-[0_3px_0_-1px_#ff5c86] disabled:opacity-50 disabled:shadow-none"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              提交审批申请
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  emoji,
  required,
  children,
}: {
  title: string;
  emoji?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="cute-pop rounded-3xl border-2 border-white bg-white p-4 shadow-[0_4px_0_-1px_#ffe5d6,0_10px_22px_-12px_rgba(255,122,157,0.3)]">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--cute-ink)]">
        {emoji && <span className="text-base">{emoji}</span>}
        {title}
        {required && <span className="text-[var(--cute-pink-deep)]">*</span>}
      </div>
      {children}
    </div>
  );
}
