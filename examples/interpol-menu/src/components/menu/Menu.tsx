import css from "./Menu.module.less"
import React, { useEffect, useRef } from "react"
import { Timeline, styles } from "@wbe/interpol"

export function Menu({ isOpen }: { isOpen: boolean }) {
  const rootRef = useRef(null)
  const itemsRef = useRef([])

  const getTl = () => {
    const tl = new Timeline({ paused: true })

    const wallDuration = 700
    // Background wall
    tl.add({
      debug: true,
      ease: "expo.out",
      duration: wallDuration,
      x: [-100, 0],
      opacity: [0, 1],

      // Use the styles function to update the DOM element
      beforeStart: ({ x, opacity }) => {
        styles(rootRef.current, {
          x: `${x}%`,
          opacity,
        })
      },

      onUpdate: ({ x, opacity }) => {
        styles(rootRef.current, {
          x: `${x}%`,
          opacity,
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
          y: [100, 0],
          opacity: [0, 1],

          // Equivalent to copy the onUpdate function on beforeStart
          // "immediateRender" allows to execute "onUpdate" callback just before "beforeStart"
          // Useful in this case, onUpdate will be called once, if the timeline is paused
          // in order to give a position to DOM element
          immediateRender: true,
          onUpdate: ({ y, opacity }) => {
            styles(item, {
              y: `${y}%`,
              opacity,
            })
          },
        },
        // Use the offset to create a delay between each item
        // delay is not available on Interpol instance when using Timeline
        // It could be complicated to implement it since we use the Interpol.progress
        // method to move the timeline
        `-=${itemDuration - itemDelay}`,
      )
    }

    tl.add(
      {
        duration: wallDuration,
        ease: "expo.out",
        scale: [1, 0.8],
        onUpdate: ({ scale }) => {
          styles(rootRef.current, { scale })
        },
      },
      "-=800",
    )

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
