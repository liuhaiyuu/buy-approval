import type { ApprovalStatus } from "@/lib/approvals";

const MAP: Record<
  ApprovalStatus,
  { label: string; emoji: string; cls: string; dot: string }
> = {
  pending: {
    label: "等审批",
    emoji: "⏳",
    cls: "bg-[var(--cute-pending-soft)] text-[#d98c1f] border-[#ffd9a0]",
    dot: "bg-[var(--cute-pending)]",
  },
  approved: {
    label: "通过啦",
    emoji: "✅",
    cls: "bg-[var(--cute-mint-soft)] text-[#2f9e7e] border-[#aee6d6]",
    dot: "bg-[var(--cute-mint-deep)]",
  },
  rejected: {
    label: "被退回",
    emoji: "🙅",
    cls: "bg-[var(--cute-reject-soft)] text-[#d96060] border-[#ffb0b0]",
    dot: "bg-[var(--cute-reject)]",
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
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${m.cls} ${
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
    >
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}
