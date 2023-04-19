import { describe, expect, it } from "vitest";
import { getDisplayFromMatch, getDisplayFromWhere, getDisplayFromList, getDisplayFromEntailment, getDisplayFromPath } from "@/helpers/TextQueryBuilder";
import { Match, Node, Relationship, Where } from "@/interfaces/AutoGen";

describe("TextQueryBuilder.ts ___", () => {
  describe("getDisplayFromMatch", () => {
    it("can get a display for a type match clause without a name", () => {
      const display = getDisplayFromMatch({ "@type": "Patient" } as Match);
      expect(display).toEqual("Patient");
    });

    it("can get a display for a set match clause with a name", () => {
      const display = getDisplayFromMatch({
        description: "Registered for gms",
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered for GMS services on reference date"
      } as Match);
      expect(display).toEqual("Registered for GMS services on reference date");
    });

    it("can get a display for an exclude set match clause", () => {
      const display = getDisplayFromMatch({
        exclude: true,
        description: "not hypertensive",
        "@set": "http://endhealth.info/im#Q_Hypertensives",
        name: "Hypertensives"
      } as Match);
      expect(display).toEqual("exclude Hypertensives");
    });

    it("can get a display for an exclude set match clause", () => {
      const display = getDisplayFromMatch({
        exclude: true,
        description: "not hypertensive",
        "@set": "http://endhealth.info/im#Q_Hypertensives",
        name: "Hypertensives"
      } as Match);
      expect(display).toEqual("exclude Hypertensives");
    });

    it("can get a display for a match with a where in clause", () => {
      const display = getDisplayFromMatch({
        path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
        where: [{ in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }], "@id": "http://endhealth.info/im#concept" }]
      } as Match);
      expect(display).toEqual("observation->Observation.concept: <714628002");
    });

    it("can get a display for a match with multiple where clauses", () => {
      const display = getDisplayFromMatch({
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
      expect(display).toEqual("observation->Observation.concept: InvitedForScreening AND observation->Observation.effectiveDate >= latestBP.effectiveDate");
    });
  });

  describe("getDisplayFromWhere", () => {
    it("can get a display for a where with an in list", () => {
      const display = getDisplayFromWhere({
        in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept: <714628002");
    });

    it("can get a display for a where with a not in list", () => {
      const display = getDisplayFromWhere({
        notIn: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept!: <714628002");
    });

    it("can get a display for a where with an in list with multiple items", () => {
      const display = getDisplayFromWhere({
        in: [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept in [<Prediabetes (finding) and more...]");
    });

    it("can get a display for a where with an in list with multiple items", () => {
      const display = getDisplayFromWhere({
        notIn: [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept not in [<Prediabetes (finding) and more...]");
    });

    it("can get a display for a where with an operator", () => {
      const display = getDisplayFromWhere({
        description: ">150",
        operator: ">",
        value: "150",
        variable: "latestBP",
        "@id": "http://endhealth.info/im#numericValue"
      } as Where);
      expect(display).toEqual("latestBP.numericValue > 150");
    });

    it("can get a display for a where with an operator and a relativeTo", () => {
      const display = getDisplayFromWhere({
        description: "after high BP",
        operator: ">=",
        relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", variable: "latestBP" },
        "@id": "http://endhealth.info/im#effectiveDate"
      } as Where);
      expect(display).toEqual("effectiveDate >= latestBP.effectiveDate");
    });
  });

  describe("getDisplayFromList", () => {
    it("can get a display from an in list with a single item without a name", () => {
      const display = getDisplayFromList([{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }] as Node[], true);
      expect(display).toEqual(": <714628002");
    });

    it("can get a display from a list with a single item with a name", () => {
      const display = getDisplayFromList([{ "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true }] as Node[], true);
      expect(display).toEqual(": <Prediabetes (finding)");
    });

    it("can get a display from a list with multiple items with names", () => {
      const display = getDisplayFromList(
        [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ] as Node[],
        true
      );
      expect(display).toEqual(" in [<Prediabetes (finding) and more...]");
    });
  });

  describe("getDisplayFromEntailment", () => {
    it("can get the display symbol '<' from descendantsOf", () => {
      const display = getDisplayFromEntailment({ "@id": "http://snomed.info/sct#714628002", descendantsOf: true } as Node);
      expect(display).toEqual("<");
    });

    it("can get the display symbol '<<' from descendantsOf", () => {
      const display = getDisplayFromEntailment({ "@id": "http://snomed.info/sct#714628002", descendantsOrSelfOf: true } as Node);
      expect(display).toEqual("<<");
    });

    it("can get the display symbol '>' from descendantsOf", () => {
      const display = getDisplayFromEntailment({ "@id": "http://snomed.info/sct#714628002", ancestorsOf: true } as Node);
      expect(display).toEqual(">");
    });
  });

  describe("getPathDisplay", () => {
    it("can get a display for a path", () => {
      const display = getDisplayFromPath({ "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } } as Relationship);
      expect(display).toEqual("observation->Observation");
    });

    it("can get a display for a nested path", () => {
      const display = getDisplayFromPath({
        "@id": "http://endhealth.info/im#observation",
        node: { "@type": "Observation", path: { "@id": "http://endhealth.info/im#patient", node: { "@type": "http://endhealth.info/im#Patient" } } }
      } as Relationship);
      expect(display).toEqual("observation->Observation.patient->Patient");
    });
  });
});
