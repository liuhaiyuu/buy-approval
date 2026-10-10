"use client";

import { useMemo, useState } from "react";
import type { ApprovalRequest, ApprovalStatus } from "@/lib/approvals";
import { formatMoney, relativeTime } from "@/lib/approvals";
import { ApprovalCard } from "./approval-card";
import { StatusBadge } from "./status-badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Gift, CheckCircle2, XCircle, Inbox, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | ApprovalStatus;

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: "all", label: "全部", emoji: "🌈" },
  { key: "pending", label: "等审批", emoji: "⏳" },
  { key: "approved", label: "通过啦", emoji: "✅" },
  { key: "rejected", label: "被退回", emoji: "🙅" },
];

interface Props {
  approvals: ApprovalRequest[];
  loading: boolean;
}

export function HistoryView({ approvals, loading }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const approved = approvals.filter((a) => a.status === "approved");
    const rejected = approvals.filter((a) => a.status === "rejected");
    const pending = approvals.filter((a) => a.status === "pending");
    const sponsorTotal = approved.reduce((s, a) => s + a.sponsorAmount, 0);
    const approvedAmount = approved.reduce((s, a) => s + a.amount, 0);
    return {
      approved: approved.length,
      rejected: rejected.length,
      pending: pending.length,
      sponsorTotal,
      approvedAmount,
    };
  }, [approvals]);

  const list = useMemo(
    () =>
      filter === "all"
        ? approvals
        : approvals.filter((a) => a.status === filter),
    [approvals, filter]
  );

  const selected = approvals.find((a) => a.id === selectedId) || null;

  return (
    <div className="p-4">
      {/* 统计区 —— 双卡软萌 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="cute-pop rounded-3xl border-2 border-white bg-white p-4 shadow-[0_4px_0_-1px_#ffe5d6,0_10px_22px_-12px_rgba(255,122,157,0.3)]">
          <div className="text-[11px] font-bold text-[var(--cute-ink-soft)]">
            📊 审批小账本
          </div>
          <div className="mt-2 flex items-end gap-3">
            <Stat
              emoji="✅"
              label="通过"
              value={stats.approved}
              color="text-[var(--cute-mint-deep)]"
            />
            <Stat
              emoji="🙅"
              label="退回"
              value={stats.rejected}
              color="text-[var(--cute-reject)]"
            />
            <Stat
              emoji="⏳"
              label="等审"
              value={stats.pending}
              color="text-[#d98c1f]"
            />
          </div>
        </div>
        <div className="cute-pop relative overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-[var(--cute-pink)] to-[var(--cute-pink-deep)] p-4 text-white shadow-[0_4px_0_-1px_#ff5c86,0_10px_22px_-12px_rgba(255,122,157,0.5)]">
          <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-95">
            <Gift className="h-3.5 w-3.5" /> 累计打赏
          </div>
          <div className="mt-2 text-2xl font-black leading-none">
            ¥{formatMoney(stats.sponsorTotal)}
          </div>
          <div className="mt-1.5 text-[11px] opacity-90">
            已通过 ¥{formatMoney(stats.approvedAmount)} 的购物车 💝
          </div>
        </div>
      </div>

      {/* 筛选 —— 胶囊药丸 */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 cute-scroll">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? approvals.length
              : approvals.filter((a) => a.status === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition",
                filter === f.key
                  ? "border-[var(--cute-pink-deep)] bg-gradient-to-r from-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-white shadow-[0_3px_0_-1px_#ff5c86]"
                  : "border-white bg-white text-[var(--cute-ink)] hover:border-[var(--cute-pink)]"
              )}
            >
              <span>{f.emoji}</span>
              {f.label}
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 text-[10px]",
                  filter === f.key
                    ? "bg-white/30 text-white"
                    : "bg-[var(--cute-bg-2)] text-[var(--cute-ink-soft)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 列表 */}
      <div className="mt-3 space-y-3">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-3xl bg-white/70"
            />
          ))
        ) : list.length === 0 ? (
          <div className="cute-pop flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#ffd5e0] bg-white py-16 text-center">
            <div className="cute-float grid h-20 w-20 place-items-center rounded-full bg-[var(--cute-bg-2)] text-4xl">
              📭
            </div>
            <div className="mt-3 text-sm font-bold text-[var(--cute-ink)]">
              这里空空的呀
            </div>
            <div className="mt-1 text-xs text-[var(--cute-ink-soft)]">
              换个筛选看看别的吧～
            </div>
          </div>
        ) : (
          list.map((a) => (
            <ApprovalCard
              key={a.id}
              data={a}
              onClick={() => {
                setSelectedId(a.id);
                setOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* 只读详情 */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[90vh] !rounded-t-3xl border-2 border-b-0 border-white">
          <DrawerHeader className="pb-2 text-center">
            <DrawerTitle className="text-base font-bold text-[var(--cute-ink)]">
              📝 申请详情
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              查看申请详情
            </DrawerDescription>
          </DrawerHeader>
          {selected && (
            <div className="cute-scroll flex-1 overflow-y-auto px-4 pb-6">
              <div className="overflow-hidden rounded-2xl border-2 border-white shadow-[0_4px_0_-1px_#ffe5d6]">
                <img
                  src={selected.orderImage}
                  alt={selected.item}
                  className="max-h-64 w-full object-cover"
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                {selected.applicantAvatar && (
                  <img
                    src={selected.applicantAvatar}
                    alt={selected.applicant}
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                  />
                )}
                <span className="text-sm font-bold text-[var(--cute-ink)]">
                  {selected.applicant}
                </span>
                <span className="text-[11px] text-[var(--cute-ink-soft)]">
                  · {relativeTime(selected.createdAt)}申请
                </span>
                <span className="ml-auto">
                  <StatusBadge status={selected.status} />
                </span>
              </div>

              <div className="mt-3 rounded-2xl border-2 border-white bg-[var(--cute-bg)] p-3 shadow-[0_3px_0_-1px_#ffe5d6]">
                <div className="text-[11px] font-medium text-[var(--cute-ink-soft)]">
                  🛍️ 购买商品
                </div>
                <div className="mt-0.5 text-sm font-bold text-[var(--cute-ink)]">
                  {selected.item}
                </div>
                <div className="mt-2 flex items-baseline">
                  <span className="text-xs text-[var(--cute-ink-soft)]">
                    订单金额
                  </span>
                  <span className="ml-auto text-xl font-black text-[var(--cute-pink-deep)]">
                    ¥{formatMoney(selected.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--cute-ink-soft)]">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  购买理由
                </div>
                <div className="mt-1.5 rounded-2xl border-2 border-[#ffe5d6] bg-white p-3 text-[13px] leading-relaxed text-[var(--cute-ink)]">
                  {selected.reason}
                </div>
              </div>

              {selected.status !== "pending" && (
                <div
                  className={cn(
                    "mt-3 rounded-2xl border-2 p-3",
                    selected.status === "approved"
                      ? "border-[#aee6d6] bg-[var(--cute-mint-soft)]/50"
                      : "border-[#ffb0b0] bg-[var(--cute-reject-soft)]/50"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-bold">
                    {selected.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--cute-mint-deep)]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[var(--cute-reject)]" />
                    )}
                    <span
                      className={
                        selected.status === "approved"
                          ? "text-[var(--cute-mint-deep)]"
                          : "text-[var(--cute-reject)]"
                      }
                    >
                      {selected.status === "approved"
                        ? "审批通过啦 🎉"
                        : "这单被退回啦 😢"}
                    </span>
                    <span className="ml-auto text-[11px] text-[var(--cute-ink-soft)]">
                      {selected.reviewedAt
                        ? relativeTime(selected.reviewedAt)
                        : ""}
                      {selected.reviewer ? ` · ${selected.reviewer}` : ""}
                    </span>
                  </div>
                  {selected.status === "approved" &&
                    selected.sponsorAmount > 0 && (
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-white bg-white p-2">
                        <div className="cute-float grid h-9 w-9 place-items-center rounded-full bg-[var(--cute-pink-soft)]">
                          <Gift className="h-5 w-5 text-[var(--cute-pink-deep)]" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[var(--cute-ink-soft)]">
                            老板赞助的打赏
                          </div>
                          <div className="text-sm font-black text-[var(--cute-pink-deep)]">
                            ¥{formatMoney(selected.sponsorAmount)} 💝
                          </div>
                        </div>
                      </div>
                    )}
                  {selected.reviewNote && (
                    <div className="mt-2 flex gap-1.5">
                      <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cute-ink-soft)]" />
                      <div className="text-[12px] leading-relaxed text-[var(--cute-ink)]">
                        {selected.reviewNote}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function Stat({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className={cn("text-lg font-black leading-none", color)}>
        {emoji} {value}
      </div>
      <div className="mt-0.5 text-[10px] text-[var(--cute-ink-soft)]">
        {label}
      </div>
    </div>
  );
}

// 兜底
void Inbox;
