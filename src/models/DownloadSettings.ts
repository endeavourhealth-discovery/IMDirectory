import { type TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface DownloadSettings {
//   selectedFormat: string;
//   selectedContents: string[];
//   selectedSchemes: TTIriRef[];
//   includeSubsets: boolean;
//   legacyInline: boolean;
// }

export const DownloadSettingsSchema = z.strictObject({
  selectedFormat: z.string(),
  selectedContents: z.array(z.string()),
  selectedSchemes: z.array(TTIriRefSchema),
  includeSubsets: z.boolean(),
  legacyInline: z.boolean()
});

export type DownloadSettings = z.output<typeof DownloadSettingsSchema>;

export function isDownloadSettings(value: unknown): value is DownloadSettings {
  return DownloadSettingsSchema.safeParse(value).success;
}
