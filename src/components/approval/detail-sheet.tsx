"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { ApprovalRequest } from "@/lib/approvals";
import { formatMoney, relativeTime } from "@/lib/approvals";
import { StatusBadge } from "./status-badge";
import { Gift, Check, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [0, 10, 20, 50, 100];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  approval: ApprovalRequest | null;
  reviewer: string;
  onReviewed: () => void;
}

export function DetailSheet({
  open,
  onOpenChange,
  approval,
  reviewer,
  onReviewed,
}: Props) {
  const [sponsor, setSponsor] = useState<number>(0);
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState<string>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  // 每次打开新申请单时重置
  useEffect(() => {
    if (open) {
      setSponsor(0);
      setCustomMode(false);
      setCustomVal("");
      setNote("");
      setSubmitting(false);
      setAction(null);
    }
  }, [open, approval?.id]);

  if (!approval) return null;

  const finalSponsor = customMode
    ? Math.max(0, Number(customVal) || 0)
    : sponsor;

  async function submit(status: "approved" | "rejected") {
    if (!approval) return;
    setSubmitting(true);
    setAction(status);
    try {
      const res = await fetch(`/api/approvals/${approval.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          sponsorAmount: status === "approved" ? finalSponsor : 0,
          reviewNote: note,
          reviewer,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "操作失败");
      }
      onReviewed();
      onOpenChange(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "操作失败");
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] !rounded-t-2xl">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="text-base">审批详情</DrawerTitle>
          <DrawerDescription className="sr-only">
            查看申请并审批
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {/* 订单截图 */}
          <div className="overflow-hidden rounded-xl ring-1 ring-black/5">
            <img
              src={approval.orderImage}
              alt={approval.item}
              className="max-h-64 w-full object-cover"
            />
          </div>

          {/* 申请人信息 */}
          <div className="mt-3 flex items-center gap-2">
            {approval.applicantAvatar && (
              <img
                src={approval.applicantAvatar}
                alt={approval.applicant}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span className="text-sm font-medium text-foreground">
              {approval.applicant}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {relativeTime(approval.createdAt)}申请
            </span>
            <span className="ml-auto">
              <StatusBadge status={approval.status} />
            </span>
          </div>

          {/* 商品 + 金额 */}
          <div className="mt-3 rounded-xl bg-muted/60 p-3">
            <div className="text-[11px] text-muted-foreground">购买商品</div>
            <div className="mt-0.5 text-sm font-medium text-foreground">
              {approval.item}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">订单金额</span>
              <span className="ml-auto text-xl font-semibold text-[#07C160]">
                ¥{formatMoney(approval.amount)}
              </span>
            </div>
          </div>

          {/* 购买原因 */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              购买原因
            </div>
            <div className="mt-1.5 rounded-xl border border-border bg-white p-3 text-[13px] leading-relaxed text-foreground">
              {approval.reason}
            </div>
          </div>

          {/* 打赏赞助 */}
          <div className="mt-4 rounded-xl border border-dashed border-rose-200 bg-rose-50/40 p-3">
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500">
              <Gift className="h-4 w-4" />
              打赏赞助金额（可选）
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              审批通过后，由你赞助这笔钱给 {approval.applicant}，多少随心意～
            </div>
            <div className="mt-2.5 grid grid-cols-5 gap-2">
              {PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setCustomMode(false);
                    setSponsor(v);
                  }}
                  className={cn(
                    "rounded-lg border py-1.5 text-xs font-medium transition",
                    !customMode && sponsor === v
                      ? "border-rose-400 bg-rose-500 text-white shadow-sm"
                      : "border-border bg-white text-foreground hover:border-rose-300"
                  )}
                >
                  {v === 0 ? "不打赏" : `¥${v}`}
                </button>
              ))}
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCustomMode(true)}
                className={cn(
                  "rounded-lg border py-1.5 text-xs font-medium transition",
                  customMode
                    ? "border-rose-400 bg-rose-500 text-white shadow-sm"
                    : "border-border bg-white text-foreground hover:border-rose-300"
                )}
              >
                自定义
              </button>
            </div>
            {customMode && (
              <div className="mt-2 flex items-center rounded-lg border border-rose-300 bg-white px-2">
                <span className="text-sm text-rose-500">¥</span>
                <Input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={customVal}
                  disabled={submitting}
                  onChange={(e) => setCustomVal(e.target.value)}
                  placeholder="输入赞助金额"
                  className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
            )}
            <div className="mt-2 text-right text-sm font-semibold text-rose-500">
              合计赞助 ¥{formatMoney(finalSponsor)}
            </div>
          </div>

          {/* 审批意见 */}
          <div className="mt-3">
            <div className="text-[11px] font-medium text-muted-foreground">
              审批意见（可选）
            </div>
            <Textarea
              value={note}
              disabled={submitting}
              onChange={(e) => setNote(e.target.value)}
              placeholder="给申请人留句话…"
              className="mt-1.5 min-h-[72px] resize-none text-[13px]"
            />
          </div>
        </div>

        {/* 底部操作 */}
        <div className="sticky bottom-0 mt-1 flex gap-2 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => submit("rejected")}
            className="flex-1 border-rose-300 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          >
            {submitting && action === "rejected" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            驳回
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => submit("approved")}
            className="flex-1 bg-[#07C160] text-white hover:bg-[#06ad56]"
          >
            {submitting && action === "approved" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            通过
            {finalSponsor > 0 && ` · 赞助 ¥${formatMoney(finalSponsor)}`}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
