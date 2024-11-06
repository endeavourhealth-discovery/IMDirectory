import { getContainerElementOptimalHeight } from "@/helpers/ContainerDimensionGetters";

describe("GetContainerElementOptimalHeight", () => {
  let mockElement;
  let docSpy;
  let windowSpy;

  beforeEach(() => {
    vi.resetAllMocks();
    windowSpy = vi.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue("16px")
    });

    mockElement = document.createElement("div");
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100, width: 100 });

    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);
  });

  it("gets height ___ no container", () => {
    expect(getContainerElementOptimalHeight("container-id", ["element-1-class", "element-2-class"], false)).toBe("");
  });

  it("gets height ___ no class elements", () => {
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(mockElement);
    expect(getContainerElementOptimalHeight("container-id", ["element-1-class", "element-2-class"], false)).toBe("100px");
  });

  it("gets height ___ class elements", () => {
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    expect(getContainerElementOptimalHeight("container-id", ["element-1-class", "element-2-class"], false)).toBe("-100px");
  });

  it("gets height ___ class elements ___ rem and additional pixels", () => {
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    expect(getContainerElementOptimalHeight("container-id", ["element-1-class", "element-2-class"], true, 2, 40)).toBe("-172px");
  });

  it("gets height ___ class elements ___ rem and additional pixels", () => {
    windowSpy.mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(undefined)
    });
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    expect(getContainerElementOptimalHeight("container-id", ["element-1-class", "element-2-class"], true, 2, 40)).toBe("-140px");
  });
});
