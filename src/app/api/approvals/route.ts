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

/** POST /api/approvals  —— multipart/form-data
 *  仅 orderImage 与 reason 必填；applicant/item/amount 可选，缺省时给默认值 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const applicant =
      String(form.get("applicant") || "").trim() || "小可爱";
    const item = String(form.get("item") || "").trim() || "见订单截图哟";
    const amountRaw = String(form.get("amount") || "0").trim();
    const amount = Number(amountRaw) || 0;
    const reason = String(form.get("reason") || "").trim();
    const file = form.get("orderImage") as File | null;

    if (!reason) {
      return NextResponse.json({ error: "请填写购买理由" }, { status: 400 });
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
