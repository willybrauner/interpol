import React from "react"
import { Interpol } from "interpol"
export const Controls = ({ instance }: { instance: Interpol }) => {
  return (
    <div className="Controls">
      <button
        children={"play"}
        onClick={() =>
          instance.play().then(() => {
            console.log("Controls > play complete!")
          })
        }
      />
      <button
        children={"reverse"}
        onClick={() =>
          instance.reverse().then(() => {
            console.log("Controls > reverse complete!")
          })
        }
      />
      <button
        children={"Replay"}
        onClick={() =>
          instance.replay().then(() => {
            console.log("Controls > replay complete!")
          })
        }
      />
      <button onClick={() => instance.pause()}>Pause</button>
      <button onClick={() => instance.stop()}>Stop</button>
      <button onClick={() => instance.refreshComputedValues()}>Refresh</button>
    </div>
  )
}
