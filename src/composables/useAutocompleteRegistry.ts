import { ref } from "vue";

export function useAutocompleteRegistry() {
  type AutocompleteEntry = {
    element: HTMLElement;
    reset: () => void;
  };

  const autocompletes = ref(new Map<HTMLElement, () => void>());

  function registerAutocomplete(entry: AutocompleteEntry) {
    autocompletes.value.set(entry.element, entry.reset);
  }

  function unregisterAutocomplete(element: HTMLElement) {
    autocompletes.value.delete(element);
  }

  function handleFocusChange(newFocusedElement: HTMLElement | null) {
    for (const [element, resetFn] of autocompletes.value.entries()) {
      if (newFocusedElement && !element.contains(newFocusedElement)) {
        resetFn();
      }
    }
  }
  return {
    registerAutocomplete,
    unregisterAutocomplete,
    handleFocusChange
  };
}
