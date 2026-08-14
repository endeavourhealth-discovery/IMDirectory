import {
  type GenericObject,
  GenericObjectSchema,
  type SearchResultSummary,
  SearchResultSummarySchema,
  type TTIriRef,
  TTIriRefSchema
} from "@endeavour/vue-library/models";

import z from "zod";

// export interface TreeNode extends GenericObject {
//   key: string;
//   label: string;
//   iri: string;
//   conceptTypes: TTIriRef[];
//   type: string;
//   icon: string[];
//   children?: TreeNode[];
//   selectable: boolean;
//   leaf: boolean;
//   data: SearchResultSummary;
//   parent?: TreeNode;
//   hasVariable: string;
// }

export const TreeNodeSchema = GenericObjectSchema.extend({
  key: z.string(),
  label: z.string(),
  iri: z.url(),
  conceptTypes: z.array(TTIriRefSchema),
  type: z.string(),
  icon: z.array(z.string()),
  get children() {
    return z.array(TreeNodeSchema).optional();
  },
  selectable: z.boolean(),
  leaf: z.boolean(),
  data: SearchResultSummarySchema,
  get parent() {
    return TreeNodeSchema.optional();
  },
  hasVariable: z.string()
});

export type TreeNode = z.output<typeof TreeNodeSchema>;

export function isTreeNode(value: unknown): value is TreeNode {
  return TreeNodeSchema.safeParse(value).success;
}
