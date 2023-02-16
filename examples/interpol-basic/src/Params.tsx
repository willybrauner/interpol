import css from "./Params.module.less"
import React from "react"

export function Params({ params, className }) {
  return (
    <div className={[css.root, className].join(" ")}>
      <div className={css.wrapper}>
        <ul className={css.list}>
          {Object.keys(params).map((e, i) => (
            <li key={i} className={css.item}>
              <span className={css.name}>{e}</span>:{" "}
              <strong className={css.value}>{params[e]}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
