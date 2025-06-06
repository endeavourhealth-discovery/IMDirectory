import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";

export function createTestRouter(routes?: RouteRecordRaw[], mockPush?: any, mockGo?: any, mockBack?: any, mockForward?: any) {
  const router = createRouter({
    routes: routes || [{ name: "Home", path: "/", component: defineComponent({ template: "<template></template>" }) }],
    history: createWebHashHistory()
  });
  router.push = mockPush || vi.fn();
  router.go = mockGo || vi.fn();
  router.back = mockBack || vi.fn();
  router.forward = mockForward || vi.fn();
  return router;
}

function createTestComponent(composable: any, composableInputs: any[] = []) {
  return defineComponent({
    setup() {
      return { ...composable(...composableInputs) };
    },
    template: "<template></template>"
  });
}

export function mountComposable(composable: any, composableInputs?: any[], initialState?: any, mockRouter?: any) {
  const TestComponent = createTestComponent(composable, composableInputs);
  if (mockRouter)
    return mount(TestComponent, {
      global: {
        plugins: [mockRouter, createTestingPinia({ initialState: initialState })]
      }
    });
  else return mount(TestComponent, { global: { plugins: [createTestRouter(), createTestingPinia({ initialState: initialState })] } });
}

export default { createTestRouter, mountComposable };
