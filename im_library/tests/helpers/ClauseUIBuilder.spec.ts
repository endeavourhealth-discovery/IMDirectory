import { describe, expect, it } from "vitest";
import { Entailment, Match, Node, OrderLimit, Relationship, Where } from "@/interfaces/AutoGen";
import { buildClauseUI, getClauseType, getEntailmentOptions, getPropertyValue, getTypeValue } from "@/helpers/ClauseUIBuilder";

describe("ClauseUIBuilder.ts ___", () => {
  describe("buildClauseUI", () => {
    it("can get a ClauseUI list from a match type", () => {
      const uiData = buildClauseUI({ "@type": "Patient" } as Match);
      expect(uiData.length).toEqual(1);
      expect(uiData[0].clauseType.name).toEqual("Type");
      expect(uiData[0].clauseType.prop).toEqual("@type");
      expect(uiData[0].typeValue.name).toEqual("Patient");
      expect(uiData[0].typeValue.iri).toEqual("Patient");
    });

    it("can get a ClauseUI list from a match set", () => {
      const uiData = buildClauseUI({
        description: "Registered for gms",
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered for GMS services on reference date"
      } as Match);
      expect(uiData.length).toEqual(1);
      expect(uiData[0].clauseType.name).toEqual("Set");
      expect(uiData[0].clauseType.prop).toEqual("@set");
      expect(uiData[0].typeValue.name).toEqual("Registered for GMS services on reference date");
      expect(uiData[0].typeValue.iri).toEqual("http://endhealth.info/im#Q_RegisteredGMS");
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
      expect(uiData.length).toEqual(1);
      expect(uiData[0].clauseType.name).toEqual("Property");
      expect(uiData[0].clauseType.prop).toEqual("@id");
      expect(uiData[0].typeValue.name).toEqual("age");
      expect(uiData[0].typeValue.iri).toEqual("http://endhealth.info/im#age");
      expect(uiData[0].propertyValue.type).toEqual("range");
      expect(uiData[0].propertyValue.value).toEqual({
        to: { operator: ">", value: "70", unit: null, relativeTo: null },
        from: { operator: ">=", value: "65", unit: null, relativeTo: null }
      });
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
      expect(uiData.length).toEqual(2);
      expect(uiData[0].clauseType.name).toEqual("Property");
      expect(uiData[0].clauseType.prop).toEqual("@id");
      expect(uiData[0].typeValue.name).toEqual("concept");
      expect(uiData[0].typeValue.iri).toEqual("http://endhealth.info/im#concept");

      expect(uiData[1].clauseType.name).toEqual("Property");
      expect(uiData[1].clauseType.prop).toEqual("@id");
      expect(uiData[1].typeValue.name).toEqual("effectiveDate");
      expect(uiData[1].typeValue.iri).toEqual("http://endhealth.info/im#effectiveDate");
    });
  });

  describe("getClauseType", () => {
    it("can get a clauseType from type", () => {
      const clauseType = getClauseType({ "@type": "Patient" } as Match);
      expect(clauseType.name).toEqual("Type");
      expect(clauseType.prop).toEqual("@type");
    });

    it("can get a clauseType from set", () => {
      const clauseType = getClauseType({
        description: "Registered for gms",
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered for GMS services on reference date"
      } as Match);
      expect(clauseType.name).toEqual("Set");
      expect(clauseType.prop).toEqual("@set");
    });

    it("can get a clauseType from entity", () => {
      const clauseType = getClauseType({
        "@id": "http://snomed.info/sct#71388002",
        name: "Procedure (procedure)"
      } as Match);
      expect(clauseType.name).toEqual("Entity");
      expect(clauseType.prop).toEqual("@id");
    });
  });

  describe("getTypeValue", () => {
    it("can get a typeValue from type", () => {
      const typeValue = getTypeValue({ "@type": "Patient" } as Match);
      expect(typeValue.iri).toEqual("Patient");
      expect(typeValue.name).toEqual("Patient");
    });

    it("can get a typeValue from set", () => {
      const typeValue = getTypeValue({ description: "Diabetic", "@set": "http://example/queries#Q_Diabetics" } as Match);
      expect(typeValue.iri).toEqual("http://example/queries#Q_Diabetics");
      expect(typeValue.name).toEqual("Q_Diabetics");
    });

    it("can get a typeValue from entity", () => {
      const typeValue = getTypeValue({
        "@id": "http://snomed.info/sct#71388002",
        name: "Procedure (procedure)"
      } as Match);
      expect(typeValue.iri).toEqual("http://snomed.info/sct#71388002");
      expect(typeValue.name).toEqual("Procedure (procedure)");
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
