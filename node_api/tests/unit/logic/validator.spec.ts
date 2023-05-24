import { expect, test } from "vitest";
import Validator from "../../../src/logic/validator";
import { VALIDATION } from "@im-library/vocabulary";

test("Is valid IRI and data", () => {
  const actual = new Validator().validate(VALIDATION.HAS_PARENT, {
    "http://endhealth.info/im#isContainedIn": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
  });
  expect(actual).toBe(true);
});

test("Is invalid IRI and valid data", () => {
  const actual = new Validator().validate(VALIDATION.HAS_PARENT, {
    "http://endhealth.info/im#foo": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
  });
  expect(actual).toBe(false);
});

test("Is valid IRI and invalid data", () => {
  const actual = new Validator().validate(VALIDATION.HAS_PARENT, {
    "http://endhealth.info/im#isContainedIn": "foo"
  });
  expect(actual).toBe(false);
});

test("Is invalid IRI and invalid data", () => {
  const actual = new Validator().validate(VALIDATION.HAS_PARENT, {
    "http://endhealth.info/im#isContainedIn": "foo"
  });
  expect(actual).toBe(false);
});
