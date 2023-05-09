import css from "./Controls.module.less"
import React from "react"
import { Ease, Interpol } from "@psap/interpol"
export const Controls = ({
  className,
  instance,
  dispatchEase,
}: {
  className: string
  instance: Interpol
  dispatchEase: (ease) => void
}) => {
  return (
    <div className={[css.root, className].join(" ")}>
      <div className={css.wrapper}>
        <div className={css.buttons}>
          {["play", "reverse", "pause", "stop", "replay"].map((e, i) => (
            <button className={css.button} onClick={() => instance[e]()} key={i} children={e} />
          ))}
        </div>

        <select
          className={css.easeSelect}
          defaultValue={Object.keys(Ease)[0]}
          onChange={(e) => dispatchEase(e.target.value)}
        >
          {Object.keys(Ease).map((e, i) => (
            <option key={i} value={e} className={css.easeOption}>
              {e} : <em>{Ease[e].toString()}</em>
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
