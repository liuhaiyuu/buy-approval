import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeApproval, type ApprovalStatus } from "@/lib/approvals";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/approvals/[id] */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = await db.approvalRequest.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "不存在" }, { status: 404 });
  }
  return NextResponse.json({ data: serializeApproval(item) });
}

/** PATCH /api/approvals/[id]  body: { status, sponsorAmount, reviewNote, reviewer } */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = body.status as ApprovalStatus;
    const sponsorAmount = Number(body.sponsorAmount) || 0;
    const reviewNote = typeof body.reviewNote === "string" ? body.reviewNote.trim() : "";
    const reviewer = typeof body.reviewer === "string" ? body.reviewer.trim() : "审批人";

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "非法的审批状态" }, { status: 400 });
    }
    if (sponsorAmount < 0) {
      return NextResponse.json({ error: "打赏金额不能为负" }, { status: 400 });
    }
    // 只有通过时才允许打赏金额
    const finalSponsor = status === "approved" ? sponsorAmount : 0;

    const updated = await db.approvalRequest.update({
      where: { id },
      data: {
        status,
        sponsorAmount: finalSponsor,
        reviewer,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ data: serializeApproval(updated) });
  } catch (err) {
    console.error("[approvals/PATCH] error", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
