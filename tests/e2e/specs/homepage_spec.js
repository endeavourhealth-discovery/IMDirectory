describe("The Home Page", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8080/api/config/public/xmlSchemaDataTypes", {
      statusCode: 200,
      body: [
        "http://www.w3.org/2001/XMLSchema#string",
        "http://www.w3.org/2001/XMLSchema#boolean",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double",
        "http://www.w3.org/2001/XMLSchema#decimal",
        "http://www.w3.org/2001/XMLSchema#dateTime",
        "http://www.w3.org/2001/XMLSchema#duration",
        "http://www.w3.org/2001/XMLSchema#hexBinary",
        "http://www.w3.org/2001/XMLSchema#base64Binary",
        "http://www.w3.org/2001/XMLSchema#anyURI",
        "http://www.w3.org/2001/XMLSchema#ID",
        "http://www.w3.org/2001/XMLSchema#IDREF",
        "http://www.w3.org/2001/XMLSchema#ENTITY",
        "http://www.w3.org/2001/XMLSchema#NOTATION",
        "http://www.w3.org/2001/XMLSchema#normalizedString",
        "http://www.w3.org/2001/XMLSchema#token",
        "http://www.w3.org/2001/XMLSchema#language",
        "http://www.w3.org/2001/XMLSchema#IDREFS",
        "http://www.w3.org/2001/XMLSchema#ENTITIES",
        "http://www.w3.org/2001/XMLSchema#NMTOKEN",
        "http://www.w3.org/2001/XMLSchema#NMTOKENS",
        "http://www.w3.org/2001/XMLSchema#Name",
        "http://www.w3.org/2001/XMLSchema#QName",
        "http://www.w3.org/2001/XMLSchema#NCName",
        "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
        "http://www.w3.org/2001/XMLSchema#positiveInteger",
        "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
        "http://www.w3.org/2001/XMLSchema#negativeInteger",
        "http://www.w3.org/2001/XMLSchema#byte",
        "http://www.w3.org/2001/XMLSchema#int",
        "http://www.w3.org/2001/XMLSchema#long",
        "http://www.w3.org/2001/XMLSchema#short",
        "http://www.w3.org/2001/XMLSchema#unsignedByte",
        "http://www.w3.org/2001/XMLSchema#unsignedInt",
        "http://www.w3.org/2001/XMLSchema#unsignedLong",
        "http://www.w3.org/2001/XMLSchema#unsignedShort",
        "http://www.w3.org/2001/XMLSchema#date",
        "http://www.w3.org/2001/XMLSchema#time",
        "http://www.w3.org/2001/XMLSchema#gYearMonth",
        "http://www.w3.org/2001/XMLSchema#gYear",
        "http://www.w3.org/2001/XMLSchema#gMonthDay",
        "http://www.w3.org/2001/XMLSchema#gDay",
        "http://www.w3.org/2001/XMLSchema#gMonth"
      ]
    });
    cy.intercept("GET", "http://localhost:8080/api/config/public/filterDefaults", {
      statusCode: 200,
      body: {
        schemeOptions: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
        statusOptions: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
        typeOptions: [
          "http://endhealth.info/im#Concept",
          "http://endhealth.info/im#ValueSet",
          "http://endhealth.info/im#ConceptSet",
          "http://endhealth.info/im#DataModelEntity",
          "http://endhealth.info/im#dataModelProperty",
          "http://endhealth.info/im#Query"
        ]
      }
    });
    cy.visit("/");
  });

  it("successfully loads", () => {
    cy.url().should("include", "/snomedLicense");
  });

  it("redirects to snomed when rejects agreement", () => {
    cy.contains("Decline").click();
    cy.url().should("include", "www.snomed.org");
  });

  it("loads dashboard when accepts agreement", () => {
    cy.get(".p-button-label")
      .contains("Agree")
      .click();
    cy.url().should("eq", "/");
  });
});
