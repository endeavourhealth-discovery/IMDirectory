import { UserSchema } from "@endeavour/vue-library";

import { faker } from "@faker-js/faker";
import { Collection } from "@msw/data";
import { output, z } from "zod";

import { ComponentType } from "@/enums";

const entitySchema = z.object({
  iri: z.url(),
  get "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"() {
    return z.array(iriRefSchema).nullable();
  },
  "http://www.w3.org/2000/01/rdf-schema#label": z.string().nullable()
});

const iriRefSchema = z.object({
  iri: z.url(),
  name: z.string()
});

const pagedChildrenSchema = z.object({
  get result() {
    return z.array(entitySummarySchema);
  },
  totalCount: z.number(),
  pageSize: z.number(),
  currentPage: z.number()
});
const entitySummarySchema = z.object({
  iri: z.url(),
  hasChildren: z.boolean(),
  hasGrandChildren: z.boolean(),
  name: z.string(),
  orderNumber: z.number(),
  get parents() {
    return z.array(iriRefSchema);
  },
  get type() {
    return z.array(iriRefSchema);
  }
});

const conceptSummarySchema = z.object({
  name: z.string(),
  iri: z.url(),
  get scheme() {
    return z.array(iriRefSchema);
  },
  code: z.string(),
  get entityType() {
    return z.array(iriRefSchema);
  },
  get isDescendantOf() {
    return z.array(iriRefSchema);
  },
  weighting: z.number(),
  match: z.string(),
  get status() {
    return z.array(iriRefSchema);
  }
});
const eclSearchSchema = z.object({
  uuid: z.uuid(),
  get entities() {
    return z.array(conceptSummarySchema);
  },
  count: z.number(),
  page: z.number()
});
const componentLayoutSchema = z.object({
  label: z.string(),
  predicate: z.url(),
  type: z.string(),
  size: z.string(),
  order: z.number()
});
const githubReleaseSchema = z.object({
  version: z.string(),
  title: z.string(),
  createdDate: z.date(),
  publishedDate: z.date(),
  releaseNotes: z.array(z.string()),
  author: z.string(),
  url: z.url()
});
const argumentSchema = z.object({
  parameter: z.url(),
  valueData: z.string(),
  valueVariable: z.string(),
  get valueIri() {
    return iriRefSchema.optional();
  },
  get valueIriList() {
    return z.array(iriRefSchema);
  },
  valueDataList: z.array(z.string())
});
const propertyShapeSchema = z.object({
  label: z.string(),
  comment: z.string(),
  name: z.string(),
  order: z.number(),
  minCount: z.number(),
  maxCount: z.number(),
  get componentType() {
    return iriRefSchema.optional();
  },
  get path() {
    return iriRefSchema.optional();
  },
  get node() {
    return z.array(iriRefSchema);
  },
  get validation() {
    return iriRefSchema.optional();
  },
  get search() {
    return iriRefSchema.optional();
  },
  get select() {
    return z.array(iriRefSchema);
  },
  get argument() {
    return z.array(argumentSchema).nullable();
  },
  get valueVariable() {
    return iriRefSchema.optional();
  },
  get isIri() {
    return iriRefSchema.optional();
  },
  isTextValue: z.string().nullable(),
  isNumbericValue: z.string().nullable(),
  forceIsValue: z.boolean(),
  builderChild: z.boolean(),
  get datatype() {
    return iriRefSchema.optional();
  },
  get clazz() {
    return iriRefSchema.optional();
  },
  validationErrorMessage: z.string(),
  get function() {
    return iriRefSchema.optional();
  },
  expression: z.any(),
  get subProperty() {
    return z.array(propertyShapeSchema);
  }
});
type PropertyShape = output<typeof propertyShapeSchema>;
const componentDetailsSchema = z.object({
  id: z.string(),
  value: z.any(),
  position: z.number(),
  type: z.enum(ComponentType),
  json: z.any(),
  showButtons: z.any().nullable(),
  get shape() {
    return propertyShapeSchema.optional();
  },
  mode: z.string()
});
const propertyDisplaySchema = z.object({
  key: z.uuid(),
  order: z.number(),
  get group() {
    return iriRefSchema.optional();
  },
  get property() {
    return iriRefSchema.optional();
  },
  get type() {
    return iriRefSchema.optional();
  },
  cardinality: z.string()
});
const tangledTreeDataSchema = z.object({
  id: z.uuid(),
  get parents() {
    return z.array(tangledTreeDataSchema).nullable();
  },
  name: z.string(),
  type: z.string(),
  cardinality: z.string().nullable()
});
type TangledTreeData = output<typeof tangledTreeDataSchema>;
const entity = new Collection({
  schema: entitySchema
});
const iriRef = new Collection({
  schema: iriRefSchema
});
const pagedChildren = new Collection({
  schema: pagedChildrenSchema
});
const entitySummary = new Collection({
  schema: entitySummarySchema
});
const conceptSummary = new Collection({
  schema: conceptSummarySchema
});
const eclSearch = new Collection({
  schema: eclSearchSchema
});
const componentLayout = new Collection({
  schema: componentLayoutSchema
});
const githubRelease = new Collection({
  schema: githubReleaseSchema
});
const argument = new Collection({
  schema: argumentSchema
});
const propertyShape = new Collection({
  schema: propertyShapeSchema
});
const componentDetails = new Collection({
  schema: componentDetailsSchema
});
componentDetails.defineRelations(({ one }) => ({
  shape: one(propertyShape)
}));
const propertyDisplay = new Collection({
  schema: propertyDisplaySchema
});
const tangledTreeData = new Collection({
  schema: tangledTreeDataSchema
});
tangledTreeData.defineRelations(({ many }) => ({
  parents: many(tangledTreeData)
}));
const user = new Collection({
  schema: UserSchema
});

