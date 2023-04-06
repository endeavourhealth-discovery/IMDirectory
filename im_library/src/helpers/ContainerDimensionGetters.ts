export function getContainerElementOptimalHeight(
  containerId: string,
  siblingClasses: string[],
  includeRemPadding: boolean,
  remPaddingQuantity?: number,
  additionalPixels?: number
): string {
  let height = 0;
  const container = document.getElementById(containerId);
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

export function getContainerElementOptimalWidth(
  containerId: string,
  subClasses: string[],
  includeRemPadding: boolean,
  remPaddingQuantity?: number,
  additionalPixels?: number
): string {
  let width = 0;
  const container = document.getElementById(containerId);
  if (!container) return "";
  width += container.getBoundingClientRect().width;
  for (const subClass of subClasses) {
    const classElement = container.getElementsByClassName(subClass)[0] as HTMLElement;
    if (classElement) width -= classElement.getBoundingClientRect().width;
  }
  if (includeRemPadding && remPaddingQuantity) {
    const currentFontSize = parseFloat(window.getComputedStyle(document.documentElement, null).getPropertyValue("font-size"));
    if (currentFontSize) width -= currentFontSize * remPaddingQuantity;
  }
  if (additionalPixels) {
    width -= additionalPixels;
  }
  return width + "px";
}

export default {
  getContainerElementOptimalHeight,
  getContainerElementOptimalWidth
};
