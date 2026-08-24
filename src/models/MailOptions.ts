import z from "zod";

// export interface MailOptions {
//   from?: string;
//   to: string;
//   cc?: string;
//   bcc?: string;
//   subject: string;
//   text?: string;
//   html?: string;
// }

export const MailOptionsSchema = z.strictObject({
  from: z.string().optional(),
  to: z.string(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional()
});

export type MailOptions = z.output<typeof MailOptionsSchema>;

export function isMailOptions(value: unknown): value is MailOptions {
  return MailOptionsSchema.safeParse(value).success;
}
