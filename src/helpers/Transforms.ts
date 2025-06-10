import { IM, RDF, RDFS } from "../vocabulary";
import { isObjectHasKeys } from "./DataTypeCheckers";
import { Argument } from "../interfaces/AutoGen";
import { TTEntity, SearchResultSummary } from "@/interfaces/ExtendedAutoGen";
import { GenericObject } from "@/interfaces/GenericObject";

export function mapToObject(args: Argument[]) {
  const argsAsObject = {} as Argument;
  args.forEach((value, key) => {
    (argsAsObject as GenericObject)[key] = value;
  });
  return argsAsObject;
}

export function entityToAliasEntity(ttEntity: TTEntity | SearchResultSummary) {
  if (isObjectHasKeys(ttEntity, [RDFS.LABEL])) {
    ttEntity.name = ttEntity[RDFS.LABEL];
    delete ttEntity[RDFS.LABEL];
  }
  if (isObjectHasKeys(ttEntity, [IM.CODE])) {
    ttEntity.code = ttEntity[IM.CODE];
    delete ttEntity[IM.CODE];
  }
  if (isObjectHasKeys(ttEntity, [RDFS.COMMENT])) {
    ttEntity.description = ttEntity[RDFS.COMMENT];
    delete ttEntity[RDFS.COMMENT];
  }
  if (isObjectHasKeys(ttEntity, [IM.HAS_STATUS])) {
    ttEntity.status = ttEntity[IM.HAS_STATUS];
    delete ttEntity[IM.HAS_STATUS];
  }
  if (isObjectHasKeys(ttEntity, [IM.HAS_SCHEME])) {
    ttEntity.scheme = ttEntity[IM.HAS_SCHEME];
    delete ttEntity[IM.HAS_SCHEME];
  }
  if (isObjectHasKeys(ttEntity, [RDF.TYPE])) {
    ttEntity.entityType = ttEntity[RDF.TYPE];
    delete ttEntity[RDF.TYPE];
  }
  if (isObjectHasKeys(ttEntity, [IM.USAGE_TOTAL])) {
    ttEntity.weighting = ttEntity[IM.USAGE_TOTAL];
    delete ttEntity[IM.USAGE_TOTAL];
  }
}

export default {
  mapToObject,
  entityToAliasEntity
};
