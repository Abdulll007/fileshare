import { db } from "@/db";
import { files } from "@/db/schema";
import { lt, isNotNull, and, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Find all expired guest files
    const expiredFiles = await db.query.files.findMany({
      where: and(
        isNotNull(files.expiresAt),
        isNull(files.userId),
        lt(files.expiresAt, now)
      ),
    });

    if (expiredFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired files found",
        deleted: 0,
      });
    }

    // 2. Delete from UploadThing
    const utKeys = expiredFiles.map((f) => f.utKey);
    await utapi.deleteFiles(utKeys);

    // 3. Delete from DB in one query
    await db.delete(files).where(
      and(
        isNotNull(files.expiresAt),
        isNull(files.userId),
        lt(files.expiresAt!, now)
      )
    );

    return NextResponse.json({
      success: true,
      message: `Deleted ${expiredFiles.length} expired files`,
      deleted: expiredFiles.length,
    });

  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: String(error) },
      { status: 500 }
    );
  }
}