/**
 * Sets focus to the given element if it exists and is focusable.
 * @param element HTMLElement or null
 */
export function focusElement(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
}

/**
 * Returns ARIA attributes for a status message region.
 * @param options Options for live region
 * @returns ARIA attributes object
 */
export function getAriaStatusProps(options?: { live?: 'polite' | 'assertive'; atomic?: boolean }) {
  return {
    role: 'status',
    'aria-live': options?.live || 'polite',
    'aria-atomic': options?.atomic ?? true,
  };
}

/**
 * Returns ARIA attributes for an alert region.
 * @returns ARIA attributes object
 */
export function getAriaAlertProps() {
  return {
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': true,
  };
}

/**
 * Returns ARIA attributes for a labelled element.
 * @param id The id of the labelling element
 * @returns ARIA attributes object
 */
export function getAriaLabelledBy(id: string | undefined) {
  return id ? { 'aria-labelledby': id } : {};
}

/**
 * Returns ARIA attributes for a described element.
 * @param id The id of the describing element
 * @returns ARIA attributes object
 */
export function getAriaDescribedBy(id: string | undefined) {
  return id ? { 'aria-describedby': id } : {};
}