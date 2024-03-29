import { expect, test, describe, it } from "vitest";
import Validator from "../../../src/logic/validator";
import { IM, SHACL, VALIDATION } from "@im-library/vocabulary";

describe("Validator", () => {
  describe("hasValidParents", () => {
    test("Is valid IRI and data", async () => {
      const actual = await new Validator().validate(VALIDATION.HAS_PARENT, {
        "http://endhealth.info/im#isContainedIn": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
      });
      expect(actual).toEqual({ isValid: true });
    });

    test("Is invalid IRI and valid data", async () => {
      const actual = await new Validator().validate(VALIDATION.HAS_PARENT, {
        "http://endhealth.info/im#foo": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
      });
      expect(actual).toEqual({ isValid: false, message: "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'." });
    });

    test("Is valid IRI and invalid data", async () => {
      const actual = await new Validator().validate(VALIDATION.HAS_PARENT, {
        "http://endhealth.info/im#isContainedIn": "foo"
      });
      expect(actual).toEqual({ isValid: false, message: "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'." });
    });

    test("Is invalid IRI and invalid data", async () => {
      const actual = await new Validator().validate(VALIDATION.HAS_PARENT, {
        "http://endhealth.info/im#foo": "bar"
      });
      expect(actual).toEqual({ isValid: false, message: "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'." });
    });
  });

  describe("isValidIri", () => {
    it("passes with correct iri", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealth.info/im#903031000252104"
      });
      expect(actual).toEqual({ isValid: true, message: undefined });
    });

    it("fails with spaces", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealth.info/im#90303 1000252104"
      });
      expect(actual).toEqual({ isValid: false, message: 'Iri identifier contains invalid characters: [" "]' });
    });

    it("fails with multiple special characters", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealth.info/im#90303 10+00$25&21/04"
      });
      expect(actual).toEqual({ isValid: false, message: 'Iri identifier contains invalid characters: [" ","+","$","&","/"]' });
    });

    it("fails with # in identifier", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealth.info/im#9030310002521#04"
      });
      expect(actual).toEqual({ isValid: false, message: "Iri contains invalid character '#' within identifier." });
    });

    it("fails if url missing #", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealth.info/im903031000252104"
      });
      expect(actual).toEqual({ isValid: false, message: "Iri must contain a '#'" });
    });

    it("fails if url is of wrong format", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealthinfo/im#903031000252104"
      });
      expect(actual).toEqual({ isValid: false, message: "Iri url is invalid." });
    });

    it("fails if iri is not a string", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": 903031000252104
      });
      expect(actual).toEqual({ isValid: false, message: "Iri must be of type string" });
    });

    it("fails if entity is missing id field", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#iri": "http://endhealth.info/im#903031000252104"
      });
      expect(actual).toEqual({ isValid: false, message: "Entity is missing 'http://endhealth.info/im#id' key" });
    });

    it("fails if iri is missing code", async () => {
      const actual = await new Validator().validate(VALIDATION.IS_IRI, {
        "http://endhealth.info/im#id": "http://endhealth.info/im#"
      });
      expect(actual).toEqual({ isValid: false, message: "Iri must have a code." });
    });
  });

  describe("isValidIriOrIriList", () => {
    it("fails if no properties", async () => {
      let testData: any = {};
      testData[SHACL.PROPERTY] = [];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: false, message: "Data models must have at least 1 property" });
    });

    it("fails if property without path", async () => {
      let testData: any = {};
      testData[SHACL.PROPERTY] = [{}];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: false, message: "One or more invalid properties" });
    });

    it("fails if property with path without range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = { "@id": "Some IRI" };

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: false, message: "One or more invalid properties" });
    });

    it("fails if property with array path without range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = [{ "@id": "Some IRI" }];

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: false, message: "One or more invalid properties" });
    });

    it("fails if property with array multi path with (node) range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = [{ "@id": "Some IRI" }, { "@id": "Other IRI" }];
      testProperty[SHACL.NODE] = [{ "@id": "Some IRI" }];

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: false, message: "One or more invalid properties" });
    });

    it("fails if property with path with array multi (node) range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = { "@id": "Some IRI" };
      testProperty[SHACL.NODE] = [{ "@id": "Some IRI" }, { "@id": "Some IRI" }];

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: false, message: "One or more invalid properties" });
    });

    it("succeeds if property with path with (node) range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = [{ "@id": "Some IRI" }];
      testProperty[SHACL.NODE] = [{ "@id": "Some IRI" }];

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: true, message: undefined });
    });

    it("succeeds if property with path with (class) range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = [{ "@id": "Some IRI" }];
      testProperty[SHACL.CLASS] = [{ "@id": "Some IRI" }];

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: true, message: undefined });
    });

    it("succeeds if property with path with (datatype) range", async () => {
      let testProperty: any = {};
      testProperty[SHACL.PATH] = [{ "@id": "Some IRI" }];
      testProperty[SHACL.DATATYPE] = [{ "@id": "Some IRI" }];

      let testData: any = {};
      testData[SHACL.PROPERTY] = [testProperty];
      const actual = await new Validator().validate(VALIDATION.IS_PROPERTY, testData);
      expect(actual).toEqual({ isValid: true, message: undefined });
    });
  });
});
