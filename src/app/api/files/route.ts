import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();


// GET — fetch all files for logged in user
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFiles = await db.query.files.findMany({
    where: eq(files.userId, session.user.id),
    orderBy: [desc(files.createdAt)],
  });

  return NextResponse.json(userFiles);
}

// DELETE — delete a file by id
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await req.json();

  const file = await db.query.files.findFirst({
    where: eq(files.id, fileId),
  });

  if (!file || file.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const utResult = await utapi.deleteFiles(file.utKey);
  
  if (!utResult.success) {
    return NextResponse.json(
      { error: "Failed to delete file from storage" },
      { status: 500 }
    );
  }
  
  await db.delete(files).where(eq(files.id, fileId));

  return NextResponse.json({ success: true });
}