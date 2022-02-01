export function getContainerElementOptimalHeight(
  containerId: string,
  siblingClasses: string[],
  includeRemPadding: boolean,
  remPaddingQuantity?: number,
  additionalPixels?: number
): string {
  let height = 0;
  const container = document.getElementById(containerId) as HTMLElement;
  if (!container) return "";
  height += container.getBoundingClientRect().height;
  for (const subClass of siblingClasses) {
    const classElement = container.getElementsByClassName(subClass)[0] as HTMLElement;
    if (classElement) height -= classElement.getBoundingClientRect().height;
  }
  if (includeRemPadding && remPaddingQuantity) {
    const currentFontSize = parseFloat(window.getComputedStyle(document.documentElement, null).getPropertyValue("font-size"));
    if (currentFontSize) height -= currentFontSize * remPaddingQuantity;
  }
  if (additionalPixels) height -= additionalPixels;
  return height + "px";
}
