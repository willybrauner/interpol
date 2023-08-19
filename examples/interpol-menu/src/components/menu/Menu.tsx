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

    const wallDuration = 700
    // The background wall is a unique element
    tl.add({
      ease: "expo.out",
      duration: 700,
      props: {
        x: [-100, 0],
      },
      beforeStart: () => {
        styles(rootRef.current, {
          transform: `translateX(${-100}%)`,
        })
      },
      onUpdate: ({ x }) => {
        styles(rootRef.current, {
          transform: `translateX(${x}%)`,
        })
      },
    })

    // Create a stagger effect on items
    const itemDuration = wallDuration
    const itemDelay = 100
    // Loop on each item
    // and add an Interpol instance for each one
    for (let item of itemsRef.current) {
      tl.add(
        {
          duration: itemDuration,
          ease: "expo.out",
          props: {
            y: [10, 0],
            opacity: [0, 1],
          },
          beforeStart: (props, time, propgress) => {
            console.log("props, time, propgress", props, time, propgress)
            styles(item, {
              transform: `translateY(${10}%)`,
              opacity: 0,
            })
          },
          onUpdate: ({ y, opacity }) => {
            styles(item, {
              transform: `translateY(${y}%)`,
              opacity,
            })
          },
        },
        // Use the offset to create a delay between each item
        // delay is not available on Interpol instance when using Timeline
        // It could be complicated to implement it since we use the Interpol.seek
        // method to move the timeline
        -(itemDuration - itemDelay),
      )
    }

    return tl
  }

  /**
   * Init and register the timeline in a ref
   */
  const tl = useRef(null)
  useEffect(() => {
    tl.current = getTl()
  }, [])

  /**
   * Play / Reverse
   * (not on first mount)
   */
  const isFirstMount = useRef(true)
  useEffect(() => {
    // flag the first mount
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    // Here we go, play or reverse the timeline
    // when the isOpen prop change
    if (isOpen) tl.current.play()
    else tl.current.reverse()
  }, [isOpen])

  return (
    <div className={css.root} ref={rootRef}>
      <ul className={css.items}>
        {["Home", "About", "Contact"].map((item, index) => (
          <li
            key={index}
            className={css.item}
            children={item}
            ref={(r) => (itemsRef.current[index] = r)}
          />
        ))}
      </ul>
    </div>
  )
}
