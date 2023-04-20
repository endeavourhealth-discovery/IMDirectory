import { describe, expect, it } from "vitest";
import {
  getDisplayFromMatch,
  getDisplayFromWhere,
  getDisplayFromList,
  getDisplayFromEntailment,
  getDisplayFromPath,
  getDisplayFromOperator,
  getDisplayFromRange,
  getDisplayFromLogic,
  getDisplayFromWhereList,
  buildTextQuery
} from "@/helpers/TextQueryBuilder";
import { Match, Node, Relationship, Where } from "@/interfaces/AutoGen";

describe("TextQueryBuilder.ts ___", () => {
  describe("buildTextQuery", () => {
    it("can get buid a textQuery from a query definition", () => {
      const textQuery = buildTextQuery({
        match: [
          {
            path: {
              "@id": "http://endhealth.info/im#gpCurrentRegistration",
              node: {
                "@id": "http://endhealth.info/im#GPRegistration"
              }
            },
            bool: "and",
            where: [
              {
                in: [
                  {
                    "@id": "http://endhealth.info/im#2751000252106",
                    name: "Regular GMS patient",
                    descendantsOrSelfOf: true
                  }
                ],
                valueLabel: "GMSpatient",
                "@id": "http://endhealth.info/im#gpPatientType"
              },
              {
                operator: ">=",
                value: "18",
                unit: "YEAR",
                "@id": "http://endhealth.info/im#age"
              }
            ]
          }
        ]
      });
      expect(textQuery.length).toEqual(1);
      expect(textQuery[0].display).toEqual(
        "gpCurrentRegistration->GPRegistration.gpPatientType: &lt;&lt;Regular GMS patient <span style='color: orange;'>and</span> gpCurrentRegistration->GPRegistration.age >= 18 YEAR"
      );
    });
  });

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
      expect(display).toEqual("<span style='color: red;'>exclude</span> Hypertensives");
    });

    it("can get a display for an exclude set match clause", () => {
      const display = getDisplayFromMatch({
        exclude: true,
        description: "not hypertensive",
        "@set": "http://endhealth.info/im#Q_Hypertensives",
        name: "Hypertensives"
      } as Match);
      expect(display).toEqual("<span style='color: red;'>exclude</span> Hypertensives");
    });

    it("can get a display for a match with a where in clause", () => {
      const display = getDisplayFromMatch({
        path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
        where: [{ in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }], "@id": "http://endhealth.info/im#concept" }]
      } as Match);
      expect(display).toEqual("observation->Observation.concept: &lt;714628002");
    });

    it("can get a display for a match with where and a variable", () => {
      const display = getDisplayFromMatch({
        path: {
          "@id": "http://endhealth.info/im#observation",
          node: {
            "@id": "http://endhealth.info/im#Observation",
            variable: "with1"
          }
        },
        where: [
          {
            in: [
              {
                "@set": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11",
                name: "SMIResolved"
              },
              {
                "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                name: "SMI"
              }
            ],
            valueLabel: "SMIResolved,SMI",
            "@id": "http://endhealth.info/im#concept"
          }
        ],
        orderBy: [
          {
            direction: "ascending",
            variable: "with1",
            limit: 1,
            "@id": "http://endhealth.info/im#effectiveDate"
          }
        ]
      } as Match);

      expect(display).toEqual("(observation->Observation as with1).concept in [SMIResolved and more...]");
    });

    it("can get a display for a match with multiple where clauses", () => {
      const display = getDisplayFromMatch({
        path: {
          "@id": "http://endhealth.info/im#gpCurrentRegistration",
          node: {
            "@id": "http://endhealth.info/im#GPRegistration"
          }
        },
        bool: "and",
        where: [
          {
            in: [
              {
                "@id": "http://endhealth.info/im#2751000252106",
                name: "Regular GMS patient",
                descendantsOrSelfOf: true
              }
            ],
            valueLabel: "GMSpatient",
            "@id": "http://endhealth.info/im#gpPatientType"
          },
          {
            operator: ">=",
            value: "18",
            unit: "YEAR",
            "@id": "http://endhealth.info/im#age"
          }
        ]
      } as Match);
      expect(display).toEqual(
        "gpCurrentRegistration->GPRegistration.gpPatientType: &lt;&lt;Regular GMS patient <span style='color: orange;'>and</span> gpCurrentRegistration->GPRegistration.age >= 18 YEAR"
      );
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
      expect(display).toEqual(
        "<span style='color: red;'>exclude</span> observation->Observation.concept: InvitedForScreening <span style='color: orange;'>and</span> <span style='color: red;'>exclude</span> observation->Observation.effectiveDate >= latestBP.effectiveDate"
      );
    });

    it("can get a display for a match with nested matches", () => {
      const display = getDisplayFromMatch({
        boolMatch: "or",
        match: [
          {
            description: "aged between 65 and 70",
            where: [
              {
                range: {
                  to: { operator: ">", value: "70", unit: null, relativeTo: null },
                  from: { operator: ">=", value: "65", unit: null, relativeTo: null }
                },
                "@id": "http://endhealth.info/im#age"
              }
            ]
          },
          { description: "Diabetic", "@set": "http://example/queries#Q_Diabetics" },
          {
            path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
            where: [{ in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }], "@id": "http://endhealth.info/im#concept" }]
          }
        ]
      } as Match);
      expect(display).toEqual("<span style='color: orange;'>and</span> ");
    });
  });

  describe("getDisplayFromWhere", () => {
    it("can get a display for a where with an in list", () => {
      const display = getDisplayFromWhere({
        in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept: &lt;714628002");
    });

    it("can get a display for a where with a not in list", () => {
      const display = getDisplayFromWhere({
        notIn: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept!: &lt;714628002");
    });

    it("can get a display for a where with an in list with multiple items", () => {
      const display = getDisplayFromWhere({
        in: [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept in [&lt;Prediabetes (finding) and more...]");
    });

    it("can get a display for a where with an in list with multiple items", () => {
      const display = getDisplayFromWhere({
        notIn: [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept not in [&lt;Prediabetes (finding) and more...]");
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

    it("can get a display for a where with a range", () => {
      const display = getDisplayFromWhere({
        range: { to: { operator: ">", value: "70", unit: null, relativeTo: null }, from: { operator: ">=", value: "65", unit: null, relativeTo: null } },
        "@id": "http://endhealth.info/im#age"
      } as Where);
      expect(display).toEqual("age from >= 65 to > 70");
    });
  });

  describe("getDisplayFromList", () => {
    it("can get a display from an in list with a single item without a name", () => {
      const display = getDisplayFromList([{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }] as Node[], true);
      expect(display).toEqual(": &lt;714628002");
    });

    it("can get a display from a list with a single item with a name", () => {
      const display = getDisplayFromList([{ "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true }] as Node[], true);
      expect(display).toEqual(": &lt;Prediabetes (finding)");
    });

    it("can get a display from a list with multiple items with names", () => {
      const display = getDisplayFromList(
        [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ] as Node[],
        true
      );
      expect(display).toEqual(" in [&lt;Prediabetes (finding) and more...]");
    });
  });

  describe("getDisplayFromEntailment", () => {
    it("can get the display symbol '<' from descendantsOf", () => {
      const display = getDisplayFromEntailment({ "@id": "http://snomed.info/sct#714628002", descendantsOf: true } as Node);
      expect(display).toEqual("&lt;");
    });

    it("can get the display symbol '&lt;&lt;' from descendantsOf", () => {
      const display = getDisplayFromEntailment({ "@id": "http://snomed.info/sct#714628002", descendantsOrSelfOf: true } as Node);
      expect(display).toEqual("&lt;&lt;");
    });

    it("can get the display symbol '>' from descendantsOf", () => {
      const display = getDisplayFromEntailment({ "@id": "http://snomed.info/sct#714628002", ancestorsOf: true } as Node);
      expect(display).toEqual("&gt;");
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

  describe("getDisplayFromOperator", () => {
    it("can get a display for a where operator", () => {
      const display = getDisplayFromOperator({
        operator: ">=",
        value: "18",
        unit: "YEAR",
        "@id": "http://endhealth.info/im#age"
      } as Where);
      expect(display).toEqual("age >= 18 YEAR");
    });
  });

  describe("getDisplayFromWhereList", () => {
    it("can get a display for a where list", () => {
      const displays = getDisplayFromWhereList("gpCurrentRegistration->GPRegistration", [
        {
          in: [
            {
              "@id": "http://endhealth.info/im#2751000252106",
              name: "Regular GMS patient",
              descendantsOrSelfOf: true
            }
          ],
          valueLabel: "GMSpatient",
          "@id": "http://endhealth.info/im#gpPatientType"
        },
        {
          operator: ">=",
          value: "18",
          unit: "YEAR",
          "@id": "http://endhealth.info/im#age"
        }
      ] as Where[]);
      expect(displays.length).toEqual(2);
      expect(displays[0]).toEqual("gpCurrentRegistration->GPRegistration.gpPatientType: &lt;&lt;Regular GMS patient");
      expect(displays[1]).toEqual("gpCurrentRegistration->GPRegistration.age >= 18 YEAR");
    });

    describe("getDisplayFromLogic", () => {
      it("can get default display for a text", () => {
        const display = getDisplayFromLogic("");
        expect(display).toEqual("<span style='color: orange;'>and</span> ");
      });

      it("can get a display for a logic operator exlude", () => {
        const display = getDisplayFromLogic("exclude");
        expect(display).toEqual("<span style='color: red;'>exclude</span> ");
      });

      it("can get a display for a logic operator and", () => {
        const display = getDisplayFromLogic("and");
        expect(display).toEqual("<span style='color: orange;'>and</span> ");
      });

      it("can get a display for a logic operator or", () => {
        const display = getDisplayFromLogic("or");
        expect(display).toEqual("<span style='color: blue;'>or</span> ");
      });
    });
  });

  describe("getDisplayFromRange", () => {
    it("can get a display for a where range", () => {
      const display = getDisplayFromRange({
        range: { to: { operator: ">", value: "70", unit: null, relativeTo: null }, from: { operator: ">=", value: "65", unit: null, relativeTo: null } },
        "@id": "http://endhealth.info/im#age"
      } as Where);
      expect(display).toEqual("age from >= 65 to > 70");
    });
  });
});
