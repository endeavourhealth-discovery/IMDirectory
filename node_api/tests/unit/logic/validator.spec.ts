import { expect, test } from "vitest";
import Validator from "../../../src/logic/validator";
import { IM } from "@im-library/vocabulary";

test("Is valid IRI and data", () => {
  const actual = new Validator().validate(IM.validation.HAS_PARENT, {
    "http://endhealth.info/im#isContainedIn": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
  });
  expect(actual).toEqual({ isValid: true });
});

test("Is invalid IRI and valid data", () => {
  const actual = new Validator().validate(IM.validation.HAS_PARENT, {
    "http://endhealth.info/im#foo": [{ "@id": "http://endhealth.info/im#IMQuery", name: "Test" }]
  });
  expect(actual).toEqual({ isValid: false, message: "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'." });
});

test("Is valid IRI and invalid data", () => {
  const actual = new Validator().validate(IM.validation.HAS_PARENT, {
    "http://endhealth.info/im#isContainedIn": "foo"
  });
  expect(actual).toEqual({ isValid: false, message: "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'." });
});

test("Is invalid IRI and invalid data", () => {
  const actual = new Validator().validate(IM.validation.HAS_PARENT, {
    "http://endhealth.info/im#foo": "bar"
  });
  expect(actual).toEqual({ isValid: false, message: "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'." });
});
