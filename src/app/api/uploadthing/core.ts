import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { files } from "@/db/schema";
import { nanoid } from "nanoid";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    pdf: { maxFileSize: "32MB", maxFileCount: 5 },
    video: { maxFileSize: "256MB", maxFileCount: 2 },
    audio: { maxFileSize: "32MB", maxFileCount: 5 },
    "application/zip": { maxFileSize: "128MB", maxFileCount: 2 },
    text: { maxFileSize: "8MB", maxFileCount: 10 },
    blob: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();

      // Allow guest uploads (no account needed)
      const userId = session?.user?.id ?? null;

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const shareId = nanoid(10); // generate ONCE

      await db.insert(files).values({
        userId: metadata.userId,
        name: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        utKey: file.key,
        utUrl: file.ufsUrl,
        shareId, // use same shareId
        isPublic: true,
        expiresAt: metadata.userId
          ? null
          : new Date(Date.now() +  60 * 1000),
      });

      return { fileUrl: file.ufsUrl, shareId }; // return it too
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
