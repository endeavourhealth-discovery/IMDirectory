import Env from "@/services/env.service";
import EclService from "./ecl.service";
import axios from "axios";
import { buildDetails } from "@/builders/entity/detailsBuilder";
import { EclSearchRequest, PropertyDisplay, TTBundle, ContextMap, TreeNode, EntityReferenceNode, FiltersAsIris, ValidatedEntity } from "@im-library/interfaces";
import { IM, RDF, RDFS, SHACL, SNOMED } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import EntityRepository from "@/repositories/entityRepository";
import { TTIriRef, SearchResultSummary, Concept, DataModelProperty, TTEntity } from "@im-library/interfaces/AutoGen";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { byName } from "@im-library/helpers/Sorters";

export default class EntityService {
  axios: any;
  eclService: EclService;
  entityRepository: EntityRepository;

  constructor(axios: any) {
    this.axios = axios;
    this.eclService = new EclService(axios);
    this.entityRepository = new EntityRepository();
  }

  public async getPropertyOptions(dataModelIri: string, dataTypeIri: string, key: string): Promise<TreeNode> {
    const propertiesEntity = await this.getPartialEntity(dataModelIri, [SHACL.PROPERTY]);
    if (!isObjectHasKeys(propertiesEntity.data, [SHACL.PROPERTY])) return {} as TreeNode;
    const allProperties: any[] = propertiesEntity.data[SHACL.PROPERTY];
    const validOptions = allProperties.filter(dmProperty => dmProperty[SHACL.DATATYPE] && dmProperty[SHACL.DATATYPE][0]["@id"] === dataTypeIri);
    if (!isArrayHasLength(validOptions)) return {} as TreeNode;

    const treeNode = {
      key: key,
      label: key + " (" + getNameFromRef({ "@id": dataModelIri }) + ")",
      children: [] as TreeNode[],
      selectable: false
    } as TreeNode;

    for (const property of validOptions) {
      treeNode.children.push({
        key: key + "/" + property[SHACL.PATH][0]["@id"],
        label: property[SHACL.PATH][0].name,
        data: {
          "@id": property[SHACL.PATH][0]["@id"],
          nodeRef: key,
          name: property[SHACL.PATH][0].name
        }
      } as TreeNode);
    }

    return treeNode;
  }

  public async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    return await this.axios.get(Env.API + "api/entity/public/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  }

  public async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<EntityReferenceNode[]> {
    return (
      await this.axios.get(Env.API + "api/entity/public/children", {
        params: { iri: iri, schemeIris: filters?.schemes.join(",") },
        signal: controller?.signal
      })
    ).data;
  }

  public async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    return (
      await this.axios.get(Env.API + "api/entity/public/bundleByPredicateExclusions", {
        params: { iri: iri, predicates: predicates.join(",") }
      })
    ).data;
  }

  public async getPartialEntities(typeIris: string[], predicates: string[]): Promise<any[]> {
    const promises: Promise<any>[] = [];
    typeIris.forEach(iri => {
      promises.push(this.getPartialEntity(iri, predicates));
    });
    return await Promise.all(promises);
  }

  public async getDistillation(refs: TTEntity[]): Promise<TTEntity[]> {
    const response = await this.axios.post(Env.API + "api/entity/public/distillation", refs);
    return response.data;
  }

  public async getDetailsDisplay(iri: string): Promise<any[]> {
    const excludedPredicates = [IM.CODE, RDFS.LABEL, IM.HAS_STATUS, RDFS.COMMENT];
    const entityPredicates = await this.getPredicates(iri);
    let response: TTBundle = {} as TTBundle;
    let types: TTIriRef[] = [] as TTIriRef[];
    if (entityPredicates.includes(IM.HAS_MEMBER)) {
      response = await this.getBundleByPredicateExclusions(iri, excludedPredicates.concat([IM.HAS_MEMBER]));
      const partialAndCount = await this.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
      response.entity[IM.HAS_MEMBER] = (partialAndCount.result as any[]).concat([
        { name: "Load more", "@id": IM.NAMESPACE + "loadMore", totalCount: partialAndCount.totalCount as number }
      ]);
      response.predicates[IM.HAS_MEMBER] = "has member";
    } else {
      response = await this.getBundleByPredicateExclusions(iri, excludedPredicates);
    }
    types = response.entity[RDF.TYPE];
    delete response.entity[RDF.TYPE];
    return buildDetails(response, types);
  }

