import { DisplayTTIriRef } from "./DisplayTTIriRef";
import { TTIriRef } from "./TTIriRef";

export interface SuggestionInfo {
  propertyId: string;
  suggestionIri: string;
  searchTerm: string;
  propertyValue: DisplayTTIriRef[];
}
