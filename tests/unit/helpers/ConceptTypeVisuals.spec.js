import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import palette from "google-palette";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";

createTestingPinia();

describe("ConceptTypeMethods", () => {
  const testSetType = [{ iri: "http://endhealth.info/im#ValueSet", name: "Value set" }];
  const testDataModelType = [
    { iri: "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
    { iri: "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
  ];
  const testPropertyType = [
    {
      iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
      name: "Property"
    }
  ];
  const testQueryType = [{ iri: "http://endhealth.info/im#Query", name: "Query template" }];
  const testFeatureType = [{ iri: "http://endhealth.info/im#MatchClause", name: "Feature or Rule" }];
  const testFolder = [{ iri: "http://endhealth.info/im#Folder", name: "Folder" }];

  describe("getFAIconFromType", () => {
    it("returns icon for nodeshape", () => {
      expect(getFAIconFromType(testDataModelType)).toStrictEqual(["fa-duotone", "fa-diagram-project"]);
    });

    it("returns icon for property", () => {
      expect(getFAIconFromType(testPropertyType)).toStrictEqual(["fa-duotone", "fa-pen-to-square"]);
    });

    it("returns icon for valueset", () => {
      expect(getFAIconFromType(testSetType)).toStrictEqual(["fa-duotone", "fa-list-check"]);
    });

    it("returns icon for folder", () => {
      expect(getFAIconFromType(testFolder)).toStrictEqual(["fa-duotone", "fa-folder"]);
    });

    it("returns icon for query", () => {
      expect(getFAIconFromType(testQueryType)).toStrictEqual(["fa-duotone", "fa-magnifying-glass"]);
    });

    it("returns icon for query", () => {
      expect(getFAIconFromType(testFeatureType)).toStrictEqual(["fa-duotone", "fa-filter-list"]);
    });

    it("returns default icon, type not found", () => {
      expect(getFAIconFromType([])).toStrictEqual(["fa-duotone", "fa-lightbulb"]);
    });
  });

  describe("getColourFromType", () => {
    const bgs = palette("tol-rainbow", 10);
    const bgsFixed = bgs.map(color => "#" + color + "88");

    it("returns correct colour for nodeshape", () => {
      expect(getColourFromType(testDataModelType)).toBe(bgsFixed[0]);
    });

    it("returns correct colour for property", () => {
      expect(getColourFromType(testPropertyType)).toBe(bgsFixed[4]);
    });

    it("returns correct colour for valueset", () => {
      expect(getColourFromType(testSetType)).toBe(bgsFixed[2]);
    });

    it("returns correct colour for folder", () => {
      expect(getColourFromType(testFolder)).toBe(bgsFixed[1]);
    });

    it("returns correct colour for query", () => {
      expect(getColourFromType(testQueryType)).toBe(bgsFixed[3]);
    });

    it("returns correct colour for feature", () => {
      expect(getColourFromType(testFeatureType)).toBe(bgsFixed[7]);
    });

    it("returns correct colour for default no type", () => {
      expect(getColourFromType([])).toBe(bgsFixed[5]);
    });
  });
});
