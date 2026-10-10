"use client";

import { useMemo, useState } from "react";
import type { ApprovalRequest } from "@/lib/approvals";
import { ApprovalCard } from "./approval-card";
import { DetailSheet } from "./detail-sheet";
import { ClipboardCheck, Inbox, Clock3 } from "lucide-react";

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
      {/* 顶部统计卡 */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#07C160] to-[#06ad56] p-4 text-white shadow-lg shadow-[#07C160]/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs/none opacity-90">
              <ClipboardCheck className="h-3.5 w-3.5" />
              待我审批
            </div>
            <div className="mt-1.5 text-3xl font-bold leading-none">
              {pending.length}
              <span className="ml-1 text-sm font-normal opacity-80">单</span>
            </div>
            <div className="mt-1.5 text-[11px] opacity-80">
              {pending.length > 0
                ? "点开每单查看订单截图和原因"
                : "全部审批完成，辛苦啦～"}
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur">
            <Clock3 className="h-8 w-8" />
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
                className="h-24 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#07C160]/10">
              <Inbox className="h-8 w-8 text-[#07C160]" />
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">
              暂无待审批申请
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              申请人提交后，会出现在这里
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
