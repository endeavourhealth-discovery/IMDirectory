import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupConcept, setupConfig, setupTerms, loadMore, getInferred } from "../../../../src/components/home/InfoSideBarMethods";
import testData from "./InfoSideBar.testData";
import { EntityService, ConfigService } from "@/im_library/services";
import { ref } from "vue";
import { flushPromises } from "@vue/test-utils";
import { fakerFactory } from "../../../../src/mocks/factory";

describe("getConcept", () => {
  let getPartialEntitySpy;
  let getPagedChildrenSpy;
  let getEntityTermCodesSpy;
  const configs = ref([
    { label: "Summary", predicate: "None", type: "TextSectionHeader", size: "100%", order: 100 },
    { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "100%", order: 101 },
    { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "100%", order: 102 },
    { label: "Code", predicate: "http://endhealth.info/im#code", type: "TextWithLabel", size: "100%", order: 103 },
    { label: "Status", predicate: "http://endhealth.info/im#status", type: "ArrayObjectNameTagWithLabel", size: "100%", order: 103 },
    { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "100%", order: 104 },
    { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 105 },
    { label: "Definition", predicate: "http://endhealth.info/im#definition", type: "TextDefinition", size: "100%", order: 201 },
    { label: "Has sub types", predicate: "subtypes", type: "ArrayObjectNameListboxWithLabel", size: "100%", order: 202 },
    { label: "Is child of", predicate: "http://endhealth.info/im#isChildOf", type: "ArrayObjectNameListboxWithLabel", size: "100%", order: 203 },
    { label: "Has children", predicate: "http://endhealth.info/im#hasChildren", type: "ArrayObjectNameListboxWithLabel", size: "100%", order: 204 },
    { label: "DefinitionTermsDivider", predicate: "None", type: "SectionDivider", size: "100%", order: 300 },
    { label: "Terms", predicate: "termCodes", type: "TermsTable", size: "100%", order: 301 }
  ]);
  beforeEach(() => {
    vi.resetAllMocks();
    getPartialEntitySpy = vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue(testData.ENTITY);
    getPagedChildrenSpy = vi.spyOn(EntityService.prototype, "getPagedChildren").mockResolvedValue(testData.CHILDREN);
    getEntityTermCodesSpy = vi.spyOn(EntityService.prototype, "getEntityTermCodes").mockResolvedValue([]);
  });

  it("can getConcept", async () => {
    const { concept, getConcept } = setupConcept();
    await getConcept(testData.ENTITY["@id"], configs);
    await flushPromises();
    expect(concept.value).toEqual(
      expect.objectContaining({
        "@id": testData.ENTITY["@id"],
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": testData.ENTITY["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
        "http://www.w3.org/2000/01/rdf-schema#label": testData.ENTITY["http://www.w3.org/2000/01/rdf-schema#label"],
        "http://endhealth.info/im#status": testData.ENTITY["http://endhealth.info/im#status"],
        "http://endhealth.info/im#code": testData.ENTITY["http://endhealth.info/im#code"],
        subtypes: {
          children: expect.arrayContaining([{ "@id": testData.CHILDREN.result[0]["@id"], name: testData.CHILDREN.result[0].name }]),
          totalCount: testData.CHILDREN.totalCount,
          loadMore: expect.anything()
        },
        termCodes: []
      })
    );
  });
});

