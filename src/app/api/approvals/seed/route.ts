import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeApproval, generateAvatarDataUrl } from "@/lib/approvals";

/** POST /api/approvals/seed
 *  幂等：仅在表为空时写入演示数据 */
export async function POST() {
  try {
    const count = await db.approvalRequest.count();
    if (count > 0) {
      return NextResponse.json({ seeded: false, message: "已有数据，跳过" });
    }

    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    const records = await db.approvalRequest.createMany({
      data: [
        {
          applicant: "小敏",
          applicantAvatar: generateAvatarDataUrl("小敏"),
          item: "Sony WH-1000XM5 头戴式降噪耳机",
          amount: 2399,
          reason:
            "工位在走廊边，每天噪音太大影响专注，降噪耳机能显著提升开发效率，建议作为生产力工具采购。",
          orderImage: "/uploads/seed-headphones.png",
          status: "pending",
          createdAt: new Date(now - 2 * hour),
        },
        {
          applicant: "阿杰",
          applicantAvatar: generateAvatarDataUrl("阿杰"),
          item: "Nike Air Force 1 白色运动鞋",
          amount: 799,
          reason: "下周公司团建要爬山，旧鞋鞋底磨平了容易打滑，需要一双防滑好走路的鞋。",
          orderImage: "/uploads/seed-sneakers.png",
          status: "pending",
          createdAt: new Date(now - 5 * hour),
        },
        {
          applicant: "Lily",
          applicantAvatar: generateAvatarDataUrl("Lily"),
          item: "Keychron K3 矮轴机械键盘",
          amount: 458,
          reason: "笔记本自带键盘写长文手感差、易疲劳，矮轴键盘便携且手感好，提升写文档效率。",
          orderImage: "/uploads/seed-keyboard.png",
          status: "pending",
          createdAt: new Date(now - 26 * hour),
        },
        {
          applicant: "老王",
          applicantAvatar: generateAvatarDataUrl("老王"),
          item: "罗技 MX Master 3S 无线鼠标",
          amount: 699,
          reason: "做设计需要精准滚轮和侧键自定义，原鼠标左键双击失灵影响出图进度。",
          orderImage: "/uploads/seed-keyboard.png",
          status: "approved",
          sponsorAmount: 200,
          reviewer: "老板",
          reviewNote: "通过，鼠标属于生产力工具，赞助 200 元辛苦费，剩下自己搞定～",
          createdAt: new Date(now - 3 * day),
          reviewedAt: new Date(now - 2 * day),
        },
        {
          applicant: "小敏",
          applicantAvatar: generateAvatarDataUrl("小敏"),
          item: "星巴克樱花限定保温杯",
          amount: 188,
          reason: "办公室空调太冷，想买个保温杯喝热水养生。",
          orderImage: "/uploads/seed-sneakers.png",
          status: "rejected",
          reviewer: "老板",
          reviewNote: "驳回，办公区已有饮水机和纸杯，保温杯属个人喜好，不在审批范围。",
          createdAt: new Date(now - 6 * day),
          reviewedAt: new Date(now - 5 * day),
        },
      ],
    });

    const all = await db.approvalRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ seeded: true, count: records.count, data: all.map(serializeApproval) });
  } catch (err) {
    console.error("[approvals/seed] error", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
