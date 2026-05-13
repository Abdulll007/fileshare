import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, sum, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats] = await db
    .select({
      totalFiles: count(files.id),
      totalSize: sum(files.size),
      totalDownloads: sum(files.downloadCount),
    })
    .from(files)
    .where(eq(files.userId, session.user.id));

  return NextResponse.json({
    totalFiles: stats.totalFiles ?? 0,
    totalSize: Number(stats.totalSize ?? 0),
    totalDownloads: Number(stats.totalDownloads ?? 0),
  });
}