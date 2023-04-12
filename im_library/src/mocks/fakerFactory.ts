import { factory, primaryKey, manyOf, nullable, oneOf } from "@mswjs/data";
import { faker } from "@faker-js/faker";
import { ComponentType } from "@/enums";

const apiUrl = "http://localhost/imapi/api/";

const fakerFactory = factory({
  entity: {
    "@id": primaryKey(faker.internet.url),
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": nullable(manyOf("iriRef", { unique: true })),
    "http://www.w3.org/2000/01/rdf-schema#label": nullable(faker.lorem.sentence)
  },
  iriRef: {
    "@id": primaryKey(faker.internet.url),
    name: faker.lorem.sentence
  },
  pagedChildren: {
    uuid: primaryKey(faker.datatype.uuid),
    result: manyOf("entitySummary", { unique: true }),
    totalCount: Number
  },
  entitySummary: {
    "@id": primaryKey(faker.internet.url),
    hasChildren: Boolean,
    hasGrandChildren: Boolean,
    name: faker.lorem.sentence,
    orderNumber: faker.datatype.number,
    parents: manyOf("iriRef", { unique: true }),
    type: manyOf("iriRef", { unique: true })
  },
  conceptSummary: {
    name: faker.lorem.sentence,
    iri: primaryKey(faker.internet.url),
    scheme: manyOf("iriRef", { unique: true }),
    code: faker.datatype.string,
    entityType: manyOf("iriRef", { unique: true }),
    isDescendentOf: manyOf("iriRef", { unique: true }),
    weighting: faker.datatype.number,
    match: faker.datatype.string,
    status: manyOf("iriRef", { unique: true })
  },
  eclSearch: {
    uuid: primaryKey(faker.datatype.uuid),
    entities: manyOf("conceptSummary", { unique: true }),
    count: Number,
    page: Number
  },
  componentLayout: {
    label: faker.lorem.sentence,
    predicate: primaryKey(faker.internet.url),
    type: String,
    size: faker.datatype.string,
    order: faker.datatype.number
  },
  githubRelease: {
    version: faker.datatype.string,
    title: faker.datatype.string,
    createdDate: faker.date.recent,
    publishedDate: faker.date.past,
    releaseNotes: faker.datatype.array,
    author: faker.name.fullName,
    url: primaryKey(faker.internet.url)
  },
  argument: {
    parameter: primaryKey(String),
    valueData: String,
    valueVariable: String,
    valueIri: oneOf("iriRef"),
    valueIriList: manyOf("iriRef"),
    valueDataList: faker.datatype.array
  },
  propertyShape: {
    label: faker.lorem.sentence,
    comment: faker.lorem.sentence,
    name: primaryKey(faker.lorem.words),
    order: faker.datatype.number,
    minCount: faker.datatype.number,
    maxCount: faker.datatype.number,
    componentType: oneOf("iriRef"),
    path: oneOf("iriRef", { unique: true }),
    node: manyOf("iriRef", { unique: true }),
    validation: nullable(oneOf("iriRef")),
    search: nullable(oneOf("iriRef")),
    select: manyOf("iriRef"),
    argument: nullable(oneOf("argument")),
    valueVariable: nullable(oneOf("iriRef")),
    isIri: nullable(oneOf("iriRef")),
    isTextValue: nullable(String),
    isNumbericValue: nullable(String),
    forceIsValue: Boolean,
    builderChild: Boolean,
    datatype: oneOf("iriRef"),
    clazz: oneOf("iriRef"),
    validationErrorMessage: nullable(faker.lorem.sentence),
    function: nullable(oneOf("iriRef")),
    expression: nullable(Object),
    subProperty: manyOf("propertyShape")
  },
  componentDetails: {
    id: primaryKey(faker.datatype.string),
    value: Object,
    position: faker.datatype.number,
    type: String,
    json: Object,
    showButtons: nullable(Object),
    shape: oneOf("propertyShape"),
    mode: String,
    showTitles: Boolean
  }
});

export { fakerFactory };
