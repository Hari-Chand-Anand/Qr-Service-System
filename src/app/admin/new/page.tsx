import Link from "next/link";
import { createMachineAction as createMachineActionImpl } from "../actions";
import { Card, Input, Textarea, Button } from "@/components/ui";

export const runtime = "nodejs";

// ✅ Wrapper: <form action> expects void | Promise<void>
async function createMachineAction(formData: FormData): Promise<void> {
  "use server";
  await createMachineActionImpl(formData);
}

export default function AdminNewMachinePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Add Machine</h1>
          <p className="text-sm text-black/60">
            Leave Machine ID blank to auto-generate one.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-black/60 hover:text-black">
          ← Back
        </Link>
      </div>

      <Card className="p-6">
        <form action={createMachineAction} className="space-y-4">
          <div>
            <label className="text-sm text-black/60">Machine ID (optional)</label>
            <Input name="machineId" placeholder="e.g., DY-4412P-001" />
          </div>

          <div>
            <label className="text-sm text-black/60">Machine Name</label>
            <Input name="name" placeholder="e.g., DUKE DY-4412P Pattern Sewer" required />
          </div>

          <div>
            <label className="text-sm text-black/60">Machine Specs / Catalog (Google Drive link)</label>
            <Input
              name="driveLink"
              placeholder="https://drive.google.com/..."
              required
            />
          </div>

          <div>
            <label className="text-sm text-black/60">Service & Installation Reports (Google Sheets link)</label>
            <Input
              name="sheetsLink"
              placeholder="https://docs.google.com/spreadsheets/..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-black/60">WhatsApp Number (optional)</label>
              <Input name="whatsappNumber" placeholder="919999999999" />
              <p className="mt-1 text-xs text-black/40">
                Use digits only, include country code (India: 91...).
              </p>
            </div>
            <div>
              <label className="text-sm text-black/60">WhatsApp Message Template (optional)</label>
              <Textarea
                name="whatsappTemplate"
                rows={3}
                placeholder="Hi, I'd like to request a quote for [Machine Name] ([Machine ID])."
              />
              <p className="mt-1 text-xs text-black/40">
                Supports placeholders: [Machine Name], [Machine ID]
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save & Generate QR</Button>
            <Button type="reset" variant="ghost">Clear</Button>
          </div>

          <p className="text-xs text-black/40">
            After saving, open the machine entry to download the QR code.
          </p>
        </form>
      </Card>
    </div>
  );
}
