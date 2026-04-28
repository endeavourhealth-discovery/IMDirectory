import { COMPONENT } from "vue-library/enums";
import type { PropertyShape } from "vue-library/interfaces";

import { describe, expect, it } from "vitest";

import { ComponentType } from "@/enums";
import { getTreeQueryIri, processArguments, processComponentType } from "@/helpers/EditorMethods";
import * as fakerFactory from "@/mocks/fakerFactory";

describe("EditorMethods", () => {
  describe("processArguments", () => {
    it("processes arguments", async () => {
      const argument1 = await fakerFactory.argumentRandom();
      const argument2 = await fakerFactory.argumentRandom();
      const argument3 = await fakerFactory.argumentRandom();
      // const shape = fakerFactory.propertyShape.create({ argument: [argument1, argument2, argument3], builderChild: true, order: 2 });
      const propertyShape: PropertyShape = {
        order: 2,
        componentType: { iri: "componentType" },
        path: { iri: "path" },
        builderChild: true,
        argument: [argument1, argument2, argument3]
      };
      const valueVariableMap = new Map().set("testVariable", { id: "testId" }).set("testVariableWithOrder2", { id: "testOrderId" });
      const results = processArguments(propertyShape, valueVariableMap);
      expect(results[0]).toEqual(expect.objectContaining({ valueIri: argument1.valueIri }));
      expect(results[0]).toEqual(expect.objectContaining({ valueData: argument1.valueData }));
      expect(results[1]).toEqual(expect.objectContaining({ valueVariable: null }));
      expect(results[1]).toEqual(expect.objectContaining({ valueData: argument2.valueData }));
      expect(results[2]).toEqual(expect.objectContaining({ valueIri: argument3.valueIri }));
      expect(results[2]).toEqual(expect.objectContaining({ valueData: argument3.valueData }));
    });
  });

  describe("getTreeQueryIri", () => {
    it("handles empty select", () => {
      expect(getTreeQueryIri([])).toBe(undefined);
    });

    it("handles length < 2", async () => {
      expect(getTreeQueryIri([await fakerFactory.iriRefRandom()])).toBe(undefined);
    });

    it("returns position 1 id", async () => {
      const iri1 = await fakerFactory.iriRefRandom();
      const iri2 = await fakerFactory.iriRefRandom();
      const iri3 = await fakerFactory.iriRefRandom();
      expect(getTreeQueryIri([iri1, iri2, iri3])).toBe(iri2.iri);
    });
  });

  describe("processComponentType", () => {
    it("processes component type ___ invalid not component", async () => {
      const testIri = await fakerFactory.iriRefRandom();
      expect(() => processComponentType(testIri)).toThrowError("Iri is not of type ComponentType: " + testIri.iri);
    });

    it("processes component type ___ invalid component", () => {
      const testIri = { iri: "http://endhealth.info/im#Component_TestError" };
      expect(() => processComponentType(testIri)).toThrowError("Invalid component type encountered while processing component types: " + testIri.iri);
    });

    it("process component type __ valid", () => {
      expect(processComponentType({ iri: COMPONENT.TEXT_DISPLAY })).toBe(ComponentType.TEXT_DISPLAY);
      expect(processComponentType({ iri: COMPONENT.TEXT_INPUT })).toBe(ComponentType.TEXT_INPUT);
      expect(processComponentType({ iri: COMPONENT.HTML_INPUT })).toBe(ComponentType.HTML_INPUT);
      expect(processComponentType({ iri: COMPONENT.ARRAY_BUILDER })).toBe(ComponentType.ARRAY_BUILDER);
      expect(processComponentType({ iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER })).toBe(ComponentType.AUTOCOMPLETE_SEARCH_BAR_WRAPPER);
      expect(processComponentType({ iri: COMPONENT.ENTITY_COMBOBOX })).toBe(ComponentType.ENTITY_COMBOBOX);
      expect(processComponentType({ iri: COMPONENT.ENTITY_DROPDOWN })).toBe(ComponentType.ENTITY_DROPDOWN);
      expect(processComponentType({ iri: COMPONENT.ENTITY_AUTO_COMPLETE })).toBe(ComponentType.ENTITY_AUTO_COMPLETE);
      expect(processComponentType({ iri: COMPONENT.COMPONENT_GROUP })).toBe(ComponentType.COMPONENT_GROUP);
      expect(processComponentType({ iri: COMPONENT.MEMBERS_BUILDER })).toBe(ComponentType.MEMBERS_BUILDER);
      expect(processComponentType({ iri: COMPONENT.SET_DEFINITION_BUILDER })).toBe(ComponentType.SET_DEFINITION_BUILDER);
      expect(processComponentType({ iri: COMPONENT.QUERY_DEFINITION_BUILDER })).toBe(ComponentType.QUERY_DEFINITION_BUILDER);
      expect(processComponentType({ iri: COMPONENT.PROPERTY_BUILDER })).toBe(ComponentType.PROPERTY_BUILDER);
      expect(processComponentType({ iri: COMPONENT.TOGGLEABLE })).toBe(ComponentType.TOGGLEABLE_COMPONENT);
      expect(processComponentType({ iri: COMPONENT.HORIZONTAL_LAYOUT })).toBe(ComponentType.HORIZONTAL_LAYOUT);
      expect(processComponentType({ iri: COMPONENT.VERTICAL_LAYOUT })).toBe(ComponentType.VERTICAL_LAYOUT);
      expect(processComponentType({ iri: COMPONENT.DROPDOWN_TEXT_INPUT_CONCATENATOR })).toBe(ComponentType.DROPDOWN_TEXT_INPUT_CONCATENATOR);
    });
  });
});
