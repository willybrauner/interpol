import css from "./Graph.module.css"
import { useCallback, useRef } from "react"
import { Coords } from "../../utils/calcCoords"

export const Graph = ({ coords }: { coords: Coords }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  /**
   * Create SVG path
   */
  const createSVGPath = useCallback(
    (coords: Coords): string => {
      let path = ""
      for (let i = 0; i < coords.length; i++) {
        const curr = coords[i]
        const [xFrom, xTo] = curr.x
        const [yFrom, yTo] = curr.y
        path += `M${xFrom},${yFrom + innerHeight} L${xTo},${yTo + innerHeight} `
      }
      return path
    },
    [coords],
  )

  /**
   * Prepare points coords for render
   * @param coords
   */
  const getPointsCoords = (coords: Coords): { x: number; y: number }[] =>
    coords.reduce(
      (prev, curr, i) => [
        ...prev,
        { x: curr.x[0], y: curr.y[0] },
        ...(i === coords.length - 1 ? [{ x: curr.x[1], y: curr.y[1] }] : []),
      ],
      [],
    )

  return (
    <div className={css.root}>
      {getPointsCoords(coords).map((e, i) => (
        <div
          key={i}
          className={css.point}
          style={{ transform: `translate3d(${e.x}px, ${e.y}px, 0)` }}
        />
      ))}
      <svg className={css.svg} ref={svgRef} stroke={"hotpink"}>
        <path d={createSVGPath(coords)} />
      </svg>
    </div>
  )
}
