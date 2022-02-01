export function getContainerElementOptimalWidth(
  containerId: string,
  subClasses: string[],
  includeRemPadding: boolean,
  remPaddingQuantity?: number,
  additionalPixels?: number
): string {
  let width = 0;
  const container = document.getElementById(containerId) as HTMLElement;
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
