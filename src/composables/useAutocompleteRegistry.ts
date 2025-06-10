type AutocompleteEntry = {
  element: HTMLElement;
  reset: () => void;
};

const autocompletes = new Map<HTMLElement, () => void>();

export function registerAutocomplete(entry: AutocompleteEntry) {
  autocompletes.set(entry.element, entry.reset);
}

export function unregisterAutocomplete(element: HTMLElement) {
  autocompletes.delete(element);
}

export function handleFocusChange(newFocusedElement: HTMLElement | null) {
  for (const [element, resetFn] of autocompletes.entries()) {
    if (newFocusedElement && !element.contains(newFocusedElement)) {
      resetFn();
    }
  }
}