entity.defineRelations(({ many }) => ({
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": many(iriRef)
}));
pagedChildren.defineRelations(({ many }) => ({
  result: many(entitySummary)
}));
entitySummary.defineRelations(({ many }) => ({
  parents: many(iriRef),
  type: many(iriRef)
}));
conceptSummary.defineRelations(({ many }) => ({
  scheme: many(iriRef),
  entityType: many(iriRef),
  isDescendantOf: many(iriRef),
  status: many(iriRef)
}));
eclSearch.defineRelations(({ many }) => ({
  entities: many(conceptSummary)
}));
argument.defineRelations(({ one, many }) => ({
  valueIri: one(iriRef),
  valueIriList: many(iriRef)
}));
propertyShape.defineRelations(({ one, many }) => ({
  componentType: one(iriRef),
  path: one(iriRef),
  node: many(iriRef),
  validation: one(iriRef),
  search: one(iriRef),
  select: many(iriRef),
  argument: many(argument),
  valueVariable: one(iriRef),
  isIri: one(iriRef),
  datatype: one(iriRef),
  clazz: one(iriRef),
  function: one(iriRef),
  subProperty: many(propertyShape)
}));
propertyDisplay.defineRelations(({ one }) => ({
  group: one(iriRef),
  property: one(iriRef),
  type: one(iriRef)
}));

