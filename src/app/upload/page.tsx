"use client";

import { useState } from "react";
import Link from "next/link";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "react-dropzone";
import { formatBytes, getFileIcon } from "@/lib/utils";

type UploadedFile = {
  name: string;
  shareUrl: string;
  size: number;
  mimeType: string;
};

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const { startUpload } = useUploadThing("fileUploader", {
    onUploadProgress: (p) => setProgress(p),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => setSelectedFiles((prev) => [...prev, ...accepted]),
    multiple: true,
  });

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setProgress(0);

    const res = await startUpload(selectedFiles);

    if (!res) {
      alert("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    // Fetch shareIds for each uploaded file
    const results = await Promise.all(
      res.map(async (f) => {
        const r = await fetch(`/api/files/by-key/${f.key}`);
        const data = await r.json();

        // Set password if enabled
        if (enablePassword && password && data.fileId) {
          await fetch(`/api/files/set-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: data.fileId, password }),
          });
        }

        return {
          name: f.name,
          shareUrl: `${window.location.origin}/f/${data.shareId}`,
          size: f.size,
          mimeType: f.type,
        };
      })
    );

    setUploadedFiles(results);
    setSelectedFiles([]);
    setUploading(false);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Success State
  if (uploadedFiles.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Complete!</h1>
            <p className="text-gray-500 text-sm mt-1">
              Your files are ready to share
            </p>
          </div>

          {/* Uploaded Files */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-4">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="p-4 border-b last:border-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border">
                  <p className="text-xs text-gray-500 truncate flex-1">{file.shareUrl}</p>
                  <button
                    onClick={() => handleCopy(file.shareUrl)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex-shrink-0 transition"
                  >
                    {copied === file.shareUrl ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setUploadedFiles([]);
                setPassword("");
                setEnablePassword(false);
              }}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
            >
              Upload More
            </button>
            <Link
              href="/dashboard"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium text-sm text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Upload State
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            📁 FileShare
          </Link>
          <p className="text-gray-500 mt-2 text-sm">
            Upload and share files instantly · No account needed
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {/* Dropzone */}
          <div className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-4xl mb-3">☁️</p>
              <p className="font-semibold text-gray-700">
                {isDragActive ? "Drop files here..." : "Drag & drop files here"}
              </p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-3">
                Images, PDFs, Videos, Audio, ZIP · Max 256MB
              </p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 border"
                  >
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-red-500 transition text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password Protection Option */}
          <div className="px-6 pb-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Password Protection</p>
                  <p className="text-xs text-gray-400">Require a password to access this file</p>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                onClick={() => {
                  setEnablePassword(!enablePassword);
                  if (enablePassword) setPassword("");
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  enablePassword ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    enablePassword ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Password Input — slides in when toggled */}
            {enablePassword && (
              <div className="mt-3">
                <input
                  type="password"
                  placeholder="Enter a password for this file"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="px-6 pb-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleUpload}
              disabled={!selectedFiles.length || uploading || (enablePassword && !password)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}` : "Files"}`}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Guest files expire in 24 hours ·{" "}
          <Link href="/login" className="underline hover:text-gray-600">
            Sign in
          </Link>{" "}
          for permanent storage
        </p>
      </div>
    </div>
  );
}