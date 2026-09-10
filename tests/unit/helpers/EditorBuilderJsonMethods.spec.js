import { describe, expect, it } from "vitest";

import { ComponentType, EditorMode } from "@/enums";
import { addItem, addNextOptions, genNextOptions, generateNewComponent, updateItem, updatePositions } from "@/helpers/EditorBuilderJsonMethods";
import * as fakerFactory from "@/mocks/fakerFactory";

describe("EditorBuilderJsonMethods", () => {
  describe("generateNewComponent", () => {
    it("generates a component", async () => {
      const shape = await fakerFactory.propertyShapeRandom();
      expect(
        generateNewComponent(ComponentType.ENTITY_DROPDOWN, 1, {}, shape, { minus: true, plus: true, up: true, down: true }, EditorMode.CREATE, false)
      ).toEqual({
        shape: shape,
        id: "EntityDropdown_1",
        json: {},
        mode: "create",
        position: 1,
        showButtons: {
          down: true,
          minus: true,
          plus: true,
          up: true
        },
        type: "EntityDropdown",
        value: {}
      });
    });
  });

  describe("genNextOptions", () => {
    it("generates next options", async () => {
      const shape = await fakerFactory.propertyShapeRandom();
      expect(genNextOptions(1, ComponentType.ENTITY_AUTO_COMPLETE, shape, EditorMode.EDIT)).toEqual({
        id: "addNext_2",
        json: {},
        mode: "edit",
        position: 2,
        shape: shape,
        type: "AddNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "EntityAutoComplete",
          previousPosition: 1
        }
      });
    });
  });

  describe("updatePositions", () => {
    it("updates positions", async () => {
      const component = await fakerFactory.componentDetailsRandom();
      component.position = 4;
      expect(component.position).toEqual(4);
      const component2 = await fakerFactory.componentDetailsRandom();
      component2.position = 6;
      expect(component2.position).toBe(6);
      const build = [component, component2];
      updatePositions(build);
      expect(component.position).toEqual(0);
      expect(component2.position).toEqual(1);
    });
  });

  describe("updateItem", () => {
    it("updatesItem", async () => {
      const component = await fakerFactory.componentDetailsRandom();
      component.position = 2;
      const build = [await fakerFactory.componentDetailsRandom(), await fakerFactory.componentDetailsRandom(), await fakerFactory.componentDetailsRandom()];
      build[0].position = 0;
      build[1].position = 1;
      build[2].position = 2;
      expect(build[2]).not.toEqual(component);
      updateItem(component, build);
      expect(build[2]).toEqual(component);
    });
  });

  describe("addNextOptions", () => {
    it("addsNextOptions ___ not last not addNext", async () => {
      const build = [await fakerFactory.componentDetailsRandom(), await fakerFactory.componentDetailsRandom()];
      build[0].position = 0;
      build[0].type = ComponentType.ENTITY_SEARCH;
      build[1].position = 1;
      build[1].type = ComponentType.ARRAY_BUILDER;
      const shape = await fakerFactory.propertyShapeRandom();
      const result = addNextOptions(
        { previousComponentType: ComponentType.ENTITY_AUTO_COMPLETE, previousPosition: 0, selectedOption: ComponentType.ENTITY_COMBOBOX },
        build,
        shape,
        EditorMode.CREATE
      );
      expect(result).toEqual({
        id: "addNext_1",
        json: {},
        mode: "create",
        position: 1,
        shape: shape,
        type: "AddNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "EntityAutoComplete",
          previousPosition: 0
        }
      });
      expect(build.length).toBe(3);
      expect(build[1]).toEqual(result);
    });

    it("addsNextOptions ___ not last is addNext", async () => {
      const build = [await fakerFactory.componentDetailsRandom(), await fakerFactory.componentDetailsRandom()];
      build[0].type = ComponentType.ENTITY_SEARCH;
      build[0].position = 0;
      build[1].type = ComponentType.ADD_NEXT;
      build[1].position = 1;
      const shape = await fakerFactory.propertyShapeRandom();
      const result = addNextOptions(
        { previousComponentType: ComponentType.ENTITY_AUTO_COMPLETE, previousPosition: 0, selectedOption: ComponentType.ENTITY_COMBOBOX },
        build,
        shape,
        EditorMode.CREATE
      );
      expect(result).toEqual({
        id: "addNext_1",
        json: {},
        mode: "create",
        position: 1,
        shape: shape,
        type: "AddNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "EntityAutoComplete",
          previousPosition: 0
        }
      });
      expect(build.length).toBe(2);
      expect(build[1]).toEqual(result);
    });
  });

  describe("addItem", () => {
    it("addsItem", async () => {
      const itemToAdd = { selectedType: ComponentType.ENTITY_MULTI_SEARCH, position: 1, value: { id: "itemToAddId" } };
      const build = [await fakerFactory.componentDetailsRandom(), fakerFactory.componentDetailsRandom()];
      build[0].position = 0;
      build[1].position = 1;
      const shape = await fakerFactory.propertyShapeRandom();
      addItem(itemToAdd, build, { minus: true, plus: true, up: true, down: true }, shape, EditorMode.EDIT, false);
      console.log("here");
      expect(build.length).toBe(3);
      expect(build[1].value.id).toEqual(itemToAdd.value.id);
    });
  });
});
