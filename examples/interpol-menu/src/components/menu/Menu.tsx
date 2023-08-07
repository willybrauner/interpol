import css from "./Menu.module.less"
import React, { useEffect, useRef } from "react"
import { Timeline } from "@wbe/interpol"
import { styles } from "../../utils/styles"
import { useWindowSize } from "../../utils/useWindowSize"

export function Menu({ className, isOpen }: { className?: string; isOpen: boolean }) {
  const rootRef = useRef(null)
  const itemsRef = useRef([])
  const windowSize = useWindowSize()

  const getTl = () => {
    const tl = new Timeline({ paused: true })
    tl.add({
      props: {
        x: [-innerWidth, 0],
        i: [0, 1],
      },
      beforeStart: () => {
        styles(rootRef.current, {
          transform: `translateX(${-100}%)`,
        })
      },
      debug: true,
      // ease: "expo.out",
      onUpdate: ({ x }, time, progress) => {
        styles(rootRef.current, {
          transform: `translateX(${progress*100}%)`,
        })
      },
      onComplete: (props, time, progress) => {
        console.log('props, time, progress',props, time, progress)
        styles(rootRef.current, {
          transform: `translateX(${progress*100}%)`,
        })
      }
    })
    return tl
  }


  /**
   * Init
   */
  const tl = useRef(null)
  useEffect(() => {
    if (!tl.current) tl.current = getTl()
  }, [])


  /**
   * Play / Reverse
   */
  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    if (isOpen) tl.current.play()
    else tl.current.reverse()
  }, [isOpen])

  return (
    <div className={css.root} ref={rootRef}>
      <ul className={css.items}>
        {["Home", "About", "Contact"].map((item, index) => (
          <li key={index} className={css.item} children={item} ref={(r) => (itemsRef[index] = r)} />
        ))}
      </ul>
    </div>
  )
}
