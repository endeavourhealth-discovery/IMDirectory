import { ArrayButtonsSchema, type PropertyShape, PropertyShapeSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { ComponentType, EditorMode } from "../enums";

// export interface ComponentDetails {
//   id: string;
//   value: any;
//   position: number;
//   type: ComponentType;
//   json: any;
//   showButtons?: { minus: boolean; plus: boolean; up: boolean; down: boolean };
//   shape: PropertyShape;
//   mode: EditorMode;
// }

export const ComponentDetailsSchema = z.object({
  id: z.string(),
  value: z.any(),
  position: z.number(),
  type: z.enum(ComponentType),
  json: z.any(),
  showButtons: ArrayButtonsSchema.optional(),
  get shape() {
    return PropertyShapeSchema.optional();
  },
  mode: z.enum(EditorMode)
});

export type ComponentDetails = z.output<typeof ComponentDetailsSchema>;
