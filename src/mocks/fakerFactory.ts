import { factory, primaryKey, manyOf, nullable, oneOf } from "@mswjs/data";
import { faker } from "@faker-js/faker";

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
    uuid: primaryKey(faker.string.uuid),
    result: manyOf("entitySummary", { unique: true }),
    totalCount: Number
  },
  entitySummary: {
    "@id": primaryKey(faker.internet.url),
    hasChildren: Boolean,
    hasGrandChildren: Boolean,
    name: faker.lorem.sentence,
    orderNumber: faker.number.int,
    parents: manyOf("iriRef", { unique: true }),
    type: manyOf("iriRef", { unique: true })
  },
  conceptSummary: {
    name: faker.lorem.sentence,
    iri: primaryKey(faker.internet.url),
    scheme: manyOf("iriRef", { unique: true }),
    code: faker.string.sample,
    entityType: manyOf("iriRef", { unique: true }),
    isDescendentOf: manyOf("iriRef", { unique: true }),
    weighting: faker.number.int,
    match: faker.string.sample,
    status: manyOf("iriRef", { unique: true })
  },
  eclSearch: {
    uuid: primaryKey(faker.string.uuid),
    entities: manyOf("conceptSummary", { unique: true }),
    count: Number,
    page: Number
  },
  componentLayout: {
    label: faker.lorem.sentence,
    predicate: primaryKey(faker.internet.url),
    type: String,
    size: faker.string.sample,
    order: faker.number.int
  },
  githubRelease: {
    version: faker.string.sample,
    title: faker.string.sample,
    createdDate: faker.date.recent,
    publishedDate: faker.date.past,
    releaseNotes: () => faker.helpers.multiple(() => faker.word.sample()),
    author: faker.person.fullName,
    url: primaryKey(faker.internet.url)
  },
  argument: {
    parameter: primaryKey(faker.internet.url),
    valueData: faker.string.sample,
    valueVariable: faker.string.sample,
    valueIri: oneOf("iriRef"),
    valueIriList: manyOf("iriRef"),
    valueDataList: () => faker.helpers.multiple(() => faker.word.sample())
  },
  propertyShape: {
    label: faker.lorem.sentence,
    comment: faker.lorem.sentence,
    name: primaryKey(faker.lorem.words),
    order: faker.number.int,
    minCount: faker.number.int,
    maxCount: faker.number.int,
    componentType: oneOf("iriRef"),
    path: oneOf("iriRef", { unique: true }),
    node: manyOf("iriRef", { unique: true }),
    validation: nullable(oneOf("iriRef")),
    search: nullable(oneOf("iriRef")),
    select: manyOf("iriRef"),
    argument: nullable(manyOf("argument")),
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
    id: primaryKey(faker.string.sample),
    value: Object,
    position: faker.number.int,
    type: String,
    json: Object,
    showButtons: nullable(Object),
    shape: oneOf("propertyShape"),
    mode: String
  },
  propertyDisplay: {
    key: primaryKey(faker.string.uuid),
    order: Number,
    group: oneOf("iriRef"),
    property: oneOf("iriRef"),
    type: oneOf("iriRef"),
    cardinality: faker.string.sample
  },
  tangledTreeData: {
    id: primaryKey(faker.internet.url),
    parents: nullable(manyOf("tangledTreeData")),
    name: faker.lorem.sentence,
    type: faker.lorem.word,
    cardinality: nullable(faker.string.sample)
  },
  user: {
    id: primaryKey(faker.string.uuid),
    firstName: faker.person.firstName,
    lastName: faker.person.lastName,
    email: faker.internet.email,
    password: faker.internet.password,
    avatar: faker.system.directoryPath,
    roles: () => faker.helpers.multiple(() => faker.word.noun())
  }
});

export { fakerFactory };
