import { factory, primaryKey, manyOf, nullable } from "@mswjs/data";
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
  }
});

export { fakerFactory };
