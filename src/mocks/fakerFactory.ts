import {
  ArgumentSchema,
  ArrayButtonsSchema,
  ExtendedEntityReferenceNodeSchema,
  GithubReleaseSchema,
  NodeShapeSchema,
  PageableEntityReferenceNodeSchema,
  ParameterShapeSchema,
  PropertyRangeSchema,
  PropertyShape,
  PropertyShapeSchema,
  SearchResultSummarySchema,
  TTEntitySchema,
  TTIriRefSchema,
  UserSchema
} from "@endeavour/vue-library";

import { faker } from "@faker-js/faker";
import { Collection } from "@msw/data";
import { output, z } from "zod";

import { ComponentType, EditorMode } from "@/enums";
import { PropertyDisplaySchema } from "@/models";
import { ComponentDetailsSchema, TangledTreeData, TangledTreeDataSchema } from "@/models";

// const entitySchema = z.object({
//   iri: z.url(),
//   get "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"() {
//     return z.array(iriRefSchema).nullable();
//   },
//   "http://www.w3.org/2000/01/rdf-schema#label": z.string().nullable()
// });

// const iriRefSchema = z.object({
//   iri: z.url(),
//   name: z.string()
// });

// const pagedChildrenSchema = z.object({
//   get result() {
//     return z.array(entitySummarySchema);
//   },
//   totalCount: z.number(),
//   pageSize: z.number(),
//   currentPage: z.number()
// });
// const entitySummarySchema = z.object({
//   iri: z.url(),
//   hasChildren: z.boolean(),
//   hasGrandChildren: z.boolean(),
//   name: z.string(),
//   orderNumber: z.number(),
//   get parents() {
//     return z.array(iriRefSchema);
//   },
//   get type() {
//     return z.array(iriRefSchema);
//   }
// });

