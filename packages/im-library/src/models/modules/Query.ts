import uuid from "uuid-random";
import _ from "lodash";

import { toTemplates } from "./Templates.js";
import { IM, RDF } from "../../vocabulary/index.js";

export class QueryBuilder {
  //properties without getters/setters belonging to this class
  "Loaded" = false;

  //all other properties belonging to this class

  // all entities
  public entities = new Map<string, any>();

  // #todo use Set to hold unique items?
  // all filetypes (http://www.w3.org/1999/02/22-rdf-syntax-ns#type)
  private _entityTypes = [] as any[];
  get entityTypes(): any[] {
    return this._entityTypes;
  }

  // profiles
  private _profiles = new Map<string, any>();
  get profiles(): Map<string, any> {
    return this._profiles;
  }
  // set profiles(): Map<string, any> {
  //     this_.profiles
  // }

  // get profilesAsArray(): any {
  //     return [...this._profiles.values()];
  // }

  // (keys) iri i.e. '@id'  -> (values) mapped to clauses i.e. ':and', ':or'
  private _clauses = new Map<string, any>();
  get clauses(): Map<string, any> {
    return this._clauses;
  }

  private reset(): void {
    this.entities.clear();
    this._entityTypes = [] as any[];
    this._profiles = new Map<string, any>();
    this._clauses = new Map<string, any>();
  }

  private addEntity(entity: any): void {
    const _type = entity[RDF.TYPE][0]["@id"];

    // add entities
    this.entities.set(entity["@id"], entity);

    // entitiesTypes - useful for filtering
    if (!this._entityTypes.includes(_type)) {
      this._entityTypes.push(_type);
    }

    // instantiate profiles
    if (_type === IM.PROFILE) {
      this._profiles.set(entity["@id"], new Profile(entity));
    }
  }

  // loads JSON file

  load(entities: any): void {
    try {
      //if json parse
      if (typeof entities == "string") {
        entities = JSON.parse(entities);
      }

      if (Array.isArray(entities)) {
        // all entities in array
        entities.forEach((entity: any) => this.addEntity(entity));
      } else {
        // single entity
        this.addEntity(entities);
      }
    } catch (error) {
      console.log("Error loading  :", error);
    }
  }
}

// Entity
class Entity {
  public "@id"?: string | null;
  public "http://www.w3.org/2000/01/rdf-schema#label"?: string | null;
  public "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"?: Entity | null;
  public "http://www.w3.org/2000/01/rdf-schema#comment"?: string | null;
  public "http://endhealth.info/im#isContainedIn"?: Entity | null;

