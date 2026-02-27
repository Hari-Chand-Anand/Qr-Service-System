import Link from "next/link";
import { envPublic } from "@/lib/env";

export const runtime = "nodejs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = envPublic.logoUrl?.trim?.() || "";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 font-semibold">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-6 w-auto"
                referrerPolicy="no-referrer"
              />
            ) : null}

            <span className="tracking-tight">
              <span className="text-black/40">•</span> Admin
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-black/60 hover:text-black">
              Home
            </Link>

            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-sm text-black/60 hover:text-black">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
