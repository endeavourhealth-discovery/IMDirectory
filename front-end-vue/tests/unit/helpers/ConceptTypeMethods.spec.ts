import {isOfTypes, isValueSet, isProperty, getColourFromType, getFAIconFromType} from "@/helpers/ConceptTypeMethods";
import { IM } from "@/vocabulary/IM";

describe("ConceptTypeMethods", () => {
  const testConceptType = [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }];
  const testSetType = [{ "@id": "http://endhealth.info/im#ValueSet", name: "Value set" }];
  const testDataModelType = [
    { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
    { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
  ];
  const testPropertyType = [{ "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property", name: "Property" }];
  const testQueryType = [{ "@id": "http://endhealth.info/im#QueryTemplate", name: "Query template" }];
  const testFolder = [{ "@id": "http://endhealth.info/im#Folder", name: "Folder" }];

  describe("isOfTypes", () => {
    it("returns false if no conceptTypeElements", () => {
      expect(isOfTypes([], IM.CONCEPT)).toBe(false);
    });

    it("returns true when type found", () => {
      expect(isOfTypes(testConceptType, IM.CONCEPT)).toBe(true);
    });
  });

  describe("isValueSet", () => {
    it("returns true if valueset", () => {
      expect(isValueSet(testSetType)).toBe(true);
    });

    it("returns false if not valueset", () => {
      expect(isValueSet(testDataModelType)).toBe(false);
    });
  });

  describe("isProperty", () => {
    it("returns true if property", () => {
      expect(isProperty(testPropertyType)).toBe(true);
    });

    it("returns false if not property", () => {
      expect(isValueSet(testDataModelType)).toBe(false);
    });
  });

  describe("getFAIconFromType", () => {
    it("returns icon for nodeshape", () => {
      expect(getFAIconFromType(testDataModelType)).toStrictEqual(["fas", "project-diagram"]);
    });

    it("returns icon for property", () => {
      expect(getFAIconFromType(testPropertyType)).toStrictEqual(["far", "edit"]);
    });

    it("returns icon for valueset", () => {
      expect(getFAIconFromType(testSetType)).toStrictEqual(["fas", "tasks"]);
    });

    it("returns icon for folder", () => {
      expect(getFAIconFromType(testFolder)).toStrictEqual(["fas", "folder"]);
    });

    it("returns icon for query", () => {
      expect(getFAIconFromType(testQueryType)).toStrictEqual(["fas", "search"]);
    });

    it("returns default icon, type not found", () => {
      expect(getFAIconFromType([])).toStrictEqual(["far", "lightbulb"]);
    });
  });

  describe("getColourFromType", () => {
    it("returns correct colour for nodeshape", () => {
      expect(getColourFromType(testDataModelType)).toBe("#781c8188");
    });

    it("returns correct colour for property", () => {
      expect(getColourFromType(testPropertyType)).toBe("#d9212088");
    });

    it("returns correct colour for valueset", () => {
      expect(getColourFromType(testSetType)).toBe("#62ac9a88");
    });

    it("returns correct colour for folder", () => {
      expect(getColourFromType(testFolder)).toBe("#4063b088");
    });

    it("returns correct colour for query", () => {
      expect(getColourFromType(testQueryType)).toBe("#abbe5188");
    });

    it("returns correct colour for default no type", () => {
      expect(getColourFromType([])).toBe("#e39a3688");
    });
  });
});
