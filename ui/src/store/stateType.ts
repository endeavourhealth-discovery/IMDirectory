import { User, Namespace } from "@im-library/interfaces";

export interface State {
  loading: Map<string, boolean>;
  conceptIri: string;
  searchResults: [];
  favourites: string[];
  currentUser: User;
  registeredUsername: string;
  isLoggedIn: boolean;
  recentLocalActivity: string;
  snomedLicenseAccepted: string;
  filters: {
    selectedStatus: string[];
    selectedSchemes: { iri: string; name: string }[];
    selectedTypes: string[];
  };
  term: string;
  instanceIri: string;
  hierarchySelectedFilters: Namespace[];
  fontAwesomePro: boolean;
}
