import { vi } from "vitest";

const vm = vi.mock("@/main", () => {
  return {
    default: {
      $configService: {
        getXmlSchemaDataTypes: vi.fn(),
        getFilterDefaults: vi.fn()
      }
    }
  };
});

module.exports = vm;