  public async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: string, pageSize: string) {
    const response = await this.getPartialAndTotalCount(iri, predicate, parseInt(pageIndex), parseInt(pageSize));
    const entity = {} as any;
    entity[predicate] = response.result;
    const bundle = { entity: entity, predicates: [] } as TTBundle;
    return buildDetails(bundle);
  }

  public async getPredicates(iri: string): Promise<string[]> {
    return (
      await this.axios.get(Env.API + "api/entity/public/predicates", {
        params: {
          iri: iri
        }
      })
    ).data;
  }

  async getPartialAndTotalCount(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<any> {
    return (
      await this.axios.get(Env.API + "api/entity/public/partialAndTotalCount", {
        params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize }
      })
    ).data;
  }

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    const entity = (await this.getPartialEntity(iri, [SHACL.PROPERTY])).data;
    const propertyList = [] as PropertyDisplay[];
    if (isObjectHasKeys(entity, [SHACL.PROPERTY]) && isArrayHasLength(entity[SHACL.PROPERTY])) {
      for (const ttproperty of entity[SHACL.PROPERTY]) {
        const cardinality = `${ttproperty[SHACL.MINCOUNT] || 0} : ${ttproperty[SHACL.MAXCOUNT] || "*"}`;
        if (isObjectHasKeys(ttproperty, [SHACL.OR])) {
          const property = {
            order: ttproperty[SHACL.ORDER],
            property: [] as TTIriRef[],
            type: [] as TTIriRef[],
            cardinality: cardinality,
            isOr: true
          };
          for (const orProperty of ttproperty[SHACL.OR]) {
            const type = orProperty[SHACL.CLASS] || orProperty[SHACL.NODE] || orProperty[SHACL.DATATYPE] || [];
            const name = `${orProperty[SHACL.PATH]?.[0].name}  (${
              isArrayHasLength(type) ? (type[0].name ? type[0].name : type[0]["@id"].slice(type[0]["@id"].indexOf("#") + 1)) : ""
            })`;
            property.property.push({ "@id": orProperty[SHACL.PATH]?.[0]["@id"], name: name });
            property.type.push(isArrayHasLength(type) ? type[0] : {});
          }
          propertyList.push(property);
        } else {
          const type = ttproperty[SHACL.CLASS] || ttproperty[SHACL.NODE] || ttproperty[SHACL.DATATYPE] || [];
          const group = ttproperty?.[SHACL.GROUP]?.[0];
          const name = `${ttproperty[SHACL.PATH]?.[0].name}  (${isArrayHasLength(type) ? (type[0].name ? type[0].name : type[0]["@id"]) : ""})`;
          const property = {
            order: ttproperty[SHACL.ORDER],
            property: [{ "@id": ttproperty[SHACL.PATH]?.[0]["@id"], name: name }],
            type: [isArrayHasLength(type) ? type[0] : ""],
            cardinality: cardinality,
            isOr: false
          } as PropertyDisplay;
          if (group) {
            property.group = group;
          }
          propertyList.push(property);
        }
      }
    }

    return propertyList;
  }

  async isValidPropertyBoolFocus(focus: any, propertyIri: string) {
    let query;
    if (focus.ecl) query = (await axios.post(Env.API + "api/ecl/public/queryFromEcl", focus.ecl)).data;
    const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
    const results = await this.eclService.eclSearch(eclSearchRequest);
    let found = false;
    let counter = 0;
    if (results.entities && isArrayHasLength(results.entities)) {
      while (!found && counter < results.entities.length) {
        const conceptIri = results.entities[counter].iri;
        const result = (await axios.get(Env.API + "api/entity/public/isValidProperty", { params: { entity: conceptIri, property: propertyIri } })).data;
        if (result) found = result;
        counter++;
      }
    }
    return found;
  }

  async getSuperiorPropertiesBoolFocusPaged(focus: any, pageIndex?: number, pageSize?: number, filters?: string[]) {
    let query;
    let superiors = { result: [], totalCount: 0 };
    if (focus.ecl) query = (await axios.post(Env.API + "api/ecl/public/queryFromEcl", focus.ecl)).data;
    if (query) {
      const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
      const results = await this.eclService.eclSearch(eclSearchRequest);
      if (results.entities && isArrayHasLength(results.entities)) {
        superiors = (
          await this.axios.get(Env.API + "api/entity/public/superiorPropertiesBoolFocusPaged", {
            params: {
              conceptIris: results.entities.map(result => result.iri).join(","),
              pageIndex: pageIndex,
              pageSize: pageSize,
              schemeFilters: filters?.join(",")
            }
          })
        ).data;
      }
    }
    return superiors;
  }

  async getConceptContextMaps(iri: string): Promise<ContextMap[]> {
    return await this.entityRepository.getConceptContextMaps(iri);
  }

  async getInverseIsas(iri: string, searchTerm?: string): Promise<any[]> {
    return await this.entityRepository.getInverseIsas(iri, searchTerm);
  }

  async isInverseIsa(iri: string, searchTerm?: string): Promise<boolean> {
    return (await this.axios.get(Env.API + "api/entity/public/isInverseIsa", { params: { subjectIri: iri, objectIri: searchTerm } })).data;
  }

  async getEntityReferenceNode(iri: string): Promise<EntityReferenceNode> {
    return (await this.axios.get(Env.API + "api/entity/public/asEntityReferenceNode", { params: { iri: iri } })).data;
  }

  async getEntitySummary(iri: string): Promise<SearchResultSummary> {
    return (await this.axios.get(Env.API + "api/entity/public/summary", { params: { iri: iri } })).data;
  }

  async getSetDiff(setIriA: string, setIriB: string) {
    let membersA: Concept[] = [];
    let membersB: Concept[] = [];
    if (setIriA) membersA = await this.getFullyExpandedSetMembers(setIriA, false, false);
    if (setIriB) membersB = await this.getFullyExpandedSetMembers(setIriB, false, false);
    const membersMap = new Map<string, Concept>();
    const diff = { membersA: [] as Concept[], sharedMembers: [] as Concept[], membersB: [] as Concept[] };

    for (const member of membersA) {
      member.name = member.name + " | " + member.code;
      membersMap.set(member["@id"]!, member);
    }

    for (const member of membersB) {
      member.name = member.name + " | " + member.code;
      if (membersMap.has(member["@id"]!)) {
        diff.sharedMembers.push(member);
        membersMap.delete(member["@id"]!);
      } else {
        diff.membersB.push(member);
      }
    }

    diff.membersA = Array.from(membersMap, ([iri, member]) => member).sort(byName);
    diff.membersB.sort(byName);
    diff.sharedMembers.sort(byName);
    return diff;
  }

  async getFullyExpandedSetMembers(iri: string, legacy: boolean, includeSubsets: boolean): Promise<Concept[]> {
    return (
      await axios.get(Env.API + "api/entity/public/expandedMembers", {
        params: {
          iri: iri,
          legacy: legacy,
          includeSubsets: includeSubsets
        }
      })
    ).data;
  }

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return (
      await axios.get(Env.API + "api/entity/public/subsets", {
        params: {
          iri: iri
        }
      })
    ).data;
  }

  async getDataModelProperties(iri: string): Promise<DataModelProperty[]> {
    return (
      await axios.get(Env.API + "api/entity/public/dataModelProperties", {
        params: {
          iri: iri
        }
      })
    ).data;
  }

  async findEntitiesBySnomedCodes(codes: string[]): Promise<any[]> {
    const iris = codes.map(code => SNOMED.NAMESPACE + code);
    const result = await this.getPartialEntities(iris, [RDFS.LABEL, IM.CODE]);
    return result.map(resolved => resolved.data);
  }

  async findValidatedEntitiesBySnomedCodes(codes: string[]) {
    const entities = await this.findEntitiesBySnomedCodes(codes);
    const needed = await this.getDistillation(entities);
    const response = [] as ValidatedEntity[];
    for (const entity of entities) {
      const validatedEntity: ValidatedEntity = { "@id": entity["@id"], name: entity[RDFS.LABEL], code: entity[IM.CODE] };
      const isInvalid = isObjectHasKeys(entity, ["@id"]) && !isObjectHasKeys(entity, [RDFS.LABEL, IM.CODE]);
      const index = needed.findIndex(neededEntity => neededEntity["@id"] === validatedEntity["@id"]);
      const isIncluded = response.some(added => validatedEntity["@id"] === added["@id"]);
      if (isInvalid) {
        validatedEntity.validationCode = "Invalid";
        validatedEntity.validationLabel = "Not an entity";
      } else if (index !== -1) {
        needed.splice(index, 1);
        validatedEntity.validationCode = "Valid";
      } else {
        validatedEntity.validationCode = "Child";
      }
      if (isIncluded) {
        validatedEntity.validationCode = "Duplicate";
      }
      if (validatedEntity["@id"] && validatedEntity["@id"].includes("#")) validatedEntity.code = validatedEntity["@id"].split("#")[1];
      response.push(validatedEntity);
    }

    return response;
  }
}
