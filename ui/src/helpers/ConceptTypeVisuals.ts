// Categories
// Set, Query Set, Value Set
// Class, Record Type
// Everything else

import { TTIriRef } from "@im-library/interfaces/AutoGen";
import palette from "google-palette";
import { isFeature, isFolder, isProperty, isQuery, isRecordModel, isTask, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { useSharedStore } from "@/stores/sharedStore";

export function getFAIconFromType(conceptTypes: TTIriRef[]): string[] {
  const faPro = useSharedStore().fontAwesomePro;

  if (isRecordModel(conceptTypes)) return faPro ? ["fa-duotone", "fa-diagram-project"] : ["fa-solid", "fa-diagram-project"];
  else if (isTask(conceptTypes)) return faPro ? ["fa-duotone", "fa-clipboard-check"] : ["fa-solid", "fa-clipboard-check"];
  else if (isProperty(conceptTypes)) return faPro ? ["fa-duotone", "fa-pen-to-square"] : ["fa-solid", "fa-pen-to-square"];
  else if (isValueSet(conceptTypes)) return faPro ? ["fa-duotone", "fa-list-check"] : ["fa-solid", "fa-list-check"];
  else if (isFolder(conceptTypes)) return faPro ? ["fa-duotone", "fa-folder"] : ["fa-solid", "fa-folder"];
  else if (isQuery(conceptTypes)) return faPro ? ["fa-duotone", "fa-magnifying-glass"] : ["fa-solid", "fa-magnifying-glass"];
  else if (isFeature(conceptTypes)) return faPro ? ["fa-duotone", "fa-filter"] : ["fa-solid", "fa-filter-list"];
  else return faPro ? ["fa-duotone", "fa-lightbulb"] : ["fa-solid", "fa-lightbulb"];
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
