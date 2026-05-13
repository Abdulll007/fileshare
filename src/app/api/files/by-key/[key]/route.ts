import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const file = await db.query.files.findFirst({
    where: eq(files.utKey, key),
  });

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ shareId: file.shareId });
}
