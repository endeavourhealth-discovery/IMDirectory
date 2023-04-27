import { describe, expect, it } from "vitest";
import { Entailment, Match, Node, OrderLimit, Relationship, Where } from "@/interfaces/AutoGen";
import { buildClauseUI, getEntailmentOptions, getMatchType, getPropertyValue, getMatchValue } from "@/helpers/ClauseUIBuilder";
import { MatchClauseUI } from "@/interfaces";

describe("ClauseUIBuilder.ts ___", () => {
  describe("buildClauseUI", () => {
    it("can get a ClauseUI list from a match type", () => {
      const uiData = buildClauseUI({ "@type": "Patient" } as Match);
      expect(uiData).toStrictEqual([
        {
          include: true,
          matchEntailment: [],
          matchType: { name: "Type", prop: "@type" },
          matchValue: {
            iri: "Patient",
            name: "Patient"
          }
        }
      ]);
    });

    it("can get a ClauseUI list from a match set", () => {
      const uiData = buildClauseUI({
        description: "Registered for gms",
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered for GMS services on reference date"
      } as Match);
      expect(uiData).toStrictEqual([
        {
          include: true,
          matchEntailment: [],
          matchType: { name: "Set", prop: "@set" },
          matchValue: {
            iri: "http://endhealth.info/im#Q_RegisteredGMS",
            name: "Registered for GMS services on reference date"
          }
        }
      ]);
    });

    it("can get a typeValue from where property", () => {
      const uiData = buildClauseUI({
        description: "aged between 65 and 70",
        where: [
          {
            range: { to: { operator: ">", value: "70", unit: null, relativeTo: null }, from: { operator: ">=", value: "65", unit: null, relativeTo: null } },
            "@id": "http://endhealth.info/im#age"
          }
        ]
      } as Match);
      expect(uiData).toStrictEqual([
        {
          include: true,
          matchEntailment: [],
          matchType: undefined,
          matchValue: undefined,
          where: [
            {
              whereProperty: {
                data: {
                  "http://www.w3.org/ns/shacl#path": [
                    {
                      "@id": "http://endhealth.info/im#age"
                    }
                  ]
                }
              },
              whereType: "range",
              whereValue: {
                to: { operator: ">", value: "70", unit: null, relativeTo: null },
                from: { operator: ">=", value: "65", unit: null, relativeTo: null }
              },
              whereEntailment: []
            }
          ]
        }
      ]);
    });
    it("can get a typeValue from where properties", () => {
      const uiData = buildClauseUI({
        exclude: true,
        description: "High BP not followed by screening invite",
        path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
        bool: "and",
        where: [
          {
            description: "Invited for Screening after BP",
            in: [{ "@set": "http://endhealth.info/im#InvitedForScreening" }],
            "@id": "http://endhealth.info/im#concept"
          },
          {
            description: "after high BP",
            operator: ">=",
            relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", variable: "latestBP" },
            "@id": "http://endhealth.info/im#effectiveDate"
          }
        ]
      } as Match);
      expect(uiData).toStrictEqual([
        {
          include: false,
          matchEntailment: [],
          matchType: undefined,
          matchValue: undefined,
          where: [
            {
              whereProperty: {
                data: {
                  "http://www.w3.org/ns/shacl#path": [
                    {
                      "@id": "http://endhealth.info/im#concept"
                    }
                  ]
                }
              },
              whereType: "in",
              whereValue: [{ "@set": "http://endhealth.info/im#InvitedForScreening" }],
              whereEntailment: []
            },
            {
              whereProperty: {
                data: {
                  "http://www.w3.org/ns/shacl#path": [
                    {
                      "@id": "http://endhealth.info/im#effectiveDate"
                    }
                  ]
                }
              },
              whereType: "comparison",
              whereValue: {
                description: "after high BP",
                operator: ">=",
                relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", variable: "latestBP" },
                "@id": "http://endhealth.info/im#effectiveDate"
              },
              whereEntailment: []
            }
          ]
        }
      ]);
    });
  });

  describe("getMatchType", () => {
    it("can get a clauseType from type", () => {
      const matchType = getMatchType({ "@type": "Patient" } as Match);
      expect(matchType).toStrictEqual({ name: "Type", prop: "@type" });
    });

    it("can get a clauseType from set", () => {
      const matchType = getMatchType({
        description: "Registered for gms",
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered for GMS services on reference date"
      } as Match);
      expect(matchType).toStrictEqual({ name: "Set", prop: "@set" });
    });

    it("can get a clauseType from entity", () => {
      const matchType = getMatchType({
        "@id": "http://snomed.info/sct#71388002",
        name: "Procedure (procedure)"
      } as Match);
      expect(matchType).toStrictEqual({ name: "Entity", prop: "@id" });
    });
  });

  describe("getTypeValue", () => {
    it("can get a typeValue from type", () => {
      const matchValue = getMatchValue({ "@type": "Patient" } as Match);
      expect(matchValue).toStrictEqual({ name: "Patient", iri: "Patient" });
    });

    it("can get a typeValue from set", () => {
      const matchValue = getMatchValue({ description: "Diabetic", "@set": "http://example/queries#Q_Diabetics" } as Match);
      expect(matchValue).toEqual({ name: "Q_Diabetics", iri: "http://example/queries#Q_Diabetics" });
    });

    it("can get a typeValue from entity", () => {
      const matchValue = getMatchValue({
        "@id": "http://snomed.info/sct#71388002",
        name: "Procedure (procedure)"
      } as Match);
      expect(matchValue).toEqual({ iri: "http://snomed.info/sct#71388002", name: "Procedure (procedure)" });
    });
  });

  describe("getEntailmentOptions", () => {
    it("can get a entailment options from query object - 1", () => {
      const entailment = { "@id": "http://snomed.info/sct#714628002", descendantsOf: true } as unknown as Entailment;
      const entailmentOptions = getEntailmentOptions(entailment);
      expect(entailmentOptions.length).toEqual(1);
      expect(entailmentOptions).toContain("descendantsOf");
    });

    it("can get a entailment options from query object - 2", () => {
      const entailment = { "@id": "http://snomed.info/sct#714628002", descendantsOf: true, ancestorsOf: true } as unknown as Entailment;
      const entailmentOptions = getEntailmentOptions(entailment);
      expect(entailmentOptions.length).toEqual(2);
      expect(entailmentOptions).toContain("descendantsOf");
      expect(entailmentOptions).toContain("ancestorsOf");
    });

    it("can get a entailment options from query object - 3", () => {
      const entailment = {
        "@id": "http://snomed.info/sct#714628002",
        descendantsOf: true,
        ancestorsOf: true,
        descendantsOrSelfOf: true
      } as unknown as Entailment;
      const entailmentOptions = getEntailmentOptions(entailment);
      expect(entailmentOptions.length).toEqual(3);
      expect(entailmentOptions).toContain("descendantsOf");
      expect(entailmentOptions).toContain("ancestorsOf");
      expect(entailmentOptions).toContain("descendantsOrSelfOf");
    });

    it("can get a entailment options from query object - 0", () => {
      const entailment = { "@id": "http://snomed.info/sct#714628002" } as unknown as Entailment;
      const entailmentOptions = getEntailmentOptions(entailment);
      expect(entailmentOptions.length).toEqual(0);
    });
  });

  describe("getPropertyValue", () => {
    it("can get a propertyValue from where range", () => {
      const range = { to: { operator: ">", value: "70", unit: null, relativeTo: null }, from: { operator: ">=", value: "65", unit: null, relativeTo: null } };
      const propertyValue = getPropertyValue({
        range: range,
        "@id": "http://endhealth.info/im#age"
      } as Where);
      expect(propertyValue.type).toEqual("range");
      expect(propertyValue.value).toEqual(range);
    });

    it("can get a propertyValue from where in", () => {
      const propertyValue = getPropertyValue({
        description: "Home or office based Systolic",
        name: "concept",
        in: [
          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure" },
          { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
        ],
        valueLabel: "Office or home systolic blood pressure",
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(propertyValue.type).toEqual("in");
      expect(propertyValue.value).toEqual([
        { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure" },
        { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
      ]);
    });

    it("can get a propertyValue from where operator", () => {
      const where = {
        description: "Last 6 months",
        operator: ">=",
        value: "-6",
        unit: "MONTHS",
        relativeTo: { "@id": "http://endhealth.info/im#$referenceDate" },
        valueLabel: "last 6 months",
        "@id": "http://endhealth.info/im#effectiveDate"
      } as Where;
      const propertyValue = getPropertyValue(where);
      expect(propertyValue.type).toEqual("comparison");
      expect(propertyValue.value).toEqual(where);
    });
  });
});
