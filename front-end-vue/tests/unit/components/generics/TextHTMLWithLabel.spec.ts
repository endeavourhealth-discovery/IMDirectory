import { shallowMount } from "@vue/test-utils";
import TextHTMLWithLabel from "@/components/generics/TextHTMLWithLabel.vue";

describe("TextHTMLWithLabel.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(TextHTMLWithLabel, {
      props: { label: "Description", data: "An entry recording information about a criticial care encounter.<p>common data model attributes for Critical care encounter", size: "100%", id: "TextHTMLWithLabel1" }
    });
  });

  it("can create convertedText", () => {
    expect(wrapper.vm.convertedText).toEqual("<p class='TextHTMLWithLabel1-p'>An entry recording information about a criticial care encounter.</p><p class='TextHTMLWithLabel1-p'>common data model attributes for Critical care encounter</p>");
  });
});

describe("TextHTMLWithLabel.vue ___ descContainer", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(TextHTMLWithLabel, {
      props: { label: "Description", data: "An entry recording information about a criticial care encounter.<p>common data model attributes for Critical care encounter", size: "100%", id: "TextHTMLWithLabel1" }
    });
  });

  it("can create convertedText", () => {
    expect(wrapper.vm.convertedText).toEqual("<p class='TextHTMLWithLabel1-p'>An entry recording information about a criticial care encounter.</p><p class='TextHTMLWithLabel1-p'>common data model attributes for Critical care encounter</p>");
    expect(wrapper.get(".text-html-container").html()).toEqual('<div class=\"text-html-container\" id=\"TextHTMLWithLabel1\"><p class=\"TextHTMLWithLabel1-p\">An entry recording information about a criticial care encounter.</p><p class=\"TextHTMLWithLabel1-p\">common data model attributes for Critical care encounter</p></div>');
  });

  it("can render data", () => {
    const label = wrapper.get(".label");
    expect(label.text()).toBe("Description:");
    expect(wrapper.get(".text-html-container").html()).toEqual('<div class=\"text-html-container\" id=\"TextHTMLWithLabel1\"><p class=\"TextHTMLWithLabel1-p\">An entry recording information about a criticial care encounter.</p><p class=\"TextHTMLWithLabel1-p\">common data model attributes for Critical care encounter</p></div>');
  });
});

describe("TextHTMLWithLabel.vue ___ id", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(TextHTMLWithLabel, {
      props: { label: "Description", data: undefined, size: "100%", id: undefined }
    });
  });

  it("can create convertedText", () => {
    expect(wrapper.vm.convertedText).toBe("");
  });

  it("renders data", () => {
    const label = wrapper.get(".label");
    expect(label.text()).toBe("Description:");
    expect(wrapper.get(".text-html-container").html()).toEqual("<span class=\"text-html-container\">None</span>");
  });
});

describe("TextHTMLWithLabel.vue ___ no data", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(TextHTMLWithLabel, {
      props: { label: "Description", data: undefined, size: "100%", id: "TextHTMLWithLabel1" }
    });
  });

  it("can create convertedText", () => {
    expect(wrapper.vm.convertedText).toBe("");
  });

  it("renders data", () => {
    const label = wrapper.get(".label");
    expect(label.text()).toBe("Description:");
    expect(wrapper.get(".text-html-container").html()).toEqual("<span class=\"text-html-container\">None</span>");
  });
});


describe("TextHTMLWithLabel.vue ___ <p> start and end", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(TextHTMLWithLabel, {
      props: { label: "Description", data: "<p>An entry recording information about a criticial care encounter.<p>common data model attributes for Critical care encounter<p>", size: "100%", id: "TextHTMLWithLabel1" }
    });
  });

  it("can create convertedText", () => {
    expect(wrapper.vm.convertedText).toBe("<p class='TextHTMLWithLabel1-p'>An entry recording information about a criticial care encounter.</p><p class='TextHTMLWithLabel1-p'>common data model attributes for Critical care encounter</p>");
  });

  it("renders data", () => {
    const label = wrapper.get(".label");
    expect(label.text()).toBe("Description:");
    expect(wrapper.get(".text-html-container").html()).toEqual("<div class=\"text-html-container\" id=\"TextHTMLWithLabel1\"><p class=\"TextHTMLWithLabel1-p\">An entry recording information about a criticial care encounter.</p><p class=\"TextHTMLWithLabel1-p\">common data model attributes for Critical care encounter</p></div>");
  });
});
