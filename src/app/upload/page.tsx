"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Share Files Instantly</h1>
        <p className="text-gray-500 mt-2">
          No account needed · Files expire in 24 hours for guests
        </p>
      </div>

      {/* Upload Box */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border p-6">
        <UploadDropzone
          endpoint="fileUploader"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={(res) => {
            setUploading(false);
            if (res) {
              setUploadedFiles(res.map((f) => ({ name: f.name, url: f.url })));
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
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(file.url);
                    alert("Link copied!");
                  }}
                  className="text-sm text-blue-600 hover:underline font-medium ml-4"
                >
                  Copy Link
                </button>
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