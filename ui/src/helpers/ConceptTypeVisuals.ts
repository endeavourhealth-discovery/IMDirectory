// Categories
// Set, Query Set, Value Set
// Class, Record Type
// Everything else

import { TTIriRef } from "@im-library/interfaces/AutoGen";
import palette from "google-palette";
import { isFeature, isFolder, isProperty, isQuery, isRecordModel, isTask, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

export function getFAIconFromType(conceptTypes: TTIriRef[]): string[] {
  if (isRecordModel(conceptTypes)) return ["fa-duotone", "fa-diagram-project"];
  else if (isTask(conceptTypes)) return ["fa-duotone", "fa-clipboard-check"];
  else if (isProperty(conceptTypes)) return ["fa-duotone", "fa-pen-to-square"];
  else if (isValueSet(conceptTypes)) return ["fa-duotone", "fa-list-check"];
  else if (isFolder(conceptTypes)) return ["fa-duotone", "fa-folder"];
  else if (isQuery(conceptTypes)) return ["fa-duotone", "fa-magnifying-glass"];
  else if (isFeature(conceptTypes)) return ["fa-duotone", "fa-filter-list"];
  else return ["fa-duotone", "fa-lightbulb"];
}

export function getColourFromType(conceptTypes: TTIriRef[]): string {
  const bgs = palette("tol-rainbow", 8);
  const bgsFixed = bgs.map((color: string) => "#" + color + "88");
  if (isRecordModel(conceptTypes)) return bgsFixed[0];
  else if (isTask(conceptTypes)) return bgsFixed[6];
  else if (isProperty(conceptTypes)) return bgsFixed[4];
  else if (isValueSet(conceptTypes)) return bgsFixed[2];
  else if (isFolder(conceptTypes)) return bgsFixed[1];
  else if (isQuery(conceptTypes)) return bgsFixed[3];
  else if (isFeature(conceptTypes)) return bgsFixed[7];
  else return bgsFixed[5];
}

export default {
  getColourFromType,
  getFAIconFromType
};
