import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {

  const {shareId} = await params
  // 1. Find the file in DB
  const file = await db.query.files.findFirst({
    where: eq(files.shareId, shareId),
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 2. Check expiry
  if (file.expiresAt && new Date() > file.expiresAt) {
    return NextResponse.json({ error: "File has expired" }, { status: 410 });
  }

  // 3. Fetch the actual file from UploadThing
  const response = await fetch(file.utUrl);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }

  // 4. Increment download count
  await db
    .update(files)
    .set({ downloadCount: (file.downloadCount ?? 0) + 1 })
    .where(eq(files.shareId, shareId));

  // 5. Stream the file back with Content-Disposition: attachment
  const contentType = file.mimeType || "application/octet-stream";
  const filename = encodeURIComponent(file.originalName);

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": response.headers.get("Content-Length") ?? "",
      "Cache-Control": "no-store",
    },
  });
}