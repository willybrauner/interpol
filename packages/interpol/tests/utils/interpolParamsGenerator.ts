import { randomRange } from "./randomRange"

export const interpolParamsGenerator = ({
  from = randomRange(-10000, 10000, 2),
  to = randomRange(-10000, 10000, 2),
  duration = randomRange(0, 200, 2),
  repeat = randomRange(1, 10, 0),
} = {}) => ({ from, to, duration, repeat })