// const conceptSummarySchema = z.object({
//   name: z.string(),
//   iri: z.url(),
//   get scheme() {
//     return z.array(iriRefSchema);
//   },
//   code: z.string(),
//   get entityType() {
//     return z.array(iriRefSchema);
//   },
//   get isDescendantOf() {
//     return z.array(iriRefSchema);
//   },
//   weighting: z.number(),
//   match: z.string(),
//   get status() {
//     return z.array(iriRefSchema);
//   }
// });
// const eclSearchSchema = z.object({
//   uuid: z.uuid(),
//   get entities() {
//     return z.array(conceptSummarySchema);
//   },
//   count: z.number(),
//   page: z.number()
// });
// const componentLayoutSchema = z.object({
//   label: z.string(),
//   predicate: z.url(),
//   type: z.string(),
//   size: z.string(),
//   order: z.number()
// });
// const githubReleaseSchema = z.object({
//   version: z.string(),
//   title: z.string(),
//   createdDate: z.date(),
//   publishedDate: z.date(),
//   releaseNotes: z.array(z.string()),
//   author: z.string(),
//   url: z.url()
// });
// const argumentSchema = z.object({
//   parameter: z.url(),
//   valueData: z.string(),
//   valueVariable: z.string(),
//   get valueIri() {
//     return iriRefSchema.optional();
//   },
//   get valueIriList() {
//     return z.array(iriRefSchema);
//   },
//   valueDataList: z.array(z.string())
// });
// const propertyShapeSchema = z.object({
//   label: z.string(),
//   comment: z.string(),
//   name: z.string(),
//   order: z.number(),
//   minCount: z.number(),
//   maxCount: z.number(),
//   get componentType() {
//     return iriRefSchema.optional();
//   },
//   get path() {
//     return iriRefSchema.optional();
//   },
//   get node() {
//     return z.array(iriRefSchema);
//   },
//   get validation() {
//     return iriRefSchema.optional();
//   },
//   get search() {
//     return iriRefSchema.optional();
//   },
//   get select() {
//     return z.array(iriRefSchema);
//   },
//   get argument() {
//     return z.array(argumentSchema).nullable();
//   },
//   get valueVariable() {
//     return iriRefSchema.optional();
//   },
//   get isIri() {
//     return iriRefSchema.optional();
//   },
//   isTextValue: z.string().nullable(),
//   isNumbericValue: z.string().nullable(),
//   forceIsValue: z.boolean(),
//   builderChild: z.boolean(),
//   get datatype() {
//     return iriRefSchema.optional();
//   },
//   get clazz() {
//     return iriRefSchema.optional();
//   },
//   validationErrorMessage: z.string(),
//   get function() {
//     return iriRefSchema.optional();
//   },
//   expression: z.any(),
//   get subProperty() {
//     return z.array(propertyShapeSchema);
//   }
// });
// type PropertyShape = output<typeof propertyShapeSchema>;
// const componentDetailsSchema = z.object({
//   id: z.string(),
//   value: z.any(),
//   position: z.number(),
//   type: z.enum(ComponentType),
//   json: z.any(),
//   showButtons: z.any().nullable(),
//   get shape() {
//     return propertyShapeSchema.optional();
//   },
//   mode: z.string()
// });
// const propertyDisplaySchema = z.object({
//   key: z.uuid(),
//   order: z.number(),
//   get group() {
//     return iriRefSchema.optional();
//   },
//   get property() {
//     return iriRefSchema.optional();
//   },
//   get type() {
//     return iriRefSchema.optional();
//   },
//   cardinality: z.string()
// });
// const tangledTreeDataSchema = z.object({
//   id: z.uuid(),
//   get parents() {
//     return z.array(tangledTreeDataSchema).nullable();
//   },
//   name: z.string(),
//   type: z.string(),
//   cardinality: z.string().nullable()
// });
// type TangledTreeData = output<typeof tangledTreeDataSchema>;
const ttEntity = new Collection({
  schema: TTEntitySchema
});
const ttIriRef = new Collection({
  schema: TTIriRefSchema
});
const pageableEntityReferenceNode = new Collection({
  schema: PageableEntityReferenceNodeSchema
});
const entityReferenceNode = new Collection({
  schema: ExtendedEntityReferenceNodeSchema
});
const searchResultSummary = new Collection({
  schema: SearchResultSummarySchema
});
const githubRelease = new Collection({
  schema: GithubReleaseSchema
});
const argument = new Collection({
  schema: ArgumentSchema
});
const arrayButtons = new Collection({
  schema: ArrayButtonsSchema
});
const propertyShape = new Collection({
  schema: PropertyShapeSchema
});
const nodeShape = new Collection({
  schema: NodeShapeSchema
});
const componentDetails = new Collection({
  schema: ComponentDetailsSchema
});
componentDetails.defineRelations(({ one }) => ({
  shape: one(propertyShape),
  showButtons: one(arrayButtons)
}));
const parameterShape = new Collection({
  schema: ParameterShapeSchema
});
const propertyRange = new Collection({
  schema: PropertyRangeSchema
});
const propertyDisplay = new Collection({
  schema: PropertyDisplaySchema
});
const tangledTreeData = new Collection({
  schema: TangledTreeDataSchema
});
tangledTreeData.defineRelations(({ many }) => ({
  parents: many(tangledTreeData)
}));
const user = new Collection({
  schema: UserSchema
});

ttEntity.defineRelations(({ many }) => ({
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": many(ttIriRef)
}));
pageableEntityReferenceNode.defineRelations(({ many }) => ({
  result: many(entityReferenceNode)
}));
entityReferenceNode.defineRelations(({ many }) => ({
  parents: many(ttIriRef),
  type: many(ttIriRef)
}));
searchResultSummary.defineRelations(({ many }) => ({
  scheme: many(ttIriRef),
  entityType: many(ttIriRef),
  isDescendantOf: many(ttIriRef),
  status: many(ttIriRef)
}));
argument.defineRelations(({ one, many }) => ({
  valueIri: one(ttIriRef),
  valueIriList: many(ttIriRef)
}));
parameterShape.defineRelations(({ one, many }) => ({
  type: one(ttIriRef),
  parameterSubType: many(ttIriRef)
}));
propertyRange.defineRelations(({ one }) => ({
  intervalUnit: one(ttIriRef)
}));
nodeShape.defineRelations(({ one, many }) => ({
  property: many(propertyShape),
  subType: many(ttIriRef),
  definingProperty: one(ttIriRef),
  inverseProperty: one(ttIriRef),
  folder: many(nodeShape),
  type: many(nodeShape)
}));
propertyShape.defineRelations(({ one, many }) => ({
  componentType: one(ttIriRef),
  path: one(ttIriRef),
  node: one(propertyRange),
  validation: one(ttIriRef),
  search: one(ttIriRef),
  select: many(ttIriRef),
  argument: many(argument),
  isIri: one(ttIriRef),
  group: one(ttIriRef),
  datatype: one(propertyRange),
  clazz: one(propertyRange),
  function: one(ttIriRef),
  property: many(propertyShape),
  parameter: many(parameterShape),
  valueIri: one(ttIriRef),
  expression: one(nodeShape),
  arrayButtons: one(arrayButtons),
  hasValueType: one(ttIriRef),
  hasValueSet: one(ttIriRef),
  isValidEntity: one(ttIriRef),
  isValidArguments: many(argument),
  inversePath: one(ttIriRef)
}));
propertyDisplay.defineRelations(({ one }) => ({
  group: one(ttIriRef),
  property: one(ttIriRef),
  type: one(ttIriRef)
}));

