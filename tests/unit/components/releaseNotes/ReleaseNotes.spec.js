import { shallowMount } from "@vue/test-utils";
import ReleaseNotes from "@/components/releaseNotes/ReleaseNotes.vue";
import { describe, test, expect } from "vitest";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { setupServer } from "msw/node";

describe("Release notes dialog test", () => {
  const restHandlers = [];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  let wrapper;

  function init(localStorageVersion) {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => localStorageVersion);

    wrapper = shallowMount(ReleaseNotes, {
      data() {
        return {
          release: {
            version: 1.0
          }
        };
      },
      global: {
        components: { Button, Dialog }
      }
    });
  }

  test("Displays when no local storage", () => {
    init(null);
    expect(wrapper.vm.showRelNotes).toBeTruthy();
  });

  test("Displays when lower version", () => {
    init("0.9");
    expect(wrapper.vm.showRelNotes).toBeTruthy();
  });

  test("Does not display when same version", () => {
    init("1.0");
    expect(wrapper.vm.showRelNotes).toBeFalsy();
  });

  test("Does not display when higher version", () => {
    init("1.1");
    expect(wrapper.vm.showRelNotes).toBeFalsy();
  });
});
