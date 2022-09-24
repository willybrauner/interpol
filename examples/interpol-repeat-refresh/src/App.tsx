import "./App.css"
import { Ball } from "./Ball"

function App() {
  return (
    <div className={"App"}>
      {new Array(100).fill(null).map((e, i) => (
        <Ball key={i} />
      ))}
    </div>
  )
}

export default App
