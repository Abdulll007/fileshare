import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/dashboard" className="font-bold text-xl text-gray-900">
            📁 FileShare
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              + Upload
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700 hidden sm:block">
                {session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="text-sm text-gray-500 hover:text-gray-700 transition">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}