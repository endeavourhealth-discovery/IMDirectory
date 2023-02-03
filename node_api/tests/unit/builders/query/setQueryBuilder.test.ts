import { expect, test } from "vitest";
import { buildQueryFromSetQueryObject, buildSetQueryObjectFromQuery } from "@/builders/query/setQueryBuilder";
import {
  CSET_EmailOnlineEncounter,
  CSET_EmailOnlineEncounterSetQueryObject,
  CSET_EncFaceToFaceOnPrem,
  CSET_EncFaceToFaceOnPremSetQueryObject,
  CSET_NELChis2021,
  CSET_NELChis2021SetQueryObject,
  CSET_OralNSAIDs,
  CSET_OralNSAIDsSetQueryObject
} from "./testData";

test("WHEN Query with where clauses __ THEN transform to setQueryObject having refinements", () => {
  const setQueryObject = buildSetQueryObjectFromQuery(CSET_OralNSAIDs);
  expect(setQueryObject).toStrictEqual(CSET_OralNSAIDsSetQueryObject);
});

test("WHEN Query with or __ THEN transform to multiple setQueryObjects", () => {
  const setQueryObject = buildSetQueryObjectFromQuery(CSET_EmailOnlineEncounter);
  expect(setQueryObject).toStrictEqual(CSET_EmailOnlineEncounterSetQueryObject);
});

test("WHEN Query with single from __ THEN transform to single setQueryObjects", () => {
  const setQueryObject = buildSetQueryObjectFromQuery(CSET_EncFaceToFaceOnPrem);
  expect(setQueryObject).toStrictEqual(CSET_EncFaceToFaceOnPremSetQueryObject);
});

test("WHEN Query with type condition __ THEN transform to setQueryObject with refinement", () => {
  const setQueryObject = buildSetQueryObjectFromQuery(CSET_NELChis2021);
  expect(setQueryObject).toStrictEqual(CSET_NELChis2021SetQueryObject);
});

test("WHEN setQueryObject has refinements __ THEN transform to Query with where clauses", () => {
  const query = buildQueryFromSetQueryObject(CSET_OralNSAIDsSetQueryObject);
  expect(query).toStrictEqual(CSET_OralNSAIDs);
});

test("WHEN setQueryObject has only single concept __ THEN transform to Query with single from", () => {
  const query = buildQueryFromSetQueryObject(CSET_EncFaceToFaceOnPremSetQueryObject);
  expect(query).toStrictEqual(CSET_EncFaceToFaceOnPrem);
});

test("WHEN setQueryObject has multiple concepts __ THEN transform to Query with from list", () => {
  const query = buildQueryFromSetQueryObject(CSET_EmailOnlineEncounterSetQueryObject);
  expect(query).toStrictEqual(CSET_EmailOnlineEncounter);
});

test("WHEN setQueryObject has multiple concepts __ THEN transform to Query with from list", () => {
  const query = buildQueryFromSetQueryObject(CSET_NELChis2021SetQueryObject);
  expect(query).toStrictEqual(CSET_NELChis2021);
});
