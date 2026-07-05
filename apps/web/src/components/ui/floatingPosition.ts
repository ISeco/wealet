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
 * bottom/right edge of the viewport. The vertical result is then clamped to
 * [EDGE_PADDING, innerHeight - panelHeight - EDGE_PADDING] — without this,
 * flipping "above" when there isn't enough room there either (e.g. a short
 * viewport with the trigger near the top) pushes the panel off the top edge
 * entirely, and a panel taller than the viewport pins flush to the bottom
 * edge with no breathing room. Callers relying on a tall/variable-height
 * panel should still cap it with CSS max-height + overflow so any remaining
 * excess scrolls internally instead of being clipped.
 */
export function computeFloatingPosition(
  trigger: FloatingRect,
  panelWidth: number,
  panelHeight: number,
  gap = 6,
): FloatingPosition {
  const spaceBelow = window.innerHeight - trigger.bottom
  const rawTop = spaceBelow >= panelHeight ? trigger.bottom + gap : trigger.top - panelHeight - gap
  const maxTop = Math.max(EDGE_PADDING, window.innerHeight - panelHeight - EDGE_PADDING)
  const top = Math.min(Math.max(rawTop, EDGE_PADDING), maxTop)
  const left = trigger.left + panelWidth > window.innerWidth - EDGE_PADDING
    ? trigger.right - panelWidth
    : trigger.left
  return { top, left }
}
