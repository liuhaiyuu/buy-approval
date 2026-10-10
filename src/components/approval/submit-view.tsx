"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";
import { useToast } from "@/hooks/use-toast";
import { formatMoney } from "@/lib/approvals";
import { Send, Loader2, Info, Heart } from "lucide-react";

interface Props {
  defaultApplicant: string;
  onSubmitted: () => void;
}

export function SubmitView({ defaultApplicant, onSubmitted }: Props) {
  const { toast } = useToast();
  const [applicant, setApplicant] = useState(defaultApplicant);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amountNum = Number(amount) || 0;
  const canSubmit =
    applicant.trim() &&
    item.trim() &&
    amountNum > 0 &&
    reason.trim() &&
    file &&
    !submitting;

  function reset() {
    setItem("");
    setAmount("");
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
      fd.append("applicant", applicant.trim());
      fd.append("item", item.trim());
      fd.append("amount", String(amountNum));
      fd.append("reason", reason.trim());
      fd.append("orderImage", file);
      const res = await fetch("/api/approvals", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "提交失败");
      toast({
        title: "提交成功啦 🎉",
        description: `「${item.trim()}」的购买申请已发送，等老板翻牌子哟～`,
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

      {/* 申请人 + 商品 */}
      <SectionCard title="申请信息" emoji="📝">
        <div className="space-y-3">
          <Field label="申请人" required>
            <Input
              value={applicant}
              onChange={(e) => setApplicant(e.target.value)}
              placeholder="你的昵称～"
              className="mt-1.5 h-11 rounded-xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
            />
          </Field>
          <Field label="商品名称" required>
            <Input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="例如：Sony 降噪耳机"
              className="mt-1.5 h-11 rounded-xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
            />
          </Field>
          <Field label="订单金额（元）" required>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--cute-pink-deep)]">
                ¥
              </span>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 rounded-xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] pl-7 text-base font-bold text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
              />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* 购买原因 */}
      <SectionCard title="购买理由" emoji="💭">
        <Label className="sr-only">购买原因</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="认真说说为啥要买～理由越真诚越容易过审哟"
          className="min-h-[110px] resize-none rounded-xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] text-[13px] leading-relaxed text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
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
              {amountNum > 0 ? (
                <>
                  提交申请 · 赞助求 ¥{formatMoney(amountNum)}
                  <Heart className="ml-0.5 h-3.5 w-3.5 fill-white" />
                </>
              ) : (
                "提交审批申请"
              )}
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[13px] font-semibold text-[var(--cute-ink)]">
        {label} {required && <span className="text-[var(--cute-pink-deep)]">*</span>}
      </Label>
      {children}
    </div>
  );
}
