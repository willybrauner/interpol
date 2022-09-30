import React from "react"
import { Interpol } from "interpol"
export const Controls = ({ instance }: { instance: Interpol }) => {
  return (
    <div className="Controls">
      <button
        onClick={async () => {
          await instance.play()
          console.log("after await play()")
        }}
      >
        Play
      </button>
      <button onClick={() => instance.reverse()}>Reverse</button>
      <button onClick={() => instance.pause()}>Pause</button>
      <button onClick={() => instance.stop()}>Stop</button>
      <button onClick={() => instance.replay()}>Replay</button>
      <button onClick={() => instance.refresh()}>Refresh</button>
    </div>
  )
}
