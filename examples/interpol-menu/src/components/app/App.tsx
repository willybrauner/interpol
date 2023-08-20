import css from "./App.module.less"
import React from "react"
import { Menu } from "../menu/Menu"

export function App() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  return (
    <div className={css.root}>
      <Menu isOpen={menuOpen} />
      <button className={css.button} onClick={() => setMenuOpen(!menuOpen)}>
        O P E N
      </button>
    </div>
  )
}
