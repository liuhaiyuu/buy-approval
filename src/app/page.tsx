"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApprovalRequest } from "@/lib/approvals";
import { SubmitView } from "@/components/approval/submit-view";
import { ApproveView } from "@/components/approval/approve-view";
import { HistoryView } from "@/components/approval/history-view";
import {
  PenSquare,
  ClipboardCheck,
  History,
  ShoppingBag,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "applicant" | "reviewer";
type Tab = "submit" | "approve" | "history";

const APPLICANT_NAME = "小敏";
const REVIEWER_NAME = "老板";

export default function Page() {
  const [role, setRole] = useState<Role>("applicant");
  const [tab, setTab] = useState<Tab>("submit");
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/approvals?status=all", { cache: "no-store" });
      const j = await res.json();
      setApprovals(j.data || []);
    } catch (e) {
      console.error("refresh error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载：种子 + 拉取
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/approvals/seed", { method: "POST" });
      } catch (e) {
        console.error("seed error", e);
      }
      refresh();
    })();
  }, [refresh]);

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  return (
    <div className="flex min-h-screen justify-center bg-[#e9ebef]">
      <div className="relative flex w-full max-w-[430px] flex-col bg-[#ededed] shadow-xl shadow-black/10">
        {/* 顶部 Header */}
        <header className="sticky top-0 z-40 bg-[#07C160] text-white shadow-sm">
          <div className="flex items-center gap-2 px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 backdrop-blur">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">买前审批</div>
              <div className="text-[10px] text-white/80">
                花钱之前，先过老板这一关
              </div>
            </div>

            {/* 角色切换 */}
            <div className="ml-auto flex rounded-full bg-black/15 p-0.5 text-[11px] backdrop-blur">
              <button
                type="button"
                onClick={() => setRole("applicant")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition",
                  role === "applicant"
                    ? "bg-white text-[#07C160] shadow"
                    : "text-white/90"
                )}
              >
                <User className="h-3 w-3" />
                申请人
              </button>
              <button
                type="button"
                onClick={() => setRole("reviewer")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition",
                  role === "reviewer"
                    ? "bg-white text-[#07C160] shadow"
                    : "text-white/90"
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                审批人
              </button>
            </div>
          </div>

          {/* 当前身份提示条 */}
          <div className="flex items-center gap-1.5 bg-black/10 px-4 py-1.5 text-[11px] text-white/90">
            <span className="font-medium">
              {role === "applicant" ? APPLICANT_NAME : REVIEWER_NAME}
            </span>
            <span className="opacity-80">
              {role === "applicant"
                ? "· 提交你的购买申请"
                : `· 待审批 ${pendingCount} 单`}
            </span>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 pb-2">
          {tab === "submit" && (
            <SubmitView
              defaultApplicant={APPLICANT_NAME}
              onSubmitted={() => {
                refresh();
              }}
            />
          )}
          {tab === "approve" && (
            <ApproveView
              approvals={approvals}
              reviewer={REVIEWER_NAME}
              loading={loading}
              onReviewed={refresh}
            />
          )}
          {tab === "history" && (
            <HistoryView approvals={approvals} loading={loading} />
          )}
        </main>

        {/* 底部 Tab 栏（sticky 在视口底部，短内容时也贴底） */}
        <nav className="sticky bottom-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur pb-[max(0px,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-3">
            <TabItem
              active={tab === "submit"}
              icon={<PenSquare className="h-5 w-5" />}
              label="申请"
              onClick={() => setTab("submit")}
            />
            <TabItem
              active={tab === "approve"}
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="审批"
              badge={pendingCount}
              onClick={() => setTab("approve")}
            />
            <TabItem
              active={tab === "history"}
              icon={<History className="h-5 w-5" />}
              label="记录"
              onClick={() => setTab("history")}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

function TabItem({
  active,
  icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition",
        active ? "text-[#07C160]" : "text-muted-foreground"
      )}
    >
      <span className="relative">
        {icon}
        {!!badge && badge > 0 && (
          <span className="absolute -right-2.5 -top-1.5 grid min-w-[15px] place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {label}
      {active && (
        <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#07C160]" />
      )}
    </button>
  );
}
