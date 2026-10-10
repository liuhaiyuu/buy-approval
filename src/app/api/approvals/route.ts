import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeApproval, generateAvatarDataUrl } from "@/lib/approvals";
import sharp from "sharp";

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

/**
 * 把上传的图片压缩为 JPEG base64 data URL。
 * - 限制最大宽度 1280px（截图足够清晰，又控制体积）
 * - JPEG quality 80，体积/质量平衡
 * - 返回的 data URL 可直接 <img src> 显示，也能存数据库
 * - 单张通常 100~400KB，SQLite 完全扛得住
 */
async function imageToDataUrl(file: File): Promise<string> {
  const raw = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(raw)
    .rotate() // 保留 EXIF 方向
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  const base64 = compressed.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
}

/** POST /api/approvals  —— multipart/form-data
 *  仅 orderImage 与 reason 必填；applicant/item/amount 可选，缺省时给默认值
 *  图片以 base64 data URL 形式存入数据库，不依赖文件系统，部署友好 */
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

    // 限制原图 10MB（压缩后会小很多）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "图片不能超过 10MB" }, { status: 400 });
    }

    // 压缩 + 转 base64 data URL，存数据库
    const orderImage = await imageToDataUrl(file);

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
