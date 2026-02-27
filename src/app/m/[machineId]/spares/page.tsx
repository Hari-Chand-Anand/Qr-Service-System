import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";
import { envPublic } from "@/lib/env";
import { Card } from "@/components/ui";
import { SparesPublicClient } from "@/components/spares/SparesPublicClient";

export const runtime = "nodejs";

export default async function MachineSparesPage({
  params,
}: {
  // ✅ Next.js 16 expects `params` to be a Promise
  params: Promise<{ machineId: string }>;
}) {
  noStore();

  const { machineId: rawMachineId } = await params;
  const machineId = (rawMachineId || "").trim();

  if (!machineId || machineId === "undefined" || machineId === "null") {
    return notFound();
  }

  const machine = await prisma.machine.findUnique({ where: { machineId } });
  if (!machine) return notFound();

  return (
    <main className="min-h-dvh p-4 md:p-8">
      <div className="mx-auto max-w-lg space-y-4">
        <header className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {envPublic.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={envPublic.logoUrl}
                  alt={`${envPublic.companyName} logo`}
                  className="h-10 w-10 rounded-2xl object-contain bg-white p-1 shadow-sm"
                />
              ) : (
                <div className="h-10 w-10 rounded-2xl bg-white text-[#1d1d1f] grid place-items-center font-bold shadow-sm">
                  {envPublic.companyName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div>
                <div className="text-sm text-black/60">{envPublic.companyName}</div>
                <h1 className="text-xl font-semibold leading-tight">
                  Spares Installation Reports
                </h1>
                <div className="text-sm text-black/60">
                  {machine.name} •{" "}
                  <span className="text-black font-medium">{machine.machineId}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/m/${machine.machineId}`}
              className="text-sm text-black/60 hover:text-black rounded-2xl border border-black/10 bg-white/60 px-3 py-2"
            >
              ← Back
            </Link>
          </div>
        </header>

        <Card className="p-5">
          <div className="text-lg font-semibold">Machine</div>
          <div className="mt-1 text-sm text-black/60">
            {machine.name} • Machine ID: <span className="text-black font-medium">{machine.machineId}</span>
          </div>
        </Card>

        <SparesPublicClient machineId={machine.machineId} />

        <footer className="text-center text-xs text-black/50 pt-2">
          Data refreshes automatically every minute.
        </footer>
      </div>
    </main>
  );
}
