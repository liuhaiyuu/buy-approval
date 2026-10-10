import type { ApprovalStatus } from "@/lib/approvals";

const MAP: Record<
  ApprovalStatus,
  { label: string; cls: string; dot: string }
> = {
  pending: {
    label: "待审批",
    cls: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "已通过",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "已驳回",
    cls: "bg-rose-50 text-rose-500 border-rose-200",
    dot: "bg-rose-500",
  },
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: ApprovalStatus;
  size?: "sm" | "md";
}) {
  const m = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${m.cls} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
