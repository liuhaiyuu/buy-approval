"use client";

import { useMemo, useState } from "react";
import type { ApprovalRequest } from "@/lib/approvals";
import { ApprovalCard } from "./approval-card";
import { DetailSheet } from "./detail-sheet";
import { Inbox, Clock3, Sparkles } from "lucide-react";

interface Props {
  approvals: ApprovalRequest[];
  reviewer: string;
  loading: boolean;
  onReviewed: () => void;
}

export function ApproveView({
  approvals,
  reviewer,
  loading,
  onReviewed,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const pending = useMemo(
    () => approvals.filter((a) => a.status === "pending"),
    [approvals]
  );
  const selected = useMemo(
    () => approvals.find((a) => a.id === selectedId) || null,
    [approvals, selectedId]
  );

  function openDetail(a: ApprovalRequest) {
    setSelectedId(a.id);
    setOpen(true);
  }

  return (
    <div className="p-4">
      {/* 顶部统计卡 —— 粉色渐变软萌 */}
      <div className="cute-pop relative overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-[var(--cute-pink)] to-[var(--cute-pink-deep)] p-4 text-white shadow-[0_6px_0_-1px_#ff5c86,0_14px_28px_-10px_rgba(255,122,157,0.55)]">
        {/* 装饰星星 */}
        <Sparkles className="cute-twinkle absolute right-4 top-3 h-4 w-4 text-white/80" />
        <Sparkles className="cute-twinkle absolute right-10 top-8 h-3 w-3 text-white/60" style={{ animationDelay: "0.6s" } as React.CSSProperties} />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs/none font-medium opacity-95">
              <Clock3 className="h-3.5 w-3.5" />
              等你审批的单子
            </div>
            <div className="mt-2 flex items-baseline gap-1 leading-none">
              <span className="text-4xl font-black">{pending.length}</span>
              <span className="text-sm font-medium opacity-90">单</span>
            </div>
            <div className="mt-2 text-[11px] opacity-90">
              {pending.length > 0
                ? "点开看看订单截图和理由叭～"
                : "全部审完啦，真棒！奖励自己一杯奶茶 🧋"}
            </div>
          </div>
          <div className="cute-float grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur">
            <span className="text-3xl">📮</span>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-3xl bg-white/70"
              />
            ))}
          </>
        ) : pending.length === 0 ? (
          <div className="cute-pop flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#ffd5e0] bg-white py-16 text-center">
            <div className="cute-float grid h-20 w-20 place-items-center rounded-full bg-[var(--cute-pink-soft)] text-4xl">
              🎉
            </div>
            <div className="mt-3 text-sm font-bold text-[var(--cute-ink)]">
              哇哦，没有待审批啦
            </div>
            <div className="mt-1 text-xs text-[var(--cute-ink-soft)]">
              申请人提交后会出现在这里哟
            </div>
          </div>
        ) : (
          pending.map((a) => (
            <ApprovalCard
              key={a.id}
              data={a}
              showSponsor={false}
              onClick={() => openDetail(a)}
            />
          ))
        )}
      </div>

      <DetailSheet
        open={open}
        onOpenChange={setOpen}
        approval={selected}
        reviewer={reviewer}
        onReviewed={onReviewed}
      />
    </div>
  );
}

// 兜底避免未使用告警
void Inbox;
