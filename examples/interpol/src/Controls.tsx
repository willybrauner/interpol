import css from "./Controls.module.less"
import React, { useEffect, useState } from "react"
import { Interpol } from "@wbe/interpol"
import { Ease } from "./App"
export const Controls = ({
  className,
  instance,
  dispatchEase,
}: {
  className: string
  instance: Interpol
  dispatchEase: (ease) => void
}) => {
  const [progress, setProgress] = useState("0")

  useEffect(() => {
    instance?.seek(parseFloat(progress) / 100)
  }, [progress])

  return (
    <div className={[css.root, className].join(" ")}>
      <div className={css.wrapper}>
        {/* prettier-ignore */}
        <div className={css.buttons}>
          <button className={css.button} onClick={() => instance.play(0)} children={"play 0"} />
          <button className={css.button} onClick={() => instance.play(0.5)} children={"play .5"} />
          <button className={css.button} onClick={() => instance.reverse(1)} children={"reverse 1"} />
          <button className={css.button} onClick={() => instance.reverse(0.5)} children={"reverse .5"} />
        </div>
        <button className={css.button} onClick={() => instance.resume()} children={"resume"} />
        <button className={css.button} onClick={() => instance.pause()} children={"pause"} />
        <button className={css.button} onClick={() => instance.stop()} children={"stop"} />

        <select
          className={css.easeSelect}
          defaultValue={Object.keys(Ease)[0]}
          onChange={(e) => dispatchEase(e.target.value)}
        >
          {Object.keys(Ease).map((e, i) => (
            <option key={i} value={e} className={css.easeOption}>
              {e} : {Ease[e].toString()}
            </option>
          ))}
        </select>
        <input
          value={progress}
          type={"number"}
          onChange={(e) => setProgress(e.target.value || "0")}
        />
      </div>
    </div>
  )
}
