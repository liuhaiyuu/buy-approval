"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApprovalRequest } from "@/lib/approvals";
import { SubmitView } from "@/components/approval/submit-view";
import { ApproveView } from "@/components/approval/approve-view";
import { HistoryView } from "@/components/approval/history-view";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PenSquare,
  ClipboardCheck,
  History,
  User,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "applicant" | "reviewer";
type Tab = "submit" | "approve" | "history";

export default function Page() {
  const [role, setRole] = useState<Role>("applicant");
  const [tab, setTab] = useState<Tab>("submit");
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 审批人名字可设置
  const [reviewerName, setReviewerName] = useState("老板");
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState("老板");

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

  function openEdit() {
    setDraftName(reviewerName);
    setEditOpen(true);
  }
  function saveEdit() {
    const n = draftName.trim();
    if (n) setReviewerName(n);
    setEditOpen(false);
  }

  return (
    <div
      className="flex min-h-screen justify-center"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, #ffe9d6 0%, transparent 45%), radial-gradient(circle at 90% 30%, #ffd5e0 0%, transparent 40%), linear-gradient(180deg, #fff6f0 0%, #fff0e6 100%)",
      }}
    >
      <div className="relative flex w-full max-w-[430px] flex-col">
        {/* 顶部 Header —— 粉色渐变 + 吉祥物 */}
        <header className="relative z-40 overflow-hidden rounded-b-[28px] bg-gradient-to-br from-[var(--cute-pink)] via-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-white shadow-[0_8px_24px_-10px_rgba(255,122,157,0.6)]">
          {/* 装饰圆点 */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute right-16 top-10 h-10 w-10 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-2.5 px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
            {/* 吉祥物小熊 */}
            <div className="cute-float relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-md">
              <img
                src="/mascot-bear.png"
                alt="小熊审批员"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1 text-[15px] font-black">
                买前审批
                <span className="text-base">🐻</span>
              </div>
              <div className="text-[10px] font-medium text-white/90">
                花钱之前，先过老板这一关嘛～
              </div>
            </div>

            {/* 角色切换 */}
            <div className="ml-auto flex rounded-full bg-black/15 p-0.5 text-[11px] backdrop-blur">
              <button
                type="button"
                onClick={() => setRole("applicant")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 font-bold transition",
                  role === "applicant"
                    ? "bg-white text-[var(--cute-pink-deep)] shadow"
                    : "text-white/90"
                )}
              >
                <User className="h-3 w-3" />
                申请
              </button>
              <button
                type="button"
                onClick={() => setRole("reviewer")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 font-bold transition",
                  role === "reviewer"
                    ? "bg-white text-[var(--cute-pink-deep)] shadow"
                    : "text-white/90"
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                审批
              </button>
            </div>
          </div>

          {/* 当前身份提示条 */}
          <div className="relative flex items-center gap-1.5 bg-black/10 px-4 py-1.5 text-[11px] font-medium text-white/95">
            {role === "applicant" ? (
              <>
                <span className="font-bold">🧑 小可爱</span>
                <span className="opacity-90">· 来报备一下要买啥吧</span>
              </>
            ) : (
              <>
                <span className="font-bold">👑 {reviewerName}</span>
                <span className="opacity-90">
                  · 还有 {pendingCount} 单等你翻牌子
                </span>
                <button
                  type="button"
                  onClick={openEdit}
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white transition hover:bg-white/30"
                  aria-label="设置审批人"
                >
                  <Pencil className="h-2.5 w-2.5" />
                  改名
                </button>
              </>
            )}
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 pb-2">
          {tab === "submit" && (
            <SubmitView
              onSubmitted={() => {
                refresh();
              }}
            />
          )}
          {tab === "approve" && (
            <ApproveView
              approvals={approvals}
              reviewer={reviewerName}
              loading={loading}
              onReviewed={refresh}
            />
          )}
          {tab === "history" && (
            <HistoryView approvals={approvals} loading={loading} />
          )}
        </main>

        {/* 底部 Tab 栏 —— 软白卡片 */}
        <nav className="sticky bottom-0 z-40 rounded-t-[24px] border-2 border-b-0 border-white bg-white/95 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-6px_20px_-8px_rgba(255,122,157,0.3)] backdrop-blur">
          <div className="grid grid-cols-3">
            <TabItem
              active={tab === "submit"}
              icon={<PenSquare className="h-5 w-5" />}
              label="申请"
              emoji="✏️"
              onClick={() => setTab("submit")}
            />
            <TabItem
              active={tab === "approve"}
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="审批"
              emoji="📮"
              badge={pendingCount}
              onClick={() => setTab("approve")}
            />
            <TabItem
              active={tab === "history"}
              icon={<History className="h-5 w-5" />}
              label="记录"
              emoji="📚"
              onClick={() => setTab("history")}
            />
          </div>
        </nav>
      </div>

      {/* 设置审批人弹窗 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl border-2 border-white p-0 sm:max-w-[340px]">
          <DialogHeader className="px-5 pt-5 pb-1">
            <DialogTitle className="flex items-center gap-1.5 text-base font-bold text-[var(--cute-ink)]">
              👑 设置审批人
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[var(--cute-ink-soft)]">
              给审批人起个名字吧～比如「老板」「老公」「女王大人」
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-3">
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="审批人称呼"
              maxLength={12}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
              }}
              className="h-11 rounded-xl border-2 border-[#ffe5d6] bg-[var(--cute-bg)] text-[var(--cute-ink)] placeholder:text-[var(--cute-ink-soft)]/60 focus-visible:border-[var(--cute-pink)] focus-visible:ring-[var(--cute-pink-soft)]"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["老板", "老公", "媳妇", "女王大人", "财阀"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDraftName(n)}
                  className="rounded-full border-2 border-[#ffe5d6] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[var(--cute-ink)] transition hover:border-[var(--cute-pink)] hover:text-[var(--cute-pink-deep)]"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 px-5 pb-5 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="flex-1 rounded-xl border-2 border-[#ffe5d6] text-[var(--cute-ink-soft)] hover:bg-[var(--cute-bg)] hover:text-[var(--cute-ink)]"
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={saveEdit}
              disabled={!draftName.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-white shadow-[0_3px_0_-1px_#ff5c86] hover:from-[var(--cute-pink-deep)] hover:to-[var(--cute-pink-deep)]"
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabItem({
  active,
  icon,
  label,
  emoji,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  emoji: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-bold transition",
        active ? "text-[var(--cute-pink-deep)]" : "text-[var(--cute-ink-soft)]"
      )}
    >
      <span
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-2xl transition",
          active
            ? "bg-gradient-to-br from-[var(--cute-pink)] to-[var(--cute-pink-deep)] text-white shadow-[0_3px_0_-1px_#ff5c86]"
            : "text-[var(--cute-ink-soft)]"
        )}
      >
        {active ? <span className="text-base">{emoji}</span> : icon}
        {!!badge && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-[16px] place-items-center rounded-full border-2 border-white bg-[var(--cute-reject)] px-1 text-[9px] font-black text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}
