import { render } from "@testing-library/vue";
import { beforeEach, describe, it } from "vitest";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

const mockDispatch = vi.fn();
const mockState = {};
const mockCommit = vi.fn();

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    state: mockState,
    commit: mockCommit
  })
}));

describe("Home.vue", () => {
  let component;

  beforeEach(() => {
    component = render(DirectorySplitter, {
      global: { components: { Splitter, SplitterPanel }, stubs: ["router-view", "InfoSideBar", "NavTree"] }
    });
  });

  it("mounts", () => {
    component.getByTestId("splitter-right");
    component.getByTestId("splitter-left");
  });
});
