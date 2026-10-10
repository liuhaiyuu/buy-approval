// 审批申请相关共享类型与工具函数

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  applicant: string;
  applicantAvatar: string | null;
  item: string;
  amount: number;
  reason: string;
  orderImage: string;
  status: ApprovalStatus;
  sponsorAmount: number;
  reviewer: string | null;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

/** 把 Prisma 对象序列化为可安全返回给前端的结构 */
export function serializeApproval(a: {
  id: string;
  applicant: string;
  applicantAvatar: string | null;
  item: string;
  amount: number;
  reason: string;
  orderImage: string;
  status: string;
  sponsorAmount: number;
  reviewer: string | null;
  reviewNote: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
}): ApprovalRequest {
  return {
    ...a,
    status: a.status as ApprovalStatus,
    createdAt: a.createdAt.toISOString(),
    reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
  };
}

/** 申请人头像：用名字首字生成一个带背景色的 SVG data url */
export function generateAvatarDataUrl(name: string): string {
  const ch = (name || "?").trim().charAt(0).toUpperCase();
  // 一组温暖、不撞 WeChat 绿的色卡
  const palette = [
    "#f59e0b",
    "#ef4444",
    "#10b981",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const color = palette[hash % palette.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' rx='40' fill='${color}'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='PingFang SC, Helvetica, Arial, sans-serif' font-size='34' font-weight='600' fill='#ffffff'>${ch}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** 金额格式化为带两位小数的字符串 */
export function formatMoney(n: number): string {
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 相对时间中文描述 */
export function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}
