"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatBytes, getFileIcon, isPreviewable } from "@/lib/utils";

type FileData = {
  name: string;
  mimeType: string;
  size: number;
  downloadCount: number;
  expiresAt: string | null;
  isPasswordProtected: boolean;
  url: string | null;
};

export default function SharePage() {
  const { shareId } = useParams();
  const [file, setFile] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/files/${shareId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFile(data);
          if (!data.isPasswordProtected) setFileUrl(data.url);
        }
      })
      .finally(() => setLoading(false));
  }, [shareId]);



  const handlePasswordSubmit = async () => {
    setVerifying(true);
    const res = await fetch(`/api/files/${shareId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setVerifying(false);

    if (data.error) {
      alert("Wrong password, try again.");
    } else {
      setFileUrl(data.url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">
            {error === "File has expired" ? "⏰" : "❌"}
          </p>
          <h1 className="text-xl font-bold text-gray-800">{error}</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {error === "File has expired"
              ? "This file has expired and is no longer available."
              : "This link may be invalid or removed."}
          </p>

          <a
            href="/upload"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Upload a File
          </a>
        </div>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
          <p className="text-4xl mb-3">{getFileIcon(file.mimeType)}</p>
          <h1 className="text-xl font-bold truncate">{file.name}</h1>
          <div className="flex gap-4 mt-2 text-blue-100 text-sm">
            <span>{formatBytes(file.size)}</span>
            <span>•</span>
            <span>{file.downloadCount} downloads</span>
            {file.expiresAt && (
              <>
                <span>•</span>
                <span>
                  Expires {new Date(file.expiresAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          {file.isPasswordProtected && !fileUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <span>🔒</span>
                <span>This file is password protected</span>
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePasswordSubmit}
                disabled={verifying || !password}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50"
              >
                {verifying ? "Verifying..." : "Unlock File"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {fileUrl && isPreviewable(file.mimeType) && (
                <div className="rounded-xl overflow-hidden bg-gray-50 border">
                  {file.mimeType.startsWith("image/") && (
                    <img
                      src={fileUrl}
                      alt={file.name}
                      className="w-full max-h-64 object-contain"
                    />
                  )}
                  {file.mimeType.startsWith("video/") && (
                    <video controls className="w-full max-h-64">
                      <source src={fileUrl} type={file.mimeType} />
                    </video>
                  )}
                  {file.mimeType.startsWith("audio/") && (
                    <audio controls className="w-full p-4">
                      <source src={fileUrl} type={file.mimeType} />
                    </audio>
                  )}
                  {file.mimeType === "application/pdf" && (
                    <iframe
                      src={fileUrl}
                      className="w-full h-64"
                      title={file.name}
                    />
                  )}
                </div>
              )}

              {fileUrl && (
                <a
                  href={fileUrl}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  ⬇️ Download {file.name}
                </a>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }}
                className="w-full border border-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
              >
                🔗 Copy Share Link
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Powered by{" "}
        <a href="/" className="underline hover:text-gray-600">
          FileShare
        </a>
      </p>
    </div>
  );
}
