import { beforeAll, afterAll, afterEach, it, expect, beforeEach, describe } from "vitest";
import { setupServer } from "msw/node";

const restHandlers: any[] = [];
export const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