async function ttEntityRandom() {
  return await ttEntity.create({
    iri: faker.internet.url(),
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [await ttIriRefRandom()],
    "http://www.w3.org/2000/01/rdf-schema#label": faker.lorem.sentence()
  });
}
async function ttEntityRandomMany(count: number) {
  const entities = [];
  for (let i = 0; i < count; i++) {
    entities.push(await ttEntityRandom());
  }
  return entities;
}
async function ttIriRefRandom() {
  return await ttIriRef.create({
    iri: faker.internet.url(),
    name: faker.lorem.sentence()
  });
}
async function ttIriRefRandomMany(count: number) {
  return await ttIriRef.createMany(count, () => ({
    iri: faker.internet.url(),
    name: faker.lorem.sentence()
  }));
}
async function pageableEntityReferenceNodeRandom() {
  return await pageableEntityReferenceNode.create({
    result: await entityReferenceNodeRandomMany(5),
    totalCount: faker.number.int(),
    currentPage: faker.number.int(),
    pageSize: faker.number.int()
  });
}
async function entityReferenceNodeRandom() {
  return await entityReferenceNode.create({
    iri: faker.internet.url(),
    hasChildren: faker.datatype.boolean(),
    hasGrandChildren: faker.datatype.boolean(),
    name: faker.lorem.sentence(),
    orderNumber: faker.number.int(),
    parents: await ttIriRefRandomMany(5),
    type: await ttIriRefRandomMany(1)
  });
}
async function entityReferenceNodeRandomMany(count: number) {
  const entitySummaries = [];
  for (let i = 0; i < count; i++) {
    entitySummaries.push(await entityReferenceNodeRandom());
  }
  return entitySummaries;
}
async function searchResultSummaryRandom() {
  return await searchResultSummary.create({
    name: faker.lorem.sentence(),
    iri: faker.internet.url(),
    scheme: await ttIriRefRandom(),
    code: faker.lorem.word(),
    type: await ttIriRefRandomMany(1),
    isA: await ttIriRefRandomMany(2),
    bestMatch: faker.lorem.sentence(),
    status: await ttIriRefRandom()
  });
}
async function searchResultSummaryRandomMany(count: number) {
  const conceptSummaries = [];
  for (let i = 0; i < count; i++) {
    conceptSummaries.push(await searchResultSummaryRandom());
  }
  return conceptSummaries;
}
async function githubReleaseRandom() {
  return await githubRelease.create({
    version: faker.lorem.word(),
    title: faker.lorem.sentence(),
    createdDate: faker.date.past(),
    publishedDate: faker.date.future(),
    releaseNotes: [faker.lorem.paragraph(), faker.lorem.paragraph()],
    author: faker.person.fullName(),
    url: faker.internet.url()
  });
}
async function argumentRandom() {
  return await argument.create({
    parameter: faker.internet.url(),
    valueData: faker.lorem.word(),
    valueVariable: faker.lorem.word(),
    valueIri: await ttIriRefRandom(),
    valueIriList: await ttIriRefRandomMany(5),
    valueDataList: [faker.lorem.word(), faker.lorem.word()]
  });
}
async function arrayButtonsRandom() {
  return await arrayButtons.create({
    up: false,
    down: false,
    minus: false,
    plus: false
  });
}
async function argumentRandomMany(count: number) {
  const args = [];
  for (let i = 0; i < count; i++) {
    args.push(await argumentRandom());
  }
  return args;
}
async function propertyRangeRandom() {
  return await propertyRange.create({
    iri: faker.internet.url(),
    pattern: faker.lorem.word(),
    intervalUnit: await ttIriRefRandom()
  });
}
async function parameterShapeRandom() {
  return await parameterShape.create({
    label: faker.lorem.word(),
    type: await ttIriRefRandom(),
    parameterSubType: await ttIriRefRandomMany(2)
  });
}
async function parameterShapeRandomMany(count: number) {
  const args = [];
  for (let i = 0; i < count; i++) {
    args.push(await parameterShapeRandom());
  }
  return args;
}
async function propertyShapeRandom(subPropertyDepth?: number): Promise<PropertyShape> {
  return await propertyShape.create({
    label: faker.lorem.word(),
    comment: faker.lorem.sentence(),
    name: faker.lorem.words(),
    order: faker.number.int(),
    minCount: faker.number.int(),
    maxCount: faker.number.int(),
    componentType: await ttIriRefRandom(),
    path: await ttIriRefRandom(),
    validation: await ttIriRefRandom(),
    search: await ttIriRefRandom(),
    select: await ttIriRefRandomMany(3),
    argument: await argumentRandomMany(2),
    valueVariable: faker.lorem.word(),
    isIri: await ttIriRefRandom(),
    isTextValue: faker.lorem.word(),
    isNumericValue: faker.lorem.word(),
    forceIsValue: faker.datatype.boolean(),
    builderChild: faker.datatype.boolean(),
    datatype: await propertyRangeRandom(),
    clazz: await propertyRangeRandom(),
    validationErrorMessage: faker.lorem.sentence(),
    function: await ttIriRefRandom(),
    property: subPropertyDepth && subPropertyDepth > 0 ? await propertyShapeRandomMany(5, subPropertyDepth - 1) : [],
    node: await propertyRangeRandom(),
    group: await ttIriRefRandom(),
    valueIri: await ttIriRefRandom(),
    parameter: await parameterShapeRandomMany(2)
  });
}
async function propertyShapeRandomMany(count: number, subPropertyDepth?: number): Promise<PropertyShape[]> {
  const propertyShapes: PropertyShape[] = [];
  for (let i = 0; i < count; i++) {
    propertyShapes.push(await propertyShapeRandom(subPropertyDepth));
  }
  return propertyShapes;
}
async function componentDetailsRandom() {
  return await componentDetails.create({
    id: faker.lorem.word(),
    value: {},
    position: faker.number.int(),
    type: faker.helpers.enumValue(ComponentType),
    json: {},
    showButtons: await arrayButtonsRandom(),
    shape: undefined,
    mode: faker.helpers.enumValue(EditorMode)
  });
}
async function propertyDisplayRandom() {
  return await propertyDisplay.create({
    order: faker.number.int(),
    group: await ttIriRefRandom(),
    property: await ttIriRefRandomMany(2),
    type: await ttIriRefRandomMany(2),
    cardinality: faker.lorem.word()
  });
}
async function tangledTreeDataRandom(depth?: number): Promise<TangledTreeData> {
  return await tangledTreeData.create({
    id: faker.string.uuid(),
    parents: depth && depth > 0 ? await tangledTreeDataRandomMany(depth - 1) : [],
    name: faker.lorem.sentence(),
    type: faker.lorem.word(),
    cardinality: faker.lorem.word()
  });
}
async function tangledTreeDataRandomMany(count: number, depth?: number): Promise<TangledTreeData[]> {
  const tangledTreeDatas: TangledTreeData[] = [];
  for (let i = 0; i < count; i++) {
    tangledTreeDatas.push(await tangledTreeDataRandom(depth));
  }
  return tangledTreeDatas;
}
async function userRandom() {
  return await user.create({
    id: faker.lorem.word(),
    type: faker.lorem.word(),
    username: faker.internet.username(),
    displayName: faker.person.firstName(),
    email: faker.internet.email(),
    avatar: faker.internet.url()
  });
}

export {
  ttEntity,
  ttEntityRandom,
  ttEntityRandomMany,
  ttIriRef,
  ttIriRefRandom,
  ttIriRefRandomMany,
  pageableEntityReferenceNode,
  pageableEntityReferenceNodeRandom,
  entityReferenceNode,
  entityReferenceNodeRandom,
  entityReferenceNodeRandomMany,
  searchResultSummary,
  searchResultSummaryRandom,
  searchResultSummaryRandomMany,
  githubRelease,
  githubReleaseRandom,
  argument,
  argumentRandom,
  argumentRandomMany,
  propertyShape,
  propertyShapeRandom,
  propertyShapeRandomMany,
  componentDetails,
  componentDetailsRandom,
  propertyDisplay,
  propertyDisplayRandom,
  user,
  userRandom
};
