"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatBytes, getFileIcon, isPreviewable } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/files/${shareId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
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
    if (data.error) alert("Wrong password, try again.");
    else setFileUrl(data.url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">
            {error === "File has expired" ? "⏰" : "❌"}
          </p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">{error}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {error === "File has expired"
              ? "This file has expired and is no longer available."
              : "This link may be invalid or has been removed."}
          </p>
          <Link
            href="/upload"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium text-sm"
          >
            Upload a File
          </Link>
        </div>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="flex flex-col min-h-screen  dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Brand */}
          <div className="text-center mb-6">
            <Link href="/" className="text-xl font-bold ">
              📁 FileShare
            </Link>
          </div>

          <div className="rounded-2xl shadow-sm border overflow-hidden">
            {/* File Header */}
            <div className="bg-gradient-to-r from-blue-600  to-indigo-600 dark:from-gray-700 dark:to-gray-950 p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{getFileIcon(file.mimeType)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-bold text-lg truncate">{file.name}</h1>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-blue-100 text-sm">
                    <span>{formatBytes(file.size)}</span>
                    <span>·</span>
                    <span>{file.downloadCount} downloads</span>
                    {file.expiresAt && (
                      <>
                        <span>·</span>
                        <span>
                          Expires{" "}
                          {new Date(file.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Password Gate */}
              {file.isPasswordProtected && !fileUrl ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Password Protected
                      </p>
                      <p className="text-xs text-amber-600">
                        Enter the password to access this file
                      </p>
                    </div>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handlePasswordSubmit()
                    }
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={verifying || !password}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {verifying ? "Verifying..." : "Unlock File"}
                  </button>
                </div>
              ) : (
                <>
                  {/* File Preview */}
                  {fileUrl && isPreviewable(file.mimeType) && (
                    <div className="rounded-xl overflow-hidden bg-gray-50 border">
                      {file.mimeType.startsWith("image/") && (
                        <img
                          src={fileUrl}
                          alt={file.name}
                          className="w-full max-h-72 object-contain"
                        />
                      )}
                      {file.mimeType.startsWith("video/") && (
                        <video controls className="w-full max-h-72">
                          <source src={fileUrl} type={file.mimeType} />
                        </video>
                      )}
                      {file.mimeType.startsWith("audio/") && (
                        <div className="p-4">
                          <audio controls className="w-full">
                            <source src={fileUrl} type={file.mimeType} />
                          </audio>
                        </div>
                      )}
                      {file.mimeType === "application/pdf" && (
                        <iframe
                          src={fileUrl}
                          className="w-full h-72"
                          title={file.name}
                        />
                      )}
                    </div>
                  )}

                  {/* Download Button */}
                  {fileUrl && (
                    <a
                      href={`/api/files/download/${shareId}`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
                    >
                     ⬇️ Download 
                    </a>
                  )}

                  {/* Copy Share Link */}
                  <button
                    onClick={handleCopy}
                    className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                  >
                    {copied ? "✓ Link Copied!" : "🔗 Copy Share Link"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Powered by{" "}
            <Link href="/" className="underline hover:text-gray-600">
              FileShare
            </Link>
            {" · "}
            <Link href="/upload" className="underline hover:text-gray-600">
              Upload a file
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
