export interface FloatingRect {
  top: number
  bottom: number
  left: number
  right: number
}

export interface FloatingPosition {
  top: number
  left: number
}

const EDGE_PADDING = 8

/**
 * Computes a viewport-safe { top, left } for a fixed-position floating panel
 * anchored to `trigger`, flipping above/left when it would overflow the
 * bottom/right edge of the viewport.
 */
export function computeFloatingPosition(
  trigger: FloatingRect,
  panelWidth: number,
  panelHeight: number,
  gap = 6,
): FloatingPosition {
  const spaceBelow = window.innerHeight - trigger.bottom
  const top = spaceBelow >= panelHeight ? trigger.bottom + gap : trigger.top - panelHeight - gap
  const left = trigger.left + panelWidth > window.innerWidth - EDGE_PADDING
    ? trigger.right - panelWidth
    : trigger.left
  return { top, left }
}
