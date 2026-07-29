/** Returns true when an element meets basic accessible name requirements. */
export function hasAccessibleName(element: HTMLElement) {
  const labelledBy = element.getAttribute('aria-labelledby');
  const label = element.getAttribute('aria-label');
  const title = element.getAttribute('title');
  const text = element.textContent?.trim();

  return Boolean(labelledBy || label || title || text);
}

/** Ensures a numeric value is clamped for progress indicators. */
export function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}
