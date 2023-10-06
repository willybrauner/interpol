import { useEffect, useState } from "react"

export const useWindowSize = (): { width: number; height: number } => {
  const [s, setS] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => {
      setS({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [s])
  return s
}
