import type { SearchResponse } from "@endeavour/vue-library/models";

import { describe, expect, it } from "vitest";

import { compareMembers, isTruncated } from "@/helpers/MemberComparison";

function response(names: string[], totalCount?: number): SearchResponse {
  return {
    totalCount,
    entities: names.map(name => ({ iri: "http://snomed.info/sct#" + name, name, type: [] }))
  };
}

describe("compareMembers", () => {
  it("flags added, removed and unchanged members by iri", () => {
    const result = compareMembers(response(["b", "a", "c"]), response(["c", "d", "a"]));
    expect(result.added).toBe(1);
    expect(result.removed).toBe(1);
    expect(result.unchanged).toBe(2);
    expect(result.current.map(m => [m.name, m.change])).toEqual([
      ["a", "unchanged"],
      ["b", "removed"],
      ["c", "unchanged"]
    ]);
    expect(result.updated.map(m => [m.name, m.change])).toEqual([
      ["a", "unchanged"],
      ["c", "unchanged"],
      ["d", "added"]
    ]);
  });

  it("handles missing responses", () => {
    expect(compareMembers(undefined, undefined)).toEqual({ current: [], updated: [], added: 0, removed: 0, unchanged: 0 });
    expect(compareMembers(undefined, response(["a"])).added).toBe(1);
    expect(compareMembers(response(["a"]), {}).removed).toBe(1);
  });

  it("ignores duplicate iris", () => {
    const result = compareMembers(response(["a", "a"]), response(["a", "a", "b"]));
    expect(result.current).toHaveLength(1);
    expect(result.updated).toHaveLength(2);
    expect(result.unchanged).toBe(1);
    expect(result.added).toBe(1);
  });
});

describe("isTruncated", () => {
  it("is true only when totalCount exceeds the returned members", () => {
    expect(isTruncated(response(["a", "b"], 5))).toBe(true);
    expect(isTruncated(response(["a", "b"], 2))).toBe(false);
    expect(isTruncated(response(["a", "b"]))).toBe(false);
    expect(isTruncated(undefined)).toBe(false);
  });
});
