import { z } from "zod";

export const MachineSchema = z.object({
  id: z.string().optional(),
  machineId: z
    .string()
    .trim()
    .min(3, "Machine ID must be at least 3 characters")
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/, "Use only letters, numbers, dot, dash, underscore")
    .optional()
    .or(z.literal("")),
  name: z.string().trim().min(2, "Name is required").max(120),
  driveLink: z.string().trim().url("Valid Google Drive link required"),
  sheetsLink: z.string().trim().url("Valid Google Sheets link required"),
  whatsappNumber: z.string().trim().optional().or(z.literal("")),
  whatsappTemplate: z.string().trim().optional().or(z.literal("")),
});

export type MachineInput = z.infer<typeof MachineSchema>;
