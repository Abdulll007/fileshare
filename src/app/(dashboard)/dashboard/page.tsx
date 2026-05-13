"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBytes, getFileIcon } from "@/lib/utils";

type FileItem = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  shareId: string;
  downloadCount: number;
  expiresAt: string | null;
  createdAt: string;
};

type Stats = {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
};

export default function DashboardPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchData = async () => {
    const [filesRes, statsRes] = await Promise.all([
      fetch("/api/files"),
      fetch("/api/files/stats"),
    ]);
    const [filesData, statsData] = await Promise.all([
      filesRes.json(),
      statsRes.json(),
    ]);
    setFiles(filesData);
    setStats(statsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (fileId: string, fileSize: number) => {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    setDeletingId(fileId);

    await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });

    // Update files list and stats immediately without refetch
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setStats((prev) =>
      prev
        ? {
            totalFiles: prev.totalFiles - 1,
            totalSize: prev.totalSize - fileSize,
            totalDownloads: prev.totalDownloads,
          }
        : prev
    );
    setDeletingId(null);
  };

  const handleCopy = (shareId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${shareId}`);
    setCopied(shareId);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredFiles = files.filter((f) =>
    f.originalName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and share your uploaded files
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Files", value: stats.totalFiles, icon: "📁", color: "bg-blue-50 border-blue-100" },
            { label: "Storage Used", value: formatBytes(stats.totalSize), icon: "💾", color: "bg-purple-50 border-purple-100" },
            { label: "Downloads", value: stats.totalDownloads, icon: "⬇️", color: "bg-green-50 border-green-100" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-3 sm:p-4 ${stat.color}`}>
              <p className="text-xl sm:text-2xl mb-1">{stat.icon}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Upload */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-xl text-black px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
        >
          + Upload
        </Link>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-5xl mb-4">{search ? "🔍" : "📭"}</p>
          <h3 className="text-lg font-semibold text-gray-700">
            {search ? "No files match your search" : "No files yet"}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try a different search term" : "Upload your first file to get started"}
          </p>
          {!search && (
            <Link
              href="/upload"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Upload File
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">

          {/* Desktop Header — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-5">File</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Downloads</div>
            <div className="col-span-3">Actions</div>
          </div>

          {filteredFiles.map((file) => (
            <div key={file.id} className="border-b last:border-0 hover:bg-gray-50 transition">

              {/* Desktop Row */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(file.createdAt).toLocaleDateString()}
                      {file.expiresAt && (
                        <span className="ml-2 text-orange-400">
                          · Expires {new Date(file.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-gray-500">{formatBytes(file.size)}</div>
                <div className="col-span-2 text-sm text-gray-500">{file.downloadCount}</div>
                <div className="col-span-3 flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(file.shareId)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-medium"
                  >
                    {copied === file.shareId ? "Copied ✓" : "Copy Link"}
                  </button>
                  <Link
                    href={`/f/${file.shareId}`}
                    target="_blank"
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(file.id, file.size)}
                    disabled={deletingId === file.id}
                    className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
                  >
                    {deletingId === file.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* Mobile Card */}
              <div className="sm:hidden p-4 space-y-3">
                {/* File Info */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                      <span>{formatBytes(file.size)}</span>
                      <span>·</span>
                      <span>{file.downloadCount} downloads</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(file.createdAt).toLocaleDateString()}
                      {file.expiresAt && (
                        <span className="ml-1 text-orange-400">
                          · Expires {new Date(file.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(file.shareId)}
                    className="flex-1 text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition font-medium text-center"
                  >
                    {copied === file.shareId ? "Copied ✓" : "📋 Copy Link"}
                  </button>
                  <Link
                    href={`/f/${file.shareId}`}
                    target="_blank"
                    className="flex-1 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-center"
                  >
                    👁 View
                  </Link>
                  <button
                    onClick={() => handleDelete(file.id, file.size)}
                    disabled={deletingId === file.id}
                    className="flex-1 text-xs bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
                  >
                    {deletingId === file.id ? "..." : "🗑 Delete"}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}