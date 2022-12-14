import { byScheme, byPriority, byLabel, byName, byPosition, byOrder } from "@/helpers/Sorters";

describe("Sorters", () => {
  describe("byScheme", () => {
    it("can get byScheme ___ 1", () => {
      expect(byScheme({ scheme: "snomed" }, { scheme: "im" })).toBe(1);
    });

    it("can get byScheme ___ -1", () => {
      expect(byScheme({ scheme: "im" }, { scheme: "snomed" })).toBe(-1);
    });

    it("can get byScheme ___ 0", () => {
      expect(byScheme({ scheme: "im" }, { scheme: "im" })).toBe(0);
    });

    it("can get byScheme ___ missing key a", () => {
      expect(byScheme({ priority: "snomed" }, { scheme: "im" })).toBe(0);
    });

    it("can get byScheme ___ missing key b", () => {
      expect(byScheme({ scheme: "snomed" }, { priority: "im" })).toBe(0);
    });

    it("can get byScheme ___ missing both", () => {
      expect(byScheme({ priority: "snomed" }, { priority: "im" })).toBe(0);
    });
  });

  describe("byPriority", () => {
    it("can get bypriority ___ 1", () => {
      expect(byPriority({ priority: 9 }, { priority: 7 })).toBe(1);
    });

    it("can get bypriority ___ -1", () => {
      expect(byPriority({ priority: 7 }, { priority: 10 })).toBe(-1);
    });

    it("can get bypriority ___ 0", () => {
      expect(byPriority({ priority: 2 }, { priority: 2 })).toBe(0);
    });

    it("can get byPriority ___ missing key a", () => {
      expect(byPriority({ scheme: 7 }, { priority: 9 })).toBe(0);
    });

    it("can get byPriority ___ missing key b", () => {
      expect(byPriority({ priority: 7 }, { scheme: 9 })).toBe(0);
    });

    it("can get byPriority ___ missing both", () => {
      expect(byPriority({ scheme: 7 }, { scheme: 9 })).toBe(0);
    });
  });

  describe("byLabel", () => {
    it("can get byLabel ___ 1", () => {
      expect(byLabel({ label: "scoliosis" }, { label: "encounter" })).toBe(1);
    });

    it("can get bylabel ___ -1", () => {
      expect(byLabel({ label: "encounter" }, { label: "scoliosis" })).toBe(-1);
    });

    it("can get byLabel ___ 0", () => {
      expect(byLabel({ label: "encounter" }, { label: "encounter" })).toBe(0);
    });

    it("can get byLabel ___ missing key a", () => {
      expect(byLabel({ scheme: "encounter" }, { label: "scoliosis" })).toBe(0);
    });

    it("can get byLabel ___ missing key b", () => {
      expect(byLabel({ label: "encounter" }, { scheme: "scoliosis" })).toBe(0);
    });

    it("can get byLabel ___ missing both", () => {
      expect(byLabel({ scheme: "scoliosis" }, { scheme: "encounter" })).toBe(0);
    });
  });

  describe("byName", () => {
    it("can get byName ___ 1", () => {
      expect(byName({ name: "scoliosis" }, { name: "encounter" })).toBe(1);
    });

    it("can get byName ___ -1", () => {
      expect(byName({ name: "encounter" }, { name: "scoliosis" })).toBe(-1);
    });

    it("can get byName ___ 0", () => {
      expect(byLabel({ name: "encounter" }, { name: "encounter" })).toBe(0);
    });

    it("can get byName ___ missing key a", () => {
      expect(byLabel({ label: "encounter" }, { name: "scoliosis" })).toBe(0);
    });

    it("can get byName ___ missing key b", () => {
      expect(byLabel({ name: "encounter" }, { scheme: "scoliosis" })).toBe(0);
    });

    it("can get byName ___ missing both", () => {
      expect(byLabel({ scheme: "scoliosis" }, { scheme: "encounter" })).toBe(0);
    });
  });

  describe("byPosition", () => {
    it("can get byPosition ___ 1", () => {
      expect(byPosition({ position: 9 }, { position: 7 })).toBe(1);
    });

    it("can get byPosition ___ -1", () => {
      expect(byPosition({ position: 7 }, { position: 10 })).toBe(-1);
    });

    it("can get byPosition ___ 0", () => {
      expect(byPosition({ position: 2 }, { position: 2 })).toBe(0);
    });

    it("can get byPosition ___ missing key a", () => {
      expect(byPosition({ scheme: 7 }, { position: 9 })).toBe(0);
    });

    it("can get byPriority ___ missing key b", () => {
      expect(byPosition({ position: 7 }, { scheme: 9 })).toBe(0);
    });

    it("can get byPriority ___ missing both", () => {
      expect(byPosition({ scheme: 7 }, { scheme: 9 })).toBe(0);
    });
  });

  describe("byOrder", () => {
    it("can get byOrder ___ 1", () => {
      expect(byOrder({ order: 9 }, { order: 7 })).toBe(1);
    });

    it("can get byOrder ___ -1", () => {
      expect(byOrder({ order: 7 }, { order: 10 })).toBe(-1);
    });

    it("can get byOrder ___ 0", () => {
      expect(byOrder({ order: 2 }, { order: 2 })).toBe(0);
    });

    it("can get byOrder ___ missing key a", () => {
      expect(byOrder({ scheme: 7 }, { order: 9 })).toBe(0);
    });

    it("can get byOrder ___ missing key b", () => {
      expect(byOrder({ order: 7 }, { scheme: 9 })).toBe(0);
    });

    it("can get byOrder ___ missing both", () => {
      expect(byOrder({ scheme: 7 }, { scheme: 9 })).toBe(0);
    });
  });
});
