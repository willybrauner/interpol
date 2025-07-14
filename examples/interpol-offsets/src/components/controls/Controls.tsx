import css from "./Controls.module.less"
import React, { useEffect, useState } from "react"
import { Timeline } from "@wbe/interpol"

/**
 * Controls
 */
export const Controls = ({
  className,
  instance,
}: {
  className: string
  instance: Timeline
}) => {
  const [progress, setProgress] = useState("0")

  useEffect(() => {
    instance?.progress(parseFloat(progress) / 100)
  }, [progress])

  return (
    <div className={[css.root, className].join(" ")}>
      <div className={css.wrapper}>
        {/* prettier-ignore */}
        <div className={css.buttons}>
          <button className={css.button} onClick={() => instance.play()} children={"play"} />
          <button className={css.button} onClick={() => instance.reverse()} children={"reverse"} />
          <button className={css.button} onClick={() => instance.pause()} children={"pause"} />
          <button className={css.button} onClick={() => instance.resume()} children={"resume"} />
          <button className={css.button} onClick={() => instance.stop()} children={"stop"} />
        <input
          onChange={(e) => setProgress(e.target.value || "0")}
          className={css.slider}
          type="range"
          min="0"
          max="100"
          value={progress}
        />
        </div>
      </div>
    </div>
  )
}
