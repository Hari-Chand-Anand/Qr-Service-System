import { NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * Service & Installation Reports API
 *
 * Uses a centralized Google Sheet (env: NEXT_PUBLIC_GLOBAL_SHEET_ID) with tabs.
 * For each machine, we store either:
 *  - a TAB NAME in Machine.sheetsLink (recommended), e.g. "DY-4411PSF__SERVICE" or "service-report"
 *  - OR a direct published CSV URL (backward compatible)
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId: raw } = await ctx.params;
    const machineId = (raw || "").trim();

    const machine = await prisma.machine.findUnique({ where: { machineId } });
    if (!machine) {
      return NextResponse.json({ message: "Machine not found" }, { status: 404 });
    }

    const sheetId = (process.env.NEXT_PUBLIC_GLOBAL_SHEET_ID || "").trim();
    if (!sheetId) {
      return NextResponse.json(
        { message: "Missing NEXT_PUBLIC_GLOBAL_SHEET_ID" },
        { status: 500 }
      );
    }

    const rawLink = (machine.sheetsLink || "").trim();
    if (!rawLink) {
      return NextResponse.json(
        { message: "Service reports tab name not set for this machine" },
        { status: 400 }
      );
    }

    // If admin pasted a full CSV URL, use it. Otherwise treat as tab name.
    const isUrl = /^https?:\/\//i.test(rawLink);
    const tabName = rawLink;

    const csvUrl = isUrl
      ? rawLink
      : `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
          tabName
        )}`;

    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { message: `Failed to fetch CSV (${res.status})` },
        { status: 500 }
      );
    }

    const csvText = await res.text();
    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json({ message: "CSV is empty" }, { status: 500 });
    }

    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) {
      return NextResponse.json(
        { message: "CSV parse error", errors: parsed.errors },
        { status: 500 }
      );
    }

    const rows = Array.isArray(parsed.data) ? parsed.data : [];

    const out = NextResponse.json(rows, { status: 200 });
    out.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
    return out;
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
