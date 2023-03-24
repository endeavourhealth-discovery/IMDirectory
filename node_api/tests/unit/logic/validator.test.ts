import { expect, test } from "vitest";
import Validator from "@/logic/validator";

test("Is valid IRI and data", () => {
  const actual = new Validator().validate("http://endhealth.info/im#Validation_hasParent", {
    "http://endhealth.info/im#isContainedIn": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
  });
  expect(actual).toBe(true);
});

test("Is invalid IRI and valid data", () => {
  const actual = new Validator().validate("http://endhealth.info/im#Validation_hasParent", {
    "http://endhealth.info/im#foo": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
  });
  expect(actual).toBe(false);
});

test("Is valid IRI and invalid data", () => {
  const actual = new Validator().validate("http://endhealth.info/im#Validation_hasParent", {
    "http://endhealth.info/im#isContainedIn": "foo"
  });
  expect(actual).toBe(false);
});

test("Is invalid IRI and invalid data", () => {
  const actual = new Validator().validate("http://endhealth.info/im#Validation_hasParent", {
    "http://endhealth.info/im#isContainedIn": "foo"
  });
  expect(actual).toBe(false);
});
