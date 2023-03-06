import ECLVisitor from "./ECLVisitor";
import { isObjectHasKeys } from "../../helpers/DataTypeCheckers";
import _ from "lodash";
import { IM, SNOMED } from "@im-library/vocabulary";

const showLogs = false;

export default class ECLBuilderVisitor extends ECLVisitor {
  constructor() {
    super();
  }

  visitEcl(ctx) {
    if (showLogs) {
      console.log("found ecl");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup", conjunction: "AND" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (result && isObjectHasKeys(result, ["type"]) && result.type === "BoolGroup") build = result;
          else if (isObjectHasKeys(result)) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitExpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found expression constraint");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["type"]) && result.type === "Concept") {
            if (!isObjectHasKeys(result, ["items"])) result.items = [];
            if (!isObjectHasKeys(result, ["conjunction"])) result.conjunction = "AND";
            if (!isObjectHasKeys(result, ["descendants"])) result.descendants = "";
          }
          if (isObjectHasKeys(result)) return result;
        }
      }
    }
  }

  visitRefinedexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found refined expression constraint");
      console.log(ctx.getText());
    }
    let build = {};
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["type"])) {
          if (result.type === "Concept") build = result;
          if (result.type === "Refinement") build.items = [result];
          if (result.type === "BoolGroup") {
            build.conjunction = result.conjunction;
            build.items = result.items;
          }
        }
      }
    }
    return build;
  }

  visitCompoundexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found compound expression constraint");
      console.log(ctx.getText());
    }
    return this.visitChildren(ctx)[0];
  }

  visitConjunctionexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found conjunction expression constraint");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"]) && !isObjectHasKeys(result, ["type"])) build.conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitDisjunctionexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found disjunction expression constraint");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"]) && !isObjectHasKeys(result, ["type"])) build.conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitExclusionexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found exclusion expression constraint");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"]) && !isObjectHasKeys(result, ["type"])) build.conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitDottedexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found dotted expression constraint");
      console.log(ctx.getText());
    }
    this.visitChildren(ctx);
  }

  visitDottedexpressionattribute(ctx) {
    if (showLogs) {
      console.log("found dotted expression attribute");
      console.log(ctx.getText());
    }
    this.visitChildren(ctx);
  }

  visitSubexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found sub expression constraint");
      console.log(ctx.getText());
    }
    let build = { type: "Concept" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["constraint"])) build.descendants = result.constraint ? result.constraint : "";
          if (isObjectHasKeys(result, ["conceptReference"])) {
            build.concept = {};
            build.concept.iri = result.conceptReference;
          }
        }
      }
    }
    return build;
  }

  visitBracketcompoundexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found bracket compound expression constraint");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) {
            return result;
          }
        }
      }
    }
  }

  visitConstraintoperator(ctx) {
    if (showLogs) {
      console.log("found constraintOperator");
      console.log(ctx.getText());
    }
    if (ctx.children) return { constraint: this.visitChildren(ctx)[0] };
  }

  visitDescendantof(ctx) {
    if (showLogs) {
      console.log("found descendantOf");
      console.log(ctx.getText());
    }
    return "<";
  }

  visitDescendantorselfof(ctx) {
    if (showLogs) {
      console.log("found descendantOrSelfOf");
      console.log(ctx.getText());
    }
    return "<<";
  }

  visitAncestorof(ctx) {
    if (showLogs) {
      console.log("found ancestorOf");
      console.log(ctx.getText());
    }
    return ">";
  }

  visitAncestororselfof(ctx) {
    if (showLogs) {
      console.log("found ancestorOrSelfOf");
      console.log(ctx.getText());
    }
    return ">>";
  }

  visitChildof(ctx) {
    if (showLogs) {
      console.log("found childOf");
      console.log(ctx.getText());
    }
    return "<!";
  }

  visitParentof(ctx) {
    if (showLogs) {
      console.log("found parentOf");
      console.log(ctx.getText());
    }
    return ">!";
  }

  visitEclfocusconcept(ctx) {
    if (showLogs) {
      console.log("found ecl focus concept");
      console.log(ctx.getText());
    }
    if (ctx.children) return { conceptReference: this.visitChildren(ctx)[0] };
  }

  visitEclconceptreference(ctx) {
    if (showLogs) {
      console.log("found ecl concept reference");
      console.log(ctx.getText());
    }
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitConceptid(ctx) {
    if (showLogs) {
      console.log("found concept id");
      console.log(ctx.getText());
    }
    const code = ctx.getText();
    let iri = code;
    if (code.match(/^[0-9]+$/)) {
      if (code.match(/1000252/g)) iri = IM.NAMESPACE + code;
      else iri = SNOMED.NAMESPACE + code;
    }
    return iri;
  }

  visitWildcard(ctx) {
    if (showLogs) {
      console.log("found wildcard");
      console.log(ctx.getText());
    }
    return ctx.getText();
  }

  visitEclrefinement(ctx) {
    if (showLogs) {
      console.log("found ecl refinement");
      console.log(ctx.getText());
    }
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitCompoundrefinementset(ctx) {
    if (showLogs) {
      console.log("found compound refinement set");
      console.log(ctx.getText());
    }
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitConjunctionrefinementset(ctx) {
    if (showLogs) {
      console.log("found conjunction refinement set");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["conjunction"]) && !isObjectHasKeys(result, ["type"])) {
          if (build.conjunction && build.conjunction !== result.conjunction)
            throw new Error("Conjunction differs from other conjunctions within refinement set. Logic requires bracketted conjunctions.");
          else build.conjunction = result.conjunction;
        }
        if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
          if (build.items && _.isArray(build.items)) build.items.push(result);
          else build.items = [result];
        }
      }
    }
    return build;
  }

  visitDisjunctionrefinementset(ctx) {
    if (showLogs) {
      console.log("found disjunction refinement set");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["conjunction"]) && !isObjectHasKeys(result, ["type"])) {
          if (build.conjunction && build.conjunction !== result.conjunction)
            throw new Error("Conjunction differs from other conjunctions within refinement set. Logic requires bracketted conjunctions.");
          else build.conjunction = result.conjunction;
        }
        if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
          if (build.items && _.isArray(build.items)) build.items.push(result);
          else build.items = [result];
        }
      }
    }
    return build;
  }

  visitConjunction(ctx) {
    if (showLogs) {
      console.log("found conjunction");
      console.log(ctx.getText());
    }
    return { conjunction: "AND" };
  }

  visitDisjunction(ctx) {
    if (showLogs) {
      console.log("found disjunction");
      console.log(ctx.getText());
    }
    return { conjunction: "OR" };
  }

  visitExclusion(ctx) {
    if (showLogs) {
      console.log("found exclusion");
      console.log(ctx.getText());
    }
    return { conjunction: ctx.getText() };
  }

  visitSubrefinement(ctx) {
    if (showLogs) {
      console.log("found sub refinement");
      console.log(ctx.getText());
    }
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitDot(ctx) {
    if (showLogs) {
      console.log("dot found");
      console.log(ctx.getText());
    }
    throw new Error("Dot '.' is not currently supported.");
  }

  visitMemberof(ctx) {
    throw new Error("'^/memberOf' is not currently supported");
  }

  visitCardinality(ctx) {
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    if (showLogs) {
      console.log("found ecl attribute group");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) return result;
        }
      }
    }
  }

  visitCompoundattributeset(ctx) {
    if (showLogs) {
      console.log("found compount attribute set");
      console.log(ctx.getText());
    }
    return this.visitChildren(ctx)[0];
  }

  visitConjunctionattributeset(ctx) {
    if (showLogs) {
      console.log("found conjunction attribute set");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
            if (build.items && _.isArray(build.items)) build.items.push(result);
            else build.items = [result];
          }
        }
      }
    }
    return build;
  }

  visitDisjunctionattributeset(ctx) {
    if (showLogs) {
      console.log("found disjunction attribute set");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
            if (build.items && _.isArray(build.items)) build.items.push(result);
            else build.items = [result];
          }
        }
      }
    }
    return build;
  }

  visitBracketattributeset(ctx) {
    if (showLogs) {
      console.log("found bracket attribute set");
      console.log(ctx.getText());
    }
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) {
            build.items = [result];
          }
        }
      }
    }
  }

  visitSubattributeset(ctx) {
    if (showLogs) {
      console.log("found sub attribute set");
      console.log(ctx.getText());
    }
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitEclattribute(ctx) {
    if (showLogs) {
      console.log("found ecl attribute");
      console.log(ctx.getText());
    }
    let build = { type: "Refinement" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["type"]) && result.type === "Concept")
            build.property = { descendants: result.descendants ? result.descendants : "", concept: result.concept };
          if (isObjectHasKeys(result, ["value"])) {
            build.value = result.value;
            build.operator = result.operator;
          }
        }
      }
    }
    return build;
  }

  visitEclattributeexpressionvalue(ctx) {
    if (showLogs) {
      console.log("found ecl attribute expression value");
      console.log(ctx.getText());
    }
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) build.operator = result.operator;
          if (isObjectHasKeys(result, ["type"]) && result.type === "Concept") {
            build.value.descendants = result.descendants ? result.descendants : "";
            build.value.concept = result.concept;
          }
        }
      }
    }
    return build;
  }

  visitEclattributestringvalue(ctx) {
    if (showLogs) {
      console.log("found ecl attribute string value");
      console.log(ctx.getText());
    }
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) build.operator = result.operator;
          if (isObjectHasKeys(result, ["text"])) {
            build.value.concept = { iri: result.text };
          }
        }
      }
    }
    return build;
  }

  visitEclattributenumbervalue(ctx) {
    if (showLogs) {
      console.log("found ecl attribute number value");
      console.log(ctx.getText());
    }
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) build.operator = result.operator;
          if (isObjectHasKeys(result, ["number"])) {
            build.value.concept = { iri: result.number };
          }
        }
      }
    }
    return build;
  }

  visitExpressioncomparisonoperator(ctx) {
    if (showLogs) {
      console.log("found expression comparison operator");
      console.log(ctx.getText());
    }
    return { operator: ctx.getText() };
  }

  visitStringcomparisonoperator(ctx) {
    if (showLogs) {
      console.log("found string comparison operator");
      console.log(ctx.getText());
    }
    return { operator: ctx.getText() };
  }

  visitStringvalue(ctx) {
    if (showLogs) {
      console.log("found string value");
      console.log(ctx.getText());
    }
    return { text: ctx.getText() };
  }

  visitNumericcomparisonoperator(ctx) {
    if (showLogs) {
      console.log("found numeric comparison operator");
      console.log(ctx.getText());
    }
    return { operator: ctx.getText() };
  }

  visitNumericvalue(ctx) {
    if (showLogs) {
      console.log("found numeric value");
      console.log(ctx.getText());
    }
    return { number: ctx.getText() };
  }

  visitBracketsubrefinement(ctx) {
    if (showLogs) {
      console.log("found bracket sub refinement");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (result) return result;
      }
    }
  }
  process;
}
