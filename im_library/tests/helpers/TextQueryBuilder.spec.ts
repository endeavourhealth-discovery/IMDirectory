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
  buildTextQuery,
  getDisplayFromOrderByList,
  getDisplayFromOrderBy
} from "@/helpers/TextQueryBuilder";
import { Match, Node, OrderLimit, Path, Where } from "@/interfaces/AutoGen";

describe("TextQueryBuilder.ts ___", () => {
  describe("buildTextQuery", () => {
    it("can get buid a textQuery from a query definition", () => {
      const textQuery = buildTextQuery({
        match: [
          {
            "@id": "http://snomed.info/sct#763158003",
            name: "Medicinal product (product)",
            descendantsOrSelfOf: true,
            boolWhere: "and",
            where: [
              {
                "@id": "http://snomed.info/sct#127489000",
                name: "Has active ingredient (attribute)",
                in: [
                  {
                    "@id": "http://snomed.info/sct#372665008",
                    name: "Non-steroidal anti-inflammatory agent (substance)",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#411116001",
                name: "Has manufactured dose form (attribute)",
                in: [
                  {
                    "@id": "http://snomed.info/sct#385268001",
                    name: "Oral dose form (dose form)",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      } as Match);
      expect(textQuery.length).toEqual(1);
      expect(textQuery[0].display).toEqual(
        "&lt;&lt;Medicinal product (product) with .Has active ingredient (attribute): &lt;&lt;Non-steroidal anti-inflammatory agent (substance) <span style=\'color: orange;\'>and</span>  with .Has manufactured dose form (attribute): &lt;&lt;Oral dose form (dose form)"
      );
    });

    it("can get buid a textQuery from a query definition", () => {
      const textQuery = buildTextQuery({
        match: [
          {
            boolMatch: "or",
            match: [
              {
                name: "Text message consultation",
                descendantsOrSelfOf: true,
                "@id": "http://endhealth.info/im#1681000252102"
              },
              {
                name: "Email consultation",
                descendantsOrSelfOf: true,
                "@id": "http://endhealth.info/im#901000252100"
              }
            ]
          }
        ]
      } as Match);
      expect(textQuery.length).toEqual(2);
      expect(textQuery[0].display).toEqual("&lt;&lt;Text message consultation");
    });

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
        "gpPatientType: &lt;&lt;Regular GMS patientage >= 18 YEAR"
      );
    });
  });

  describe("getDisplayFromMatch", () => {
    it("can get a display for a type match clause without a name", () => {
      const display = getDisplayFromMatch({ "@type": "Patient" } as Match);
      expect(display).toEqual("Patient");
    });

    it("can get a display for a match with entailment", () => {
      const display = getDisplayFromMatch({
        name: "Text message consultation",
        descendantsOrSelfOf: true,
        "@id": "http://endhealth.info/im#1681000252102"
      } as Match);
      expect(display).toEqual("&lt;&lt;Text message consultation");
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
        path: [
          {
            "@id": "http://endhealth.info/im#observation",
            "match": {
              "@type": "Observation",
              "description": "Observation"
            }
          }
        ],
        where: [{ in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }], "@id": "http://endhealth.info/im#concept" }]
      } as Match);
      expect(display).toEqual("observation.concept: &lt;714628002");
    });

    it("can get a display for a match with where and a variable", () => {
      const display = getDisplayFromMatch({
        path: [
          {
            "@id": "http://endhealth.info/im#observation",
            match: {
              boolWhere: "and",
              "@type": "Observation",
              where: [
                {
                  "@id": "http://endhealth.info/im#concept",
                  in: [
                    {
                      "@set": "http://endhealth.info/im#InvitedForScreening",
                      name: "InvitedForScreening"
                    }
                  ],
                  name: "concept",
                  description: " is InvitedForScreening"
                },
                {
                  "@id": "http://endhealth.info/im#effectiveDate",
                  operator: ">=",
                  relativeTo: {
                    "@id": "http://endhealth.info/im#effectiveDate",
                    nodeRef: "highBPReading",
                    name: "effective date"
                  },
                  description: "after <span class='node-ref'>highBPReading</span> "
                }
              ],
              name: "Observation",
              description: "Observation"
            },
            name: "observation"
          }
        ]
      } as Match);

      expect(display).toEqual("observation");
    });

    it("can get a display for a match with multiple where clauses", () => {
      const display = getDisplayFromMatch({
        path: [{
          "@id": "http://endhealth.info/im#gpCurrentRegistration",
          match: {
            "@type": "GPRegistration",
            description: "GPRegistration"
          }
        }],
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
        "gpCurrentRegistration.gpPatientType: &lt;&lt;Regular GMS patientgpCurrentRegistration.age >= 18 YEAR"
      );
    });

    it("can get a display for a match with multiple where clauses", () => {
      const display = getDisplayFromMatch({
        exclude: true,
        description: "High BP not followed by screening invite",
        path: [
          {
            "@id": "http://endhealth.info/im#observation",
            "match": {
              "@type": "Observation",
              "description": "Observation"
            }
          }
        ],
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
        "<span style='color: red;'>exclude</span> observation.concept: InvitedForScreening<span style='color: red;'>exclude</span> observation.effectiveDate >= latestBP.effectiveDate"
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

    it("can get a display for a where null", () => {
      const display = getDisplayFromWhere({
        null: true,
        "@id": "http://endhealth.info/im#endDate"
      } as Where);
      expect(display).toEqual("endDate is null");
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
      expect(display).toEqual("concept in [&lt;Prediabetes (finding), &lt;Normal pituitary function (finding)]");
    });

    it("can get a display for a where with an in list with multiple items", () => {
      const display = getDisplayFromWhere({
        notIn: [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ],
        "@id": "http://endhealth.info/im#concept"
      } as Where);
      expect(display).toEqual("concept not in [&lt;Prediabetes (finding), &lt;Normal pituitary function (finding)]");
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

    it("can get a display from a list with multiple items (less than three) with names", () => {
      const display = getDisplayFromList(
        [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true }
        ] as Node[],
        true
      );
      expect(display).toEqual(" in [&lt;Prediabetes (finding), &lt;Normal pituitary function (finding)]");
    });

    it("can get a display from a list with multiple items (more than three) with names", () => {
      const display = getDisplayFromList(
        [
          { "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true },
          { "@id": "http://snomed.info/sct#264886009", name: "Normal pituitary function (finding)", descendantsOf: true },
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
      const display = getDisplayFromPath({ "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } } as Path);
      expect(display).toEqual("observation");
    });

    it("can get a display for a nested path", () => {
      const display = getDisplayFromPath({
        "@id": "http://endhealth.info/im#observation",
        node: { "@type": "Observation", path: { "@id": "http://endhealth.info/im#patient", node: { "@type": "http://endhealth.info/im#Patient" } } }
      } as Path);
      expect(display).toEqual("observation.patient");
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

    it("can get a display for a where operator with relative to parameter", () => {
      const display = getDisplayFromOperator({
        operator: "<=",
        value: "18",
        unit: "MONTH",
        relativeTo: {
          parameter: "$referenceDate"
        },
        "@id": "http://endhealth.info/im#effectiveDate"
      } as Where);
      expect(display).toEqual("effectiveDate <= $referenceDate by 18 MONTH");
    });

    it("can get a display for a where operator with relative to parameter and value", () => {
      const display = getDisplayFromOperator({
        description: "Last 6 months",
        operator: ">=",
        value: "-6",
        unit: "MONTHS",
        relativeTo: { "@id": "http://endhealth.info/im#$referenceDate" },
        valueLabel: "last 6 months",
        "@id": "http://endhealth.info/im#effectiveDate"
      } as Where);
      expect(display).toEqual("effectiveDate >= $referenceDate by -6 MONTHS");
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

  describe("getDisplayFromOrderByList", () => {
    it("can get a display for a where range", () => {
      const display = getDisplayFromOrderByList([
        { direction: "descending", variable: "latestBP", limit: 1, "@id": "http://endhealth.info/im#effectiveDate" }
      ] as OrderLimit[]);
      expect(display).toEqual("ordered by latest latestBP.effectiveDate");
    });

    it("can get a display for a where range", () => {
      const display = getDisplayFromOrderByList([
        { direction: "descending", variable: "latestBP", "@id": "http://endhealth.info/im#effectiveDate" }
      ] as OrderLimit[]);
      expect(display).toEqual("ordered by descending latestBP.effectiveDate");
    });
  });

  describe("getDisplayFromOrderBy", () => {
    it("can get a display for a latest", () => {
      const display = getDisplayFromOrderBy({
        direction: "descending",
        variable: "latestBP",
        limit: 1,
        "@id": "http://endhealth.info/im#effectiveDate"
      } as OrderLimit);
      expect(display).toEqual("latest latestBP.effectiveDate");
    });

    it("can get a display for a earliest", () => {
      const display = getDisplayFromOrderBy({
        direction: "ascending",
        variable: "latestBP",
        limit: 1,
        "@id": "http://endhealth.info/im#effectiveDate"
      } as OrderLimit);
      expect(display).toEqual("earliest latestBP.effectiveDate");
    });

    it("can get a display for an order by", () => {
      const display = getDisplayFromOrderBy({
        direction: "descending",
        variable: "latestBP",
        "@id": "http://endhealth.info/im#effectiveDate"
      } as OrderLimit);
      expect(display).toEqual("descending latestBP.effectiveDate");
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
