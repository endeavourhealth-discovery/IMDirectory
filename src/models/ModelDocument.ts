import z from "zod";

import { ConceptSetSchema } from "./ConceptSet";
import { EntitySchema } from "./Entity";
import { MapFunctionSchema } from "./MapFunction";
import { QueryEntitySchema } from "./QueryEntity";
import { TTContextSchema } from "./TTContext";

// export interface ModelDocument {
//   context?: TTContext;
//   query?: QueryEntity[];
//   folder?: Entity[];
//   conceptSet?: ConceptSet[];
//   function?: MapFunction[];
// }

export const ModelDocumentSchema = z.strictObject({
  context: TTContextSchema.optional(),
  query: z.array(z.lazy(() => QueryEntitySchema)).optional(),
  folder: z.array(EntitySchema).optional(),
  conceptSet: z.array(ConceptSetSchema).optional(),
  function: z.array(MapFunctionSchema).optional()
});

export type ModelDocument = z.output<typeof ModelDocumentSchema>;

export function isModelDocument(value: unknown): value is ModelDocument {
  return ModelDocumentSchema.safeParse(value).success;
}
