import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { vi } from "vitest";
import { createTestingPinia } from '@pinia/testing'

export function createTestRouter(routes?: RouteRecordRaw[], mockPush?: any, mockGo?: any, mockBack?: any, mockForward?: any) {
  const router = createRouter({ routes: routes || [], history: createWebHashHistory() });
  router.push = mockPush || vi.fn();
  router.go = mockGo || vi.fn();
  router.back = mockBack || vi.fn();
  router.forward = mockForward || vi.fn();
  return router;
}

export function mountComposable(composable: any, initialState?: any, mockRouter?: any) {
  const TestComponent = defineComponent({
    setup() {
      return { ...composable() };
    },
    template: "<template></template>"
  });

  createTestingPinia({initialState: { root: initialState}});

  if (mockRouter)
    return mount(TestComponent, {
      global: {
        plugins: [mockRouter]
      }
    });
  else return mount(TestComponent);
}

export default { createTestRouter, mountComposable };
