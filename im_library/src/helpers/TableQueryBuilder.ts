import { TableQuery } from "../interfaces/query/QueryData";
import { Query } from "../models/AutoGen";
import { JSONPath } from "jsonpath-plus";

export function buildTableQuery(query: Query) {
  const tableQuery = [] as TableQuery[];
  buildRecursively(query);
  console.log(query);
  const queryString = JSON.stringify(query);
  // JSONPath.toPathArray(query);
  // const result = JSONPath({ path: "$.", json: query });
  // console.log("here");
  // console.log(result);
  console.log(queryString);
  return tableQuery;
}

function buildRecursively(query: any) {
  const iquery = {} as Query;
}
