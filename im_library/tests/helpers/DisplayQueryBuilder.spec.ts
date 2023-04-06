import { describe, expect, it } from "vitest";
import { buildDisplayQuery } from "@/helpers/DisplayQueryBuilder";
import { Q_RegisteredGMS, SMIPopulation, Priority3a, Priority3b, Aged1664, Query_AllowableProperties } from "./DisplayQueryBuilder.testData";

describe("DisplayQueryBuilder.ts ___", () => {
  describe("buildDisplayQuery", () => {
    it("can convert Q_RegisteredGMS definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Q_RegisteredGMS.definition);
      console.log(JSON.stringify(nodes));
      expect(nodes).toStrictEqual(Q_RegisteredGMS.nodes);
    });
  });

  describe("buildDisplayQuery", () => {
    it("can convert SMIPopulation definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(SMIPopulation.definition);
      expect(nodes).toEqual(SMIPopulation.nodes);
    });
  });

  describe("buildDisplayQuery", () => {
    it("can convert Priority3a definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Priority3a.definition);
      expect(nodes).toEqual(Priority3a.nodes);
    });
  });

  describe("buildDisplayQuery", () => {
    it("can convert Priority3b definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Priority3b.definition);
      expect(nodes).toEqual(Priority3b.nodes);
    });
  });

  describe("buildDisplayQuery", () => {
    it("can convert Aged1664 definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Aged1664.definition);
      expect(nodes).toEqual(Aged1664.nodes);
    });
  });

  describe("buildDisplayQuery", () => {
    it("can convert Aged1664 definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Query_AllowableProperties.definition);
      expect(nodes).toEqual(Query_AllowableProperties.nodes);
    });
  });
});
