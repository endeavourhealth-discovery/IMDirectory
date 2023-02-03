export default {
  ecl: {
    orGroupMinusOrGroup:
      "/* or group minus or group*/ (<<386725007 | Body temperature (observable entity) |   OR <<431314004 | Peripheral oxygen saturation (observable entity) |) MINUS (<<838441000000103 | Target body mass index (observable entity) |  OR <<838451000000100 | Target body mass index  | ) ",
    allergyToPenicillinsOrCephasporinsWithCausativeLactams:
      "/*allergy to penicillins or cephasporins with causative lactams*/	(<<91936005 | Allergy to Penicillin| or <<294532003):  << 246075003 |Causative agent (attribute)| = <<771577000| lactam (substance)|",
    oralNsaids: "/*oral nsaids*/<<763158003:<<127489000= <<372665008,<<411116001= 385268001",
    simpleAndDescendants: "/*simple and descendants*/	<298705000 and <301366005 |Pain of truncal structure (finding)|",
    simpleAndShouldBe0: "/*simple and should be 0*/	298705000 and 301366005 |Pain of truncal structure (finding)|"
  },
  query: {
    orGroupMinusOrGroup: {
      from: {
        bool: "and",
        from: [
          {
            bool: "or",
            from: [
              {
                "@id": "http://snomed.info/sct#386725007",
                includeSubtypes: true,
                excludeSelf: false
              },
              {
                "@id": "http://snomed.info/sct#431314004",
                includeSubtypes: true,
                excludeSelf: false
              }
            ]
          },
          {
            bool: "not",
            from: [
              {
                bool: "or",
                from: [
                  {
                    "@id": "http://snomed.info/sct#838441000000103",
                    includeSubtypes: true,
                    excludeSelf: false
                  },
                  {
                    "@id": "http://snomed.info/sct#838451000000100",
                    includeSubtypes: true,
                    excludeSelf: false
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    allergyToPenicillinsOrCephasporinsWithCausativeLactams: {
      from: {
        bool: "or",
        from: [
          {
            "@id": "http://snomed.info/sct#91936005",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#294532003",
            includeSubtypes: true,
            excludeSelf: false
          }
        ],
        where: {
          "@id": "http://snomed.info/sct#246075003",
          in: [
            {
              "@id": "http://snomed.info/sct#771577000",
              includeSubtypes: true,
              excludeSelf: false
            }
          ],
          anyRoleGroup: true,
          includeSubtypes: true
        }
      }
    },
    oralNsaids: {
      from: {
        "@id": "http://snomed.info/sct#763158003",
        includeSubtypes: true,
        excludeSelf: false,
        where: {
          bool: "and",
          where: [
            {
              "@id": "http://snomed.info/sct#127489000",
              in: [
                {
                  "@id": "http://snomed.info/sct#372665008",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            },
            {
              "@id": "http://snomed.info/sct#411116001",
              in: [
                {
                  "@id": "http://snomed.info/sct#385268001"
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            }
          ]
        }
      }
    },
    simpleAndDescendants: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: true
          }
        ]
      }
    },
    simpleAndShouldBe0: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000"
          },
          {
            "@id": "http://snomed.info/sct#301366005"
          }
        ]
      }
    }
  }
};
