import { TagSeverity } from "@/enums";

export interface SharedState {
  showCookieConsent: boolean;
  showSnomedLicense: boolean;
  showUprnConsent: boolean;
  tagSeverityMatches: { "@id": string; severity: TagSeverity }[];
  showReleaseNotes: boolean;
  showReleaseBanner: boolean;
  showDevBanner: boolean;
  activeProfile: { uuid: string; activeClausePath: string };
  error: string | undefined;
  isPublicMode: boolean | undefined;
  isDevMode: boolean | undefined;
}
