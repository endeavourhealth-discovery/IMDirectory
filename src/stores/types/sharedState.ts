export interface SharedState {
  showCookieConsent: boolean;
  showSnomedLicense: boolean;
  showUprnConsent: boolean;
  tagSeverityMatches: any[];
  showReleaseNotes: boolean;
  showReleaseBanner: boolean;
  showDevBanner: boolean;
  activeProfile: any;
  error: any | undefined;
  isPublicMode: boolean;
  isDevMode: boolean;
}
