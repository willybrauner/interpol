import { randomRange } from "./randomRange"

export const interpolParamsGenerator = ({
  from = undefined,
  to = undefined,
  duration = undefined,
  repeat = undefined,
} = {}) => ({
  from: from ?? randomRange(-10000, 10000, 2),
  to: to ?? randomRange(-10000, 10000, 2),
  duration: duration ?? randomRange(0, 2000, 2),
  repeat: repeat ?? randomRange(1, 10, 0),
})
