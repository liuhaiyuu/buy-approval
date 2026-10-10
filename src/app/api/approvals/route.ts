import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeApproval, generateAvatarDataUrl } from "@/lib/approvals";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/** GET /api/approvals?status=pending|approved|rejected|all */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || "all";
  const where = status === "all" ? {} : { status };
  const list = await db.approvalRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: list.map(serializeApproval) });
}

/** POST /api/approvals  —— multipart/form-data */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const applicant = String(form.get("applicant") || "").trim();
    const item = String(form.get("item") || "").trim();
    const amountRaw = String(form.get("amount") || "0").trim();
    const reason = String(form.get("reason") || "").trim();
    const file = form.get("orderImage") as File | null;

    if (!applicant) {
      return NextResponse.json({ error: "请填写申请人" }, { status: 400 });
    }
    if (!item) {
      return NextResponse.json({ error: "请填写商品名称" }, { status: 400 });
    }
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "请填写有效的商品金额" }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: "请填写购买原因" }, { status: 400 });
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "请上传订单截图" }, { status: 400 });
    }

    // 限制 8MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "图片不能超过 8MB" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    const orderImage = `/uploads/${filename}`;

    const created = await db.approvalRequest.create({
      data: {
        applicant,
        applicantAvatar: generateAvatarDataUrl(applicant),
        item,
        amount,
        reason,
        orderImage,
        status: "pending",
      },
    });
    return NextResponse.json({ data: serializeApproval(created) }, { status: 201 });
  } catch (err) {
    console.error("[approvals/POST] error", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
