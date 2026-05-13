"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; shareUrl: string }[]
  >([]);

  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Share Files Instantly
        </h1>
        <p className="text-gray-500 mt-2">
          No account needed · Files expire in 24 hours for guests
        </p>
      </div>

      {/* Upload Box */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border p-6">
        <UploadDropzone
          endpoint="fileUploader"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={(res) => {
            setUploading(false);
            if (res) {
              // Fetch the shareId from our DB via the utKey
              const fetchShareIds = res.map(async (f) => {
                const response = await fetch(`/api/files/by-key/${f.key}`);
                const data = await response.json();
                console.log(data)
                return {
                  name: f.name,
                  shareUrl: `${window.location.origin}/f/${data.shareId}`,
                };
              });

              Promise.all(fetchShareIds).then(setUploadedFiles);
            }
          }}
          onUploadError={(error) => {
            setUploading(false);
            alert(`Upload failed: ${error.message}`);
          }}
          appearance={{
            container:
              "border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors",
            label: "text-gray-600 font-medium",
            allowedContent: "text-gray-400 text-sm",
            button:
              "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium",
          }}
        />

        {/* Upload Results */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-700">
              ✅ Uploaded Successfully
            </h3>
            {uploadedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border"
              >
                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                  {file.name}
                </span>
                <div className="flex gap-2 ml-4">
                  <a
                    href={file.shareUrl}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(file.shareUrl);
                      alert("Share link copied!");
                    }}
                    className="text-sm text-gray-500 hover:underline font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-2 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-700 transition font-medium text-sm"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>

      {/* Guest note */}
      <p className="text-xs text-gray-400 mt-4">
        <a href="/login" className="underline hover:text-gray-600">
          Sign in
        </a>{" "}
        to get permanent links, password protection and more
      </p>
    </div>
  );
}
