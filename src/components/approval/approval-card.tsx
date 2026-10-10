"use client";

import type { ApprovalRequest } from "@/lib/approvals";
import { formatMoney, relativeTime } from "@/lib/approvals";
import { StatusBadge } from "./status-badge";
import { ChevronRight, Gift } from "lucide-react";

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
      className="flex w-full items-stretch gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-black/[0.03] transition active:scale-[0.99] hover:shadow-md"
    >
      {/* 缩略图 */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={data.orderImage}
          alt={data.item}
          className="h-full w-full object-cover"
        />
        {data.status === "pending" && (
          <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-medium text-white">
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
                  className="h-4 w-4 rounded-full"
                />
              )}
              <span className="text-[11px] text-muted-foreground">
                {data.applicant}
              </span>
            </div>
            <div className="mt-1 truncate text-sm font-medium text-foreground">
              {data.item}
            </div>
          </div>
          {data.status !== "pending" ? (
            <StatusBadge status={data.status} />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          )}
        </div>

        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <div className="text-base font-semibold text-[#07C160]">
              ¥{formatMoney(data.amount)}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {relativeTime(data.createdAt)}
            </div>
          </div>
          {showSponsor &&
            data.status === "approved" &&
            data.sponsorAmount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-500">
                <Gift className="h-3 w-3" />
                赞助 ¥{formatMoney(data.sponsorAmount)}
              </div>
            )}
        </div>
      </div>
    </button>
  );
}
