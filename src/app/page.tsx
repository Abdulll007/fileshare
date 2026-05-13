import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-28 px-4">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 -z-10" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40 -z-10" />

          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              No account needed to upload
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Share files with
              <span className="text-blue-600 dark:text-blue-400"> anyone</span>,
              <br className="hidden sm:block" /> instantly
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any file and get a shareable link in seconds. No compression, no account required, no hassle. Just upload and share.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/upload"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold text-base shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
              >
                Upload a File — It&apos;s Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-semibold text-base"
              >
                Create Free Account
              </Link>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-5">
              Guest files expire in 24 hours · Sign in for permanent storage
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-8 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[
              { value: "256MB", label: "Max file size" },
              { value: "100%", label: "Free to use" },
              { value: "24h", label: "Guest link expiry" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need to share files
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Built for speed and simplicity. No fluff, just the features that matter.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "⚡",
                  title: "Instant Sharing",
                  desc: "Upload your file and get a shareable link immediately. No waiting, no processing.",
                  color: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800",
                },
                {
                  icon: "🔒",
                  title: "Password Protection",
                  desc: "Secure sensitive files with a password. Only people with the password can access it.",
                  color: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
                },
                {
                  icon: "👁️",
                  title: "File Preview",
                  desc: "Images, videos, audio, and PDFs preview directly in the browser. No download needed.",
                  color: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
                },
                {
                  icon: "⏰",
                  title: "Auto Expiry",
                  desc: "Guest files auto-expire in 24 hours. Signed-in users get permanent links.",
                  color: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800",
                },
                {
                  icon: "📊",
                  title: "Download Tracking",
                  desc: "See how many times your file has been downloaded from your dashboard.",
                  color: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800",
                },
                {
                  icon: "🚫",
                  title: "No Account Needed",
                  desc: "Anyone can upload and share files without creating an account. Just drag, drop, share.",
                  color: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className={`rounded-2xl border p-6 ${feature.color} transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Share a file in 3 steps
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                It takes less than 30 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connector line — desktop only */}
              <div className="hidden sm:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 to-blue-200 dark:from-blue-800 dark:to-blue-800 -z-0" />

              {[
                { step: "01", icon: "☁️", title: "Upload your file", desc: "Drag & drop or click to select. Any file type up to 256MB." },
                { step: "02", icon: "🔗", title: "Get a share link", desc: "A unique shareable link is instantly generated for your file." },
                { step: "03", icon: "📨", title: "Share with anyone", desc: "Send the link via chat, email, or wherever you want." },
              ].map((item) => (
                <div key={item.step} className="relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-blue-200 dark:shadow-blue-900/30">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Start sharing for free
              </h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                No credit card. No account needed. Just upload and share.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/upload"
                  className="bg-white text-blue-600 px-8 py-3.5 rounded-xl hover:bg-blue-50 transition font-semibold text-sm shadow"
                >
                  Upload a File Now
                </Link>
                <Link
                  href="/login"
                  className="border border-white/30 text-white px-8 py-3.5 rounded-xl hover:bg-white/10 transition font-semibold text-sm"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}