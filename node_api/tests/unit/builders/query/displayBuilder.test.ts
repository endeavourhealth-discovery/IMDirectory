import { expect, test } from "vitest";
import { buildQueryDisplayFromQuery } from "@/builders/query/displayBuilder";
import { CSET_EmailOnlineEncounter, CSET_EncFaceToFaceOnPrem, CSET_NELChis2021, CSET_OralNSAIDs } from "./testData";

test("WHEN Query with where clause __ THEN transform to QueryDisplay having with", () => {
  const queryDisplay = buildQueryDisplayFromQuery(CSET_OralNSAIDs);
  expect(queryDisplay.children.length).toEqual(1);
  expect(queryDisplay.children[0].label).toEqual("must be a");
  expect(queryDisplay.children[0].children.length).toEqual(2);
  expect(queryDisplay.children[0].children[0].label).toEqual("Medicinal product (product)");
  expect(queryDisplay.children[0].children[1].label).toEqual("with");
  expect(queryDisplay.children[0].children[1].children.length).toEqual(2);
  expect(queryDisplay.children[0].children[1].children[0].label).toEqual("Has active ingredient (attribute)");
  expect(queryDisplay.children[0].children[1].children[0].value.property.name).toEqual("Has active ingredient (attribute)");
  expect(queryDisplay.children[0].children[1].children[0].value.is.name).toEqual("Non-steroidal anti-inflammatory agent (substance)");
  expect(queryDisplay.children[0].children[1].children[1].label).toEqual("Has manufactured dose form (attribute)");
  expect(queryDisplay.children[0].children[1].children[1].value.property.name).toEqual("Has manufactured dose form (attribute)");
  expect(queryDisplay.children[0].children[1].children[1].value.is.name).toEqual("Oral dose form (dose form)");
});

test("WHEN Query with form list __ THEN transform to QueryDisplay having any of", () => {
  const queryDisplay = buildQueryDisplayFromQuery(CSET_EmailOnlineEncounter);
  expect(queryDisplay.children.length).toEqual(1);
  expect(queryDisplay.children[0].label).toEqual("any of");
  expect(queryDisplay.children[0].children.length).toEqual(2);
  expect(queryDisplay.children[0].children[0].label).toEqual("Text message consultation");
  expect(queryDisplay.children[0].children[1].label).toEqual("Email consultation");
});

test("WHEN Query with type where __ THEN transform to QueryDisplay with where condition", () => {
  const queryDisplay = buildQueryDisplayFromQuery(CSET_NELChis2021);
  expect(queryDisplay.children.length).toEqual(1);
  expect(queryDisplay.children[0].label).toEqual("any of");
  expect(queryDisplay.children[0].children.length).toEqual(25);
  expect(queryDisplay.children[0].children[0].label).toEqual("Administration of vaccine product containing bacteria antigen (procedure)");
  expect(queryDisplay.children[0].children[1].label).toEqual("Vaccination given (situation)");
  expect(queryDisplay.children[0].children[8].label).toEqual("http://endhealth.info/im#Concept");
  expect(queryDisplay.children[0].children[8].children.length).toEqual(1);
  expect(queryDisplay.children[0].children[8].children[0].label).toEqual("http://snomed.info/sct#363589002");
  expect(queryDisplay.children[0].children[8].children[0].type).toEqual("propertyIs");
  expect(queryDisplay.children[0].children[8].children[0].value.property.name).toEqual("http://snomed.info/sct#363589002");
  expect(queryDisplay.children[0].children[8].children[0].value.is.name).toEqual("http://snomed.info/sct#117103007");
});

test("WHEN Query with single from __ THEN transform to QueryDisplay with must be a", () => {
  const queryDisplay = buildQueryDisplayFromQuery(CSET_EncFaceToFaceOnPrem);
  expect(queryDisplay.children.length).toEqual(1);
  expect(queryDisplay.children[0].label).toEqual("must be a");
  expect(queryDisplay.children[0].children.length).toEqual(1);
  expect(queryDisplay.children[0].children[0].label).toEqual("Consultation on premise");
});
