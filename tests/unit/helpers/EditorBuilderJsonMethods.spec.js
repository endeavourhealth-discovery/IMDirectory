import { ComponentType, EditorMode } from "@/enums";
import { addItem, addNextOptions, generateNewComponent, genNextOptions, updateItem, updatePositions } from "@/helpers/EditorBuilderJsonMethods";
import { fakerFactory } from "@/mocks/fakerFactory";
import { describe, it, expect } from "vitest";

describe("EditorBuilderJsonMethods", () => {
  describe("generateNewComponent", () => {
    it("generates a component", () => {
      const shape = fakerFactory.propertyShape.create();
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
    it("generates next options", () => {
      const shape = fakerFactory.propertyShape.create();
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
    it("updates positions", () => {
      const component = fakerFactory.componentDetails.create({ position: 4 });
      expect(component.position).toEqual(4);
      const component2 = fakerFactory.componentDetails.create({ position: 6 });
      expect(component2.position).toBe(6);
      const build = [component, component2];
      updatePositions(build);
      expect(component.position).toEqual(0);
      expect(component2.position).toEqual(1);
    });
  });

  describe("updateItem", () => {
    it("updatesItem", () => {
      const component = fakerFactory.componentDetails.create({ position: 2 });
      const build = [
        fakerFactory.componentDetails.create({ position: 0 }),
        fakerFactory.componentDetails.create({ position: 1 }),
        fakerFactory.componentDetails.create({ position: 2 })
      ];
      expect(build[2]).not.toEqual(component);
      updateItem(component, build);
      expect(build[2]).toEqual(component);
    });
  });

  describe("addNextOptions", () => {
    it("addsNextOptions ___ not last not addNext", () => {
      const build = [
        fakerFactory.componentDetails.create({ type: ComponentType.ENTITY_SEARCH, position: 0 }),
        fakerFactory.componentDetails.create({ type: ComponentType.ARRAY_BUILDER, position: 1 })
      ];
      const shape = fakerFactory.propertyShape.create();
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

    it("addsNextOptions ___ not last is addNext", () => {
      const build = [
        fakerFactory.componentDetails.create({ type: ComponentType.ENTITY_SEARCH, position: 0 }),
        fakerFactory.componentDetails.create({ type: ComponentType.ADD_NEXT, position: 1 })
      ];
      const shape = fakerFactory.propertyShape.create();
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
    it("addsItem", () => {
      const itemToAdd = { selectedType: ComponentType.ENTITY_MULTI_SEARCH, position: 1, value: { id: "itemToAddId" } };
      const build = [fakerFactory.componentDetails.create({ position: 0 }), fakerFactory.componentDetails.create({ position: 1 })];
      const shape = fakerFactory.propertyShape.create();
      addItem(itemToAdd, build, { minus: true, plus: true, up: true, down: true }, shape, EditorMode.EDIT, false);
      expect(build.length).toBe(3);
      expect(build[1].value.id).toEqual(itemToAdd.value.id);
    });
  });
});
