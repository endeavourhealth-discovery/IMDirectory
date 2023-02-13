import { User } from "../models/user/User";
import { Namespace } from "@/models/Namespace";

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
}
