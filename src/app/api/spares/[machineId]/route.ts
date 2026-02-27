import { NextResponse } from "next/server";
import Papa from "papaparse";
import type { SpareRow } from "@/components/spares/types";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId: raw } = await ctx.params;
    const machineId = (raw || "").trim();

    // Backward compatible: if a direct CSV URL is provided, use it.
    const directCsvUrl = process.env.NEXT_PUBLIC_SPARES_SHEET_CSV_URL;
    const globalSheetId = process.env.NEXT_PUBLIC_GLOBAL_SHEET_ID;

    let csvUrl = directCsvUrl?.trim();

    // Preferred (centralized): build URL from global sheet + per-machine tab
    if (!csvUrl) {
      if (!globalSheetId) {
        return NextResponse.json(
          { message: "Missing NEXT_PUBLIC_GLOBAL_SHEET_ID (or NEXT_PUBLIC_SPARES_SHEET_CSV_URL)" },
          { status: 500 }
        );
      }

      const suffix = (process.env.NEXT_PUBLIC_SPARES_TAB_SUFFIX || "__SPARES").trim();
      const tabName = `${machineId}${suffix}`;
      csvUrl = `https://docs.google.com/spreadsheets/d/${globalSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
        tabName
      )}`;
    }

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

    const parsed = Papa.parse<SpareRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors?.length) {
      return NextResponse.json(
        { message: "CSV parse error", errors: parsed.errors },
        { status: 500 }
      );
    }

    // Centralized tab-per-machine means we do NOT need to filter by Machine ID.
    const rows = (parsed.data || []) as SpareRow[];

    const out = NextResponse.json(rows, { status: 200 });
    // Revalidate every 60s at the edge (Vercel)
    out.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
    return out;
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
