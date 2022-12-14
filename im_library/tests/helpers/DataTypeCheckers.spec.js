import { isArrayHasLength, isObjectHasKeys, isObject } from "@/helpers/DataTypeCheckers";

describe("DataTypeCheckers.ts ___", () => {
  describe("isArrayHasLength", () => {
    it("can check an standard string array ___ true", () => {
      const testArray = ["one", "two", "three", "four"];
      expect(isArrayHasLength(testArray)).toBe(true);
    });

    it("can handle empty array", () => {
      const testArray = [];
      expect(isArrayHasLength(testArray)).toBe(false);
    });

    it("can handle not array ___ object", () => {
      const testData = { array: "not array" };
      expect(isArrayHasLength(testData)).toBe(false);
    });

    it("can handle multiple types within array", () => {
      const testArray = ["one", 2, { value: "three" }, ["four"]];
      expect(isArrayHasLength(testArray)).toBe(true);
    });

    it("is can handle undefined", () => {
      expect(isArrayHasLength(undefined)).toBe(false);
    });

    it("can handle null", () => {
      expect(isArrayHasLength(null)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("checks is an object ___ true", () => {
      const testObject = { value: "I'm an object" };
      expect(isObject(testObject)).toBe(true);
    });

    it("checks is an object ___ false ___ string", () => {
      const testObject = "I'm a string";
      expect(isObject(testObject)).toBe(false);
    });

    it("checks is an object ___ false ___ array", () => {
      const testObject = ["I'm an array"];
      expect(isObject(testObject)).toBe(false);
    });

    it("checks is an object ___ false ___ fn", () => {
      const testObject = function () {
        return true;
      };
      expect(isObject(testObject)).toBe(false);
    });

    it("checks is an object ___ false ___ undefined", () => {
      expect(isObject(undefined)).toBe(false);
    });

    it("checks is an object ___ false ___ null", () => {
      expect(isObject(null)).toBe(false);
    });

    it("checks is an object ___ true ___ empty object", () => {
      expect(isObject({})).toBe(true);
    });
  });

  describe("isObjectHasKeys", () => {
    it("checks is an objectHasKeys ___ true", () => {
      const testObject = { value: "I'm an object" };
      expect(isObjectHasKeys(testObject, ["value"])).toBe(true);
    });

    it("checks is an objectHasKeys ___ false ___ object missing key", () => {
      const testObject = { value: "I'm an object" };
      expect(isObjectHasKeys(testObject, ["data"])).toBe(false);
    });

    it("checks is an object ___ false ___ string", () => {
      const testObject = "I'm a string";
      expect(isObjectHasKeys(testObject, ["value"])).toBe(false);
    });

    it("checks is an object ___ false ___ array", () => {
      const testObject = ["I'm an array"];
      expect(isObjectHasKeys(testObject, ["value"])).toBe(false);
    });

    it("checks is an object ___ false ___ fn", () => {
      const testObject = function () {
        return true;
      };
      expect(isObjectHasKeys(testObject, ["value"])).toBe(false);
    });

    it("checks is an object ___ false ___ undefined", () => {
      expect(isObjectHasKeys(undefined, ["value"])).toBe(false);
    });

    it("checks is an object ___ false ___ null", () => {
      expect(isObjectHasKeys(null, ["value"])).toBe(false);
    });
  });
});
