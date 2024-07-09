import { TTIriRef } from "./AutoGen";

export interface DownloadSettings {
  selectedFormat: string;
  selectedContents: string[];
  selectedSchemes: TTIriRef[];
  includeSubsets: boolean;
  legacyInline: boolean;
}
