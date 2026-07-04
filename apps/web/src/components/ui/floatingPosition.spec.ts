import { afterEach, describe, expect, it } from 'vitest'
import { computeFloatingPosition } from './floatingPosition'

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true })
}

describe('computeFloatingPosition', () => {
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight

  afterEach(() => {
    setViewport(originalWidth, originalHeight)
  })

  it('anchors below and to the left of the trigger when there is room', () => {
    setViewport(1280, 800)
    const trigger = { top: 100, bottom: 130, left: 50, right: 150 }
    const pos = computeFloatingPosition(trigger, 200, 300)
    expect(pos).toEqual({ top: 136, left: 50 })
  })

  it('flips to the left edge of the trigger when the panel would overflow the right side', () => {
    setViewport(375, 800)
    const trigger = { top: 100, bottom: 130, left: 300, right: 360 }
    const pos = computeFloatingPosition(trigger, 200, 300)
    expect(pos.left).toBe(160) // trigger.right (360) - panelWidth (200)
  })

  it('opens above the trigger when there is not enough space below', () => {
    setViewport(1280, 400)
    const trigger = { top: 350, bottom: 380, left: 50, right: 150 }
    const pos = computeFloatingPosition(trigger, 200, 300)
    expect(pos.top).toBe(44) // trigger.top (350) - panelHeight (300) - gap (6)
  })

  it('uses a custom gap when provided', () => {
    setViewport(1280, 800)
    const trigger = { top: 100, bottom: 130, left: 50, right: 150 }
    const pos = computeFloatingPosition(trigger, 200, 300, 20)
    expect(pos.top).toBe(150) // trigger.bottom (130) + gap (20)
  })
})