describe("getConfig", () => {
  let getComponentLayout;
  beforeEach(() => {
    vi.resetAllMocks();
    getComponentLayout = vi.spyOn(ConfigService.prototype, "getComponentLayout").mockResolvedValueOnce(testData.DEFINITION).mockResolvedValue(testData.SUMMARY);
  });

  it("can getConfig, combined and sorted by order", async () => {
    const { configs, getConfig } = setupConfig();
    await getConfig();
    await flushPromises();
    expect(configs.value).toEqual([
      { label: "Summary", predicate: "None", type: "TextSectionHeader", size: "100%", order: 100 },
      { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "100%", order: 101 },
      { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "100%", order: 102 },
      { label: "Code", predicate: "http://endhealth.info/im#code", type: "TextWithLabel", size: "100%", order: 103 },
      { label: "Status", predicate: "http://endhealth.info/im#status", type: "ArrayObjectNameTagWithLabel", size: "100%", order: 103 },
      { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "100%", order: 104 },
      { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 105 },
      { label: "Definition", predicate: "http://endhealth.info/im#definition", type: "TextDefinition", size: "100%", order: 201 },
      { label: "Has sub types", predicate: "subtypes", type: "ArrayObjectNameListboxWithLabel", size: "100%", order: 202 },
      { label: "Is child of", predicate: "http://endhealth.info/im#isChildOf", type: "ArrayObjectNameListboxWithLabel", size: "100%", order: 203 },
      { label: "Has children", predicate: "http://endhealth.info/im#hasChildren", type: "ArrayObjectNameListboxWithLabel", size: "100%", order: 204 },
      { label: "DefinitionTermsDivider", predicate: "None", type: "SectionDivider", size: "100%", order: 300 },
      { label: "Terms", predicate: "termCodes", type: "TermsTable", size: "100%", order: 301 }
    ]);
  });
});

describe("loadMore", () => {
  let getPagedChildrenSpy;
  let fakerChildren = [
    fakerFactory.entitySummary.create(),
    fakerFactory.entitySummary.create(),
    fakerFactory.entitySummary.create(),
    fakerFactory.entitySummary.create()
  ];
  beforeEach(() => {
    vi.resetAllMocks();
    getPagedChildrenSpy = vi.spyOn(EntityService.prototype, "getPagedChildren");
  });

  it("does nothing if loadButton false", async () => {
    const { children, totalCount, nextPage, pageSize, loadButton, iri } = await loadMore(fakerChildren, 200, 1, 4, false, testData.ENTITY["@id"]);
    await flushPromises();
    expect(getPagedChildrenSpy).not.toHaveBeenCalled();
    expect(loadButton).toBe(false);
  });

  it("adds children and keeps loadMore true ___ children < totalCount", async () => {
    getPagedChildrenSpy.mockResolvedValue({
      totalCount: 200,
      result: [
        fakerFactory.entitySummary.create(),
        fakerFactory.entitySummary.create(),
        fakerFactory.entitySummary.create(),
        fakerFactory.entitySummary.create()
      ]
    });
    const { children, totalCount, nextPage, pageSize, loadButton, iri } = await loadMore(fakerChildren, 200, 1, 4, true, testData.ENTITY["@id"]);
    await flushPromises();
    expect(getPagedChildrenSpy).toHaveBeenCalled();
    expect(children.length).toBe(8);
    expect(loadButton).toBe(true);
    expect(totalCount).toBe(200);
    expect(nextPage).toBe(2);
    expect(pageSize).toBe(4);
  });

  it("adds children and sets loadMore false ___ children > totalCount", async () => {
    getPagedChildrenSpy.mockResolvedValue({
      totalCount: 6,
      result: [fakerFactory.entitySummary.create(), fakerFactory.entitySummary.create()]
    });
    const { children, totalCount, nextPage, pageSize, loadButton, iri } = await loadMore(fakerChildren, 6, 2, 4, true, testData.ENTITY["@id"]);
    await flushPromises();
    expect(getPagedChildrenSpy).toHaveBeenCalled();
    expect(children.length).toBe(6);
    expect(loadButton).toBe(false);
    expect(totalCount).toBe(6);
    expect(nextPage).toBe(2);
    expect(pageSize).toBe(4);
  });
});

describe("getInferred", () => {
  let getDefinitionBundle;
  beforeEach(() => {
    vi.resetAllMocks();
    getDefinitionBundle = vi.spyOn(EntityService.prototype, "getDefinitionBundle").mockResolvedValue({ ...testData.INFERRED_BUNDLE });
  });

  it("adds inferred to concept as entity subclassOf and removed roleGroup key from entity", async () => {
    let concept = ref({});
    await getInferred(testData.ENTITY["@id"], concept);
    await flushPromises();
    expect(concept.value).toEqual(
      expect.objectContaining({
        inferred: expect.objectContaining({
          entity: expect.objectContaining({
            "http://www.w3.org/2000/01/rdf-schema#subClassOf": expect.arrayContaining([
              expect.objectContaining({
                "http://endhealth.info/im#roleGroup": expect.anything()
              })
            ])
          })
        })
      })
    );
  });
});
