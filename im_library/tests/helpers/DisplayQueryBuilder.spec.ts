import { describe, expect, it } from "vitest";
import { buildDisplayQuery } from "@/helpers/DisplayQueryBuilder";
import { Q_RegisteredGMS, SMIPopulation, Priority1, Priority3a, Priority3b } from "./DisplayQueryBuilder.testData";

describe("DisplayQueryBuilder.ts ___", () => {
  describe("buildDisplayQuery", () => {
    it("can convert Q_RegisteredGMS definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Q_RegisteredGMS.definition);
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
    it("can convert Priority1 definition to DisplayQuery nodes", () => {
      const nodes = buildDisplayQuery(Priority1.definition);
      expect(nodes).toEqual(Priority1.nodes);
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
});