async function entityRandom() {
  return await entity.create({
    iri: faker.internet.url(),
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [await iriRefRandom()],
    "http://www.w3.org/2000/01/rdf-schema#label": faker.lorem.sentence()
  });
}
async function entityRandomMany(count: number) {
  const entities = [];
  for (let i = 0; i < count; i++) {
    entities.push(await entityRandom());
  }
  return entities;
}
async function iriRefRandom() {
  return await iriRef.create({
    iri: faker.internet.url(),
    name: faker.lorem.sentence()
  });
}
async function iriRefRandomMany(count: number) {
  return await iriRef.createMany(count, () => ({
    iri: faker.internet.url(),
    name: faker.lorem.sentence()
  }));
}
async function pagedChildrenRandom() {
  return await pagedChildren.create({
    result: await entitySummaryRandomMany(5),
    totalCount: faker.number.int(),
    currentPage: faker.number.int(),
    pageSize: faker.number.int()
  });
}
async function entitySummaryRandom() {
  return await entitySummary.create({
    iri: faker.internet.url(),
    hasChildren: faker.datatype.boolean(),
    hasGrandChildren: faker.datatype.boolean(),
    name: faker.lorem.sentence(),
    orderNumber: faker.number.int(),
    parents: await iriRefRandomMany(5),
    type: await iriRefRandomMany(1)
  });
}
async function entitySummaryRandomMany(count: number) {
  const entitySummaries = [];
  for (let i = 0; i < count; i++) {
    entitySummaries.push(await entitySummaryRandom());
  }
  return entitySummaries;
}
async function conceptSummaryRandom() {
  return await conceptSummary.create({
    name: faker.lorem.sentence(),
    iri: faker.internet.url(),
    scheme: await iriRefRandomMany(1),
    code: faker.lorem.word(),
    entityType: await iriRefRandomMany(1),
    isDescendantOf: await iriRefRandomMany(2),
    weighting: faker.number.int(),
    match: faker.lorem.sentence(),
    status: await iriRefRandomMany(1)
  });
}
async function conceptSummaryRandomMany(count: number) {
  const conceptSummaries = [];
  for (let i = 0; i < count; i++) {
    conceptSummaries.push(await conceptSummaryRandom());
  }
  return conceptSummaries;
}
async function eclSearchRandom() {
  return await eclSearch.create({
    uuid: faker.string.uuid(),
    entities: await conceptSummaryRandomMany(4),
    count: faker.number.int(),
    page: faker.number.int()
  });
}
async function componentLayoutRandom() {
  return await componentLayout.create({
    label: faker.lorem.sentence(),
    predicate: faker.internet.url(),
    type: faker.lorem.word(),
    size: faker.lorem.word(),
    order: faker.number.int()
  });
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
    valueIri: await iriRefRandom(),
    valueIriList: await iriRefRandomMany(5),
    valueDataList: [faker.lorem.word(), faker.lorem.word()]
  });
}
async function argumentRandomMany(count: number) {
  const args = [];
  for (let i = 0; i < count; i++) {
    args.push(await argumentRandom());
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
    componentType: await iriRefRandom(),
    path: await iriRefRandom(),
    node: await iriRefRandomMany(2),
    validation: await iriRefRandom(),
    search: await iriRefRandom(),
    select: await iriRefRandomMany(3),
    argument: await argumentRandomMany(2),
    valueVariable: await iriRefRandom(),
    isIri: await iriRefRandom(),
    isTextValue: faker.lorem.word(),
    isNumbericValue: faker.lorem.word(),
    forceIsValue: faker.datatype.boolean(),
    builderChild: faker.datatype.boolean(),
    datatype: await iriRefRandom(),
    clazz: await iriRefRandom(),
    validationErrorMessage: faker.lorem.sentence(),
    function: await iriRefRandom(),
    expression: {},
    subProperty: subPropertyDepth && subPropertyDepth > 0 ? await propertyShapeRandomMany(5, subPropertyDepth - 1) : []
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
    showButtons: {},
    shape: await propertyShapeRandom(),
    mode: faker.lorem.word()
  });
}
async function propertyDisplayRandom() {
  return await propertyDisplay.create({
    key: faker.string.uuid(),
    order: faker.number.int(),
    group: await iriRefRandom(),
    property: await iriRefRandom(),
    type: await iriRefRandom(),
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
  entity,
  entityRandom,
  entityRandomMany,
  iriRef,
  iriRefRandom,
  iriRefRandomMany,
  pagedChildren,
  pagedChildrenRandom,
  entitySummary,
  entitySummaryRandom,
  entitySummaryRandomMany,
  conceptSummary,
  conceptSummaryRandom,
  conceptSummaryRandomMany,
  eclSearch,
  eclSearchRandom,
  componentLayout,
  componentLayoutRandom,
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
