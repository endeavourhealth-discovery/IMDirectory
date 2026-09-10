import z from "zod";

// export interface SentencePart {
//   type: "text" | "field" | "parameter" | "nodeRef";
//   value?: string;
// }

export const SentencePartSchema = z.strictObject({
  type: z.enum(["text", "field", "parameter", "nodeRef"]),
  value: z.string().optional()
});

export type SentencePart = z.output<typeof SentencePartSchema>;

export function isSentencePart(value: unknown): value is SentencePart {
  return SentencePartSchema.safeParse(value).success;
}
