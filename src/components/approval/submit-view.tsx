"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";
import { useToast } from "@/hooks/use-toast";
import { formatMoney } from "@/lib/approvals";
import { Send, Loader2, Info } from "lucide-react";

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
        title: "提交成功 🎉",
        description: `已提交「${item.trim()}」的购买审批申请，等待老板审批～`,
      });
      reset();
      onSubmitted();
    } catch (e) {
      toast({
        title: "提交失败",
        description: e instanceof Error ? e.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 p-4">
      {/* 规则提示 */}
      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          买东西前请先在这里提交申请，上传订单截图并说明原因，
          <b>老板审批通过后才能下单</b>。表现好可能还会被赞助零花钱哦～
        </div>
      </div>

      {/* 订单截图 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <Label className="text-sm font-medium">
          订单截图 <span className="text-rose-500">*</span>
        </Label>
        <div className="mt-2">
          <ImageUpload
            value={file}
            previewUrl={preview}
            onChange={(f, url) => {
              setFile(f);
              setPreview(url);
            }}
          />
        </div>
      </div>

      {/* 申请人 + 商品 */}
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <Label className="text-sm font-medium">
            申请人 <span className="text-rose-500">*</span>
          </Label>
          <Input
            value={applicant}
            onChange={(e) => setApplicant(e.target.value)}
            placeholder="你的昵称"
            className="mt-1.5 h-11"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">
            商品名称 <span className="text-rose-500">*</span>
          </Label>
          <Input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="例如：Sony 降噪耳机"
            className="mt-1.5 h-11"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">
            订单金额（元） <span className="text-rose-500">*</span>
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#07C160]">
              ¥
            </span>
            <Input
              type="number"
              min={0}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-11 pl-7 text-base font-medium"
            />
          </div>
        </div>
      </div>

      {/* 购买原因 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <Label className="text-sm font-medium">
          购买原因 <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="说清楚为啥要买、买了有啥用，老板才好审批～"
          className="mt-1.5 min-h-[110px] resize-none text-[13px] leading-relaxed"
          maxLength={300}
        />
        <div className="mt-1 text-right text-[11px] text-muted-foreground">
          {reason.length}/300
        </div>
      </div>

      {/* 提交 */}
      <div className="pt-1">
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="h-12 w-full rounded-xl bg-[#07C160] text-base font-medium text-white shadow-lg shadow-[#07C160]/25 hover:bg-[#06ad56] disabled:opacity-50 disabled:shadow-none"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              提交审批申请
              {amountNum > 0 && ` · ¥${formatMoney(amountNum)}`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
