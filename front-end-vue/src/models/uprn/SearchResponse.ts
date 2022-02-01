import { Address } from "@/models/uprn/Address";
import { MatchPattern } from "./MatchPattern";

export interface SearchResponse {
  ABPAddress: Address;
  Address_format: string;
  Algorithm: string;
  ClassTerm: string;
  Classification: string;
  MatchPattern: MatchPattern;
  Matched: boolean;
  Postcode_quality: string;
  Qualifier: string;
  UPRN: string;
}