  constructor(entity?: any);
  constructor(entity: any) {
    this["@id"] = entity["@id"] ? entity["@id"] : "";
    this["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] = entity["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]
      ? (entity["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] as Entity)
      : null;
    this["http://www.w3.org/2000/01/rdf-schema#label"] = entity["http://www.w3.org/2000/01/rdf-schema#label"]
      ? entity["http://www.w3.org/2000/01/rdf-schema#label"]
      : "";
    this["http://www.w3.org/2000/01/rdf-schema#comment"] = entity["http://www.w3.org/2000/01/rdf-schema#comment"]
      ? entity["http://www.w3.org/2000/01/rdf-schema#comment"]
      : "";
    this["http://endhealth.info/im#isContainedIn"] = entity["http://endhealth.info/im#isContainedIn"]
      ? (entity["http://endhealth.info/im#isContainedIn"] as Entity)
      : null;
    return this;
  }
}

// Profile\\\\\
export class Profile extends Entity {
  public "http://endhealth.info/im#definition"?: any | null;
  public "entityReferences" = [];
  public "entitiesWithoutData" = [];

  // constructor(entity?: any);
  // constructor(entity: any) {
  //   super(entity);

  //   //parse definition
  //   if (entity["http://endhealth.info/im#definition"] && (typeof entity["http://endhealth.info/im#definition"] == 'string')) {
  //     try {
  //       const _definition = JSON.parse(entity["http://endhealth.info/im#definition"]);
  //       this["http://endhealth.info/im#definition"] = _definition;
  //       this["entityReferences"] = entity?.entityReferences;
  //       // populate definitionTree (this is the UI's object model and maps 1 to 1 onto Profiles written in RDF)
  //       this.convertToDefinitionTree(_definition);
  //     } catch (e) {
  //       console.log("Definition is not valid JSON");
  //     }
  //   }

  //   return this;
  // }

  get mainEntity(): any {
    return this["http://endhealth.info/im#definition"]["entityType"];
  }
  set mainEntity(value: any) {
    this["http://endhealth.info/im#definition"].entityType = value;
  }

  private _definitionTree: any;
  get definitionTree(): any {
    return this._definitionTree;
  }

  private getChildren(parent: any, _operators: string[]) {
    //match clauses don't have "children"
    if (parent.type == "match") {
      return null;
    }

    let _key = Object.keys(parent.json).filter((item: string) => _operators.includes(item))[0];
    let _children = parent.json[_key];

    _children = _children.map((item: any, index: number) => {
      const _isMatchClause = item["property"] || item["pathTo"];

      let _childKey = Object.keys(item).filter((item: string) => _operators.includes(item))[0];
      let _name;
      let _include;
      let _currentKey;
      let _childPath;
      let _currentPath;

      if (_isMatchClause) {
        _name = "";
        _include = !item["notExist"];
        _currentKey = `[${_childKey}]`;
        _childPath = "";
      } else {
        _name = _childKey;
        _include = _childKey == "not" ? false : true;
        _currentKey = `[${index}]`;
        _childPath = parent.childPath + `[${index}]` + `[${_childKey}]`;
      }

      if (parent.currentPath == "") {
        _currentPath = `children[${index.toString()}]`;
      } else {
        _currentPath = `${parent["currentPath"]}.children[${index.toString()}]`;
      }

      return {
        uuid: `urn:uuid:${uuid()}`,
        type: _isMatchClause ? "match" : "operator",
        include: _include,
        name: _name,
        currentPath: _currentPath,
        originalName: `[${index}]`,
        originalLocation: parent.childPath + `[${index}]`,
        childPath: _childPath,
        json: item,
        templates: [],
        children: []
      };
    });

    return _children;
  }

  private convertToDefinitionTree(definition: any): void {
    let _definitionTree: any[] = [];

    const _operators = ["and", "or", "not"];

    // change rdf to UI-model
    // only works if the first clause in the definition is wrapped with and: [] / or: []
    const _keys = Object.keys(definition);

    for (const key of _keys) {
      if (_operators.includes(key)) {
        _definitionTree.push({
          uuid: `urn:uuid:${uuid()}`,
          type: "operator",
          include: key != "not",
          name: key,
          currentPath: `[${_definitionTree.length}]`,
          originalName: `[${key}]`,
          originalLocation: "",
          childPath: `[${key}]`,
          json: definition,
          templates: [],
          children: []
        });
      }
    }

    if (!_definitionTree.length) {
      console.error("JSON Profile Definition must contain and 'and' or 'or' operator clause at the root of the definition");
      return;
    }

    this._definitionTree = this.addChildrenToDefinitionTree(_definitionTree, _operators);

    console.log("UI object model (Profile.definitionTree)", _definitionTree);
  }

  private addChildrenToDefinitionTree(_definitionTree: any[], _operators: string[]) {
    //recursive addition of json clauses and their children to the definition tree:
    const _queue = _.cloneDeep(_definitionTree); //adds top level operator clauses to the queue
    while (_queue.length > 0) {
      const _currentItem = _queue.shift(); // gets the next item from the queue
      let _children = this.getChildren(_currentItem, _operators);

      // add children to .children[] key in new object-model
      if (_children && _currentItem["currentPath"] == "") {
        // root path
        _.set(_definitionTree, "children", _children);
      } else if (_children) {
        // all other paths
        _.set(_definitionTree, _currentItem["currentPath"] + ".children", _children);
      }

      // pushes children to queue if they're not match clauses
      if (_children && _children.length) {
        for (const _child of _children) {
          const _isMatchClause = _child["property"] || _child["pathTo"];
          if (!_isMatchClause) {
            _queue.push(_child);
          }
        }
      }
    }
    return _definitionTree;
  }

  public toTemplates(clausePath: string): any {
    return toTemplates(this.mainEntity, this._definitionTree, clausePath);
  }

  get asString(): string {
    //stringified
    return JSON.stringify(this);
    // if prettification is desired e.g. for tex editor
    // return QueryUtils.prettifyJSON(JSON.stringify(this));
  }

  //#todo create json() getter to return Profile in RDF format for storage, ensure http://endhealth.info/im#definition is JSONified
}
