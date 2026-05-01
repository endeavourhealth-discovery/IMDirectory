import type { TTIriRef } from "@endeavour/vue-library/interfaces";

export interface DownloadSettings {
  selectedFormat: string;
  selectedContents: string[];
  selectedSchemes: TTIriRef[];
  includeSubsets: boolean;
  legacyInline: boolean;
}
