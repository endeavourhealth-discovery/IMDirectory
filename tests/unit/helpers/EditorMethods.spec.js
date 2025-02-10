import { ComponentType } from "@/enums";
import { getTreeQueryIri, processArguments, processComponentType } from "@/helpers/EditorMethods";
import { fakerFactory } from "@/mocks/fakerFactory";
import { IM, COMPONENT } from "@/vocabulary";

describe("EditorMethods", () => {
  describe("processArguments", () => {
    it("processes arguments", () => {
      const argument1 = fakerFactory.argument.create({ valueVariable: "testVariable", valueDataList: [] });
      const argument2 = fakerFactory.argument.create({ valueVariable: "altVariable", valueDataList: [] });
      const argument3 = fakerFactory.argument.create({ valueVariable: "testVariableWithOrder", valueDataList: [] });
      const shape = fakerFactory.propertyShape.create({ argument: [argument1, argument2, argument3], builderChild: true, order: 2 });
      const valueVariableMap = new Map().set("testVariable", { id: "testId" }).set("testVariableWithOrder2", { id: "testOrderId" });
      const results = processArguments(shape, valueVariableMap);
      expect(results[0]).toEqual(expect.objectContaining({ valueObject: { id: "testId" } }));
      expect(results[0]).toEqual(expect.objectContaining({ valueData: argument1.valueData }));
      expect(results[1]).toEqual(expect.objectContaining({ valueVariable: null }));
      expect(results[1]).toEqual(expect.objectContaining({ valueData: argument2.valueData }));
      expect(results[2]).toEqual(expect.objectContaining({ valueObject: { id: "testOrderId" } }));
      expect(results[2]).toEqual(expect.objectContaining({ valueData: argument3.valueData }));
    });
  });

  describe("getTreeQueryIri", () => {
    it("handles empty select", () => {
      expect(getTreeQueryIri([])).toBe(undefined);
    });

    it("handles length < 2", () => {
      expect(getTreeQueryIri([fakerFactory.iriRef.create()])).toBe(undefined);
    });

    it("returns position 1 id", () => {
      const iri1 = fakerFactory.iriRef.create();
      const iri2 = fakerFactory.iriRef.create();
      const iri3 = fakerFactory.iriRef.create();
      expect(getTreeQueryIri([iri1, iri2, iri3])).toBe(iri2["@id"]);
    });
  });

  describe("processComponentType", () => {
    it("processes component type ___ invalid not component", () => {
      const testIri = fakerFactory.iriRef.create();
      expect(() => processComponentType(testIri)).toThrowError("Iri is not of type ComponentType: " + testIri["@id"]);
    });

    it("processes component type ___ invalid component", () => {
      const testIri = { "@id": "http://endhealth.info/im#Component_TestError" };
      expect(() => processComponentType(testIri)).toThrowError("Invalid component type encountered while processing component types: " + testIri["@id"]);
    });

    it("process component type __ valid", () => {
      expect(processComponentType({ "@id": COMPONENT.TEXT_DISPLAY })).toBe(ComponentType.TEXT_DISPLAY);
      expect(processComponentType({ "@id": COMPONENT.TEXT_INPUT })).toBe(ComponentType.TEXT_INPUT);
      expect(processComponentType({ "@id": COMPONENT.HTML_INPUT })).toBe(ComponentType.HTML_INPUT);
      expect(processComponentType({ "@id": COMPONENT.ARRAY_BUILDER })).toBe(ComponentType.ARRAY_BUILDER);
      expect(processComponentType({ "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER })).toBe(ComponentType.AUTOCOMPLETE_SEARCH_BAR_WRAPPER);
      expect(processComponentType({ "@id": COMPONENT.ENTITY_COMBOBOX })).toBe(ComponentType.ENTITY_COMBOBOX);
      expect(processComponentType({ "@id": COMPONENT.ENTITY_DROPDOWN })).toBe(ComponentType.ENTITY_DROPDOWN);
      expect(processComponentType({ "@id": COMPONENT.ENTITY_AUTO_COMPLETE })).toBe(ComponentType.ENTITY_AUTO_COMPLETE);
      expect(processComponentType({ "@id": COMPONENT.COMPONENT_GROUP })).toBe(ComponentType.COMPONENT_GROUP);
      expect(processComponentType({ "@id": COMPONENT.MEMBERS_BUILDER })).toBe(ComponentType.MEMBERS_BUILDER);
      expect(processComponentType({ "@id": COMPONENT.SET_DEFINITION_BUILDER })).toBe(ComponentType.SET_DEFINITION_BUILDER);
      expect(processComponentType({ "@id": COMPONENT.QUERY_DEFINITION_BUILDER })).toBe(ComponentType.QUERY_DEFINITION_BUILDER);
      expect(processComponentType({ "@id": COMPONENT.PROPERTY_BUILDER })).toBe(ComponentType.PROPERTY_BUILDER);
      expect(processComponentType({ "@id": COMPONENT.TOGGLEABLE })).toBe(ComponentType.TOGGLEABLE_COMPONENT);
      expect(processComponentType({ "@id": COMPONENT.HORIZONTAL_LAYOUT })).toBe(ComponentType.HORIZONTAL_LAYOUT);
      expect(processComponentType({ "@id": COMPONENT.VERTICAL_LAYOUT })).toBe(ComponentType.VERTICAL_LAYOUT);
      expect(processComponentType({ "@id": COMPONENT.DROPDOWN_TEXT_INPUT_CONCATENATOR })).toBe(ComponentType.DROPDOWN_TEXT_INPUT_CONCATENATOR);
    });
  });
});
