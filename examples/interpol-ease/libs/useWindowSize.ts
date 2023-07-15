import { useEffect, useState } from "react"

export const useWindowSize = (): { width: number; height: number } => {
  const [s, setS] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => {
      setS({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resie", handler)
    return () => {
      window.removeEventListener("resie", handler)
    }
  }, [s])

  return s
}
