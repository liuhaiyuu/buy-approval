"use client";

import { useMemo, useState } from "react";
import type { ApprovalRequest, ApprovalStatus } from "@/lib/approvals";
import { formatMoney, relativeTime } from "@/lib/approvals";
import { ApprovalCard } from "./approval-card";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  History,
  Gift,
  CheckCircle2,
  XCircle,
  Inbox,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | ApprovalStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待审批" },
  { key: "approved", label: "已通过" },
  { key: "rejected", label: "已驳回" },
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
      {/* 统计区 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <History className="h-3 w-3" /> 审批统计
          </div>
          <div className="mt-2 flex items-end gap-3">
            <Stat label="通过" value={stats.approved} color="text-emerald-500" />
            <Stat label="驳回" value={stats.rejected} color="text-rose-500" />
            <Stat label="待审" value={stats.pending} color="text-amber-500" />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 p-4 text-white shadow-sm shadow-rose-500/20">
          <div className="flex items-center gap-1.5 text-[11px] opacity-90">
            <Gift className="h-3 w-3" /> 累计赞助
          </div>
          <div className="mt-2 text-2xl font-bold leading-none">
            ¥{formatMoney(stats.sponsorTotal)}
          </div>
          <div className="mt-1.5 text-[11px] opacity-80">
            已通过 ¥{formatMoney(stats.approvedAmount)} 商品
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                filter === f.key
                  ? "border-[#07C160] bg-[#07C160] text-white shadow-sm"
                  : "border-border bg-white text-foreground hover:border-[#07C160]/50"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "ml-1.5",
                  filter === f.key ? "text-white/80" : "text-muted-foreground"
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
              className="h-24 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">
              暂无记录
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
        <DrawerContent className="max-h-[90vh] !rounded-t-2xl">
          <DrawerHeader className="pb-2 text-center">
            <DrawerTitle className="text-base">申请详情</DrawerTitle>
            <DrawerDescription className="sr-only">
              查看申请详情
            </DrawerDescription>
          </DrawerHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <div className="overflow-hidden rounded-xl ring-1 ring-black/5">
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
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">
                  {selected.applicant}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  · {relativeTime(selected.createdAt)}申请
                </span>
                <span className="ml-auto">
                  <StatusBadge status={selected.status} />
                </span>
              </div>

              <div className="mt-3 rounded-xl bg-muted/60 p-3">
                <div className="text-[11px] text-muted-foreground">购买商品</div>
                <div className="mt-0.5 text-sm font-medium">{selected.item}</div>
                <div className="mt-2 flex items-baseline">
                  <span className="text-xs text-muted-foreground">订单金额</span>
                  <span className="ml-auto text-xl font-semibold text-[#07C160]">
                    ¥{formatMoney(selected.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[11px] font-medium text-muted-foreground">
                  购买原因
                </div>
                <div className="mt-1.5 rounded-xl border border-border bg-white p-3 text-[13px] leading-relaxed">
                  {selected.reason}
                </div>
              </div>

              {selected.status !== "pending" && (
                <div
                  className={cn(
                    "mt-3 rounded-xl border p-3",
                    selected.status === "approved"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-rose-200 bg-rose-50/50"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-medium">
                    {selected.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span
                      className={
                        selected.status === "approved"
                          ? "text-emerald-600"
                          : "text-rose-500"
                      }
                    >
                      {selected.status === "approved" ? "审批通过" : "已驳回"}
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {selected.reviewedAt
                        ? relativeTime(selected.reviewedAt)
                        : ""}
                      {selected.reviewer ? ` · ${selected.reviewer}` : ""}
                    </span>
                  </div>
                  {selected.status === "approved" &&
                    selected.sponsorAmount > 0 && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/70 p-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-100">
                          <Gift className="h-4 w-4 text-rose-500" />
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground">
                            赞助打赏
                          </div>
                          <div className="text-sm font-semibold text-rose-500">
                            ¥{formatMoney(selected.sponsorAmount)}
                          </div>
                        </div>
                      </div>
                    )}
                  {selected.reviewNote && (
                    <div className="mt-2 flex gap-1.5">
                      <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="text-[12px] leading-relaxed text-foreground">
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
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className={cn("text-lg font-bold leading-none", color)}>{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
