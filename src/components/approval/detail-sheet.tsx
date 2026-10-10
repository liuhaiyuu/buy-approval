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
import { Gift, Check, X, Loader2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [0, 10, 20, 50, 100];
const PRESET_EMOJI: Record<number, string> = {
  0: "🙈",
  10: "🍬",
  20: "🧋",
  50: "🍰",
  100: "💐",
};

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
      <DrawerContent className="max-h-[92vh] !rounded-t-3xl border-2 border-b-0 border-white">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="text-base font-bold text-[var(--cute-ink)]">
            📋 审批详情
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            查看申请并审批
          </DrawerDescription>
        </DrawerHeader>

        <div className="cute-scroll flex-1 overflow-y-auto px-4 pb-2">
          {/* 订单截图 */}
          <div className="overflow-hidden rounded-2xl border-2 border-white shadow-[0_4px_0_-1px_#ffe5d6]">
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
                className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
              />
            )}
            <span className="text-sm font-bold text-[var(--cute-ink)]">
              {approval.applicant}
            </span>
            <span className="text-[11px] text-[var(--cute-ink-soft)]">
              · {relativeTime(approval.createdAt)}求批
            </span>
            <span className="ml-auto">
              <StatusBadge status={approval.status} />
            </span>
          </div>

          {/* 商品 + 金额 */}
          <div className="mt-3 rounded-2xl border-2 border-white bg-[var(--cute-bg)] p-3 shadow-[0_3px_0_-1px_#ffe5d6]">
            <div className="text-[11px] font-medium text-[var(--cute-ink-soft)]">
              🛍️ {approval.amount > 0 ? "想买啥" : "商品 & 金额"}
            </div>
            {approval.amount > 0 ? (
              <>
                <div className="mt-0.5 text-sm font-bold text-[var(--cute-ink)]">
                  {approval.item}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs text-[var(--cute-ink-soft)]">
                    订单金额
                  </span>
                  <span className="ml-auto text-xl font-black text-[var(--cute-pink-deep)]">
                    ¥{formatMoney(approval.amount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-1 text-[13px] font-medium text-[var(--cute-ink-soft)]">
                看上面的订单截图就好啦 📸
              </div>
            )}
          </div>

          {/* 购买原因 */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--cute-ink-soft)]">
              <MessageSquareText className="h-3.5 w-3.5" />
              购买理由
            </div>
            <div className="mt-1.5 rounded-2xl border-2 border-[#ffe5d6] bg-white p-3 text-[13px] leading-relaxed text-[var(--cute-ink)]">
              {approval.reason}
            </div>
          </div>

          {/* 打赏赞助 —— 可爱核心 */}
          <div className="mt-4 rounded-2xl border-2 border-dashed border-[#ffc4d4] bg-[var(--cute-pink-soft)]/40 p-3">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--cute-pink-deep)]">
              <Gift className="h-4 w-4" />
              打赏赞助金额
            </div>
            <div className="mt-1 text-[11px] text-[var(--cute-ink-soft)]">
              审批通过后，由你赞助这笔钱给 {approval.applicant}～多少随心意啦
              💕
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
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
                    "flex flex-col items-center gap-0.5 rounded-2xl border-2 py-2 text-xs font-bold transition",
                    !customMode && sponsor === v
                      ? "border-[var(--cute-pink-deep)] bg-gradient-to-br from-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-white shadow-[0_3px_0_-1px_#ff5c86]"
                      : "border-white bg-white text-[var(--cute-ink)] hover:border-[var(--cute-pink)]"
                  )}
                >
                  <span className="text-base leading-none">
                    {PRESET_EMOJI[v]}
                  </span>
                  {v === 0 ? "不打赏" : `¥${v}`}
                </button>
              ))}
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCustomMode(true)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl border-2 py-2 text-xs font-bold transition",
                  customMode
                    ? "border-[var(--cute-pink-deep)] bg-gradient-to-br from-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-white shadow-[0_3px_0_-1px_#ff5c86]"
                    : "border-white bg-white text-[var(--cute-ink)] hover:border-[var(--cute-pink)]"
                )}
              >
                <span className="text-base leading-none">✨</span>
                自定义
              </button>
            </div>
            {customMode && (
              <div className="mt-2 flex items-center rounded-2xl border-2 border-[var(--cute-pink)] bg-white px-3">
                <span className="text-sm font-bold text-[var(--cute-pink-deep)]">
                  ¥
                </span>
                <Input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={customVal}
                  disabled={submitting}
                  onChange={(e) => setCustomVal(e.target.value)}
                  placeholder="输入金额"
                  className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
            )}
            <div className="mt-2 text-right text-sm font-black text-[var(--cute-pink-deep)]">
              合计赞助 ¥{formatMoney(finalSponsor)} 💝
            </div>
          </div>

          {/* 审批意见 */}
          <div className="mt-3">
            <div className="text-[11px] font-bold text-[var(--cute-ink-soft)]">
              💬 给申请人留句话（可选）
            </div>
            <Textarea
              value={note}
              disabled={submitting}
              onChange={(e) => setNote(e.target.value)}
              placeholder="想对TA说点啥～"
              className="mt-1.5 min-h-[72px] resize-none rounded-2xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] text-[13px] leading-relaxed text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
            />
          </div>
        </div>

        {/* 底部操作 */}
        <div className="sticky bottom-0 mt-1 flex gap-2 border-t-2 border-[#ffe5d6] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => submit("rejected")}
            className="flex-1 rounded-2xl border-2 border-[var(--cute-reject)] bg-[var(--cute-reject-soft)] text-[var(--cute-reject)] hover:bg-[var(--cute-reject)] hover:text-white"
          >
            {submitting && action === "rejected" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            退回
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => submit("approved")}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--cute-mint)] to-[var(--cute-mint-deep)] text-white shadow-[0_4px_0_-1px_#3aa88a] hover:from-[var(--cute-mint-deep)] hover:to-[var(--cute-mint-deep)]"
          >
            {submitting && action === "approved" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            通过
            {finalSponsor > 0 && ` · 赏 ¥${formatMoney(finalSponsor)}`}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
