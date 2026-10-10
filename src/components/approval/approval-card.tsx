"use client";

import type { ApprovalRequest } from "@/lib/approvals";
import { formatMoney, relativeTime } from "@/lib/approvals";
import { StatusBadge } from "./status-badge";
import { ChevronRight, Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: ApprovalRequest;
  onClick?: () => void;
  showSponsor?: boolean;
}

export function ApprovalCard({ data, onClick, showSponsor = true }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cute-pop flex w-full items-stretch gap-3 rounded-3xl border-2 border-white bg-white p-3 text-left shadow-[0_4px_0_-1px_#ffe5d6,0_10px_22px_-10px_rgba(255,122,157,0.35)] transition active:translate-y-0.5 active:shadow-[0_2px_0_-1px_#ffe5d6,0_6px_14px_-10px_rgba(255,122,157,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_-1px_#ffd5e0,0_14px_26px_-10px_rgba(255,122,157,0.45)]"
    >
      {/* 缩略图 —— 圆角更大的贴纸感 */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-[var(--cute-bg-2)] shadow-sm">
        <img
          src={data.orderImage}
          alt={data.item}
          className="h-full w-full object-cover"
        />
        {data.status === "pending" && (
          <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-[var(--cute-pending)] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
            待审
          </span>
        )}
      </div>

      {/* 主体 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {data.applicantAvatar && (
                <img
                  src={data.applicantAvatar}
                  alt={data.applicant}
                  className="h-5 w-5 rounded-full border border-white shadow-sm"
                />
              )}
              <span className="text-[11px] font-medium text-[var(--cute-ink-soft)]">
                {data.applicant}
              </span>
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-[var(--cute-ink)]">
              {data.item}
            </div>
          </div>
          {data.status !== "pending" ? (
            <StatusBadge status={data.status} />
          ) : (
            <div className="grid h-6 w-6 place-items-center rounded-full bg-[var(--cute-pink-soft)]">
              <ChevronRight className="h-3.5 w-3.5 text-[var(--cute-pink-deep)]" />
            </div>
          )}
        </div>

        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-0.5">
              {data.amount > 0 ? (
                <>
                  <span className="text-xs font-medium text-[var(--cute-pink-deep)]">
                    ¥
                  </span>
                  <span className="text-base font-bold text-[var(--cute-pink-deep)]">
                    {formatMoney(data.amount)}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-[var(--cute-bg-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--cute-ink-soft)]">
                  见截图 📸
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[10px] text-[var(--cute-ink-soft)]">
              {relativeTime(data.createdAt)}
            </div>
          </div>
          {showSponsor &&
            data.status === "approved" &&
            data.sponsorAmount > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-[#ffd0d8] bg-[var(--cute-pink-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--cute-pink-deep)]">
                <Gift className="h-3 w-3" />
                赞助 ¥{formatMoney(data.sponsorAmount)}
              </div>
            )}
        </div>
      </div>
    </button>
  );
}

export { Sparkles };
