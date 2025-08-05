import { expect } from "vitest"

export const expectToBeBetween = (value: number, min: number, max: number): void => {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}
