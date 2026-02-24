import { useMemo, useRef, useLayoutEffect, useState, useEffect } from "react"
import css from "./Visual.module.css"
import { IAdd, Timeline } from "@wbe/interpol"

export interface IProps {
  timeline: Timeline
}

export const Visual = (props: IProps) => {
  if (!props.timeline) return

  // refs
  const rootRef = useRef<HTMLDivElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Calc element rect
   */
  const [elRect, setElRect] = useState<DOMRect | null>(null)
  useLayoutEffect(() => {
    if (!progressContainerRef.current) return
    const updateWidth = () => {
      if (progressContainerRef.current) {
        const rect = progressContainerRef.current.getBoundingClientRect()
        setElRect(rect)
      }
    }
    updateWidth()
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(progressContainerRef.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  /**
   * Calc width ratio based on element rect and timeline duration
   */
  const wratio = useMemo(() => {
    return elRect ? elRect.width / props.timeline.duration : 0
  }, [props.timeline?.duration, elRect])

  /**
   * Handle mouse move event to update timeline progress
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!elRect) return
    const x = e.clientX - elRect.left
    const progress = x / elRect.width
    props.timeline.progress(progress)
  }

  /**
   * Set progress
   */
  useEffect(() => {
    document.addEventListener("tlOnUpdate", () => {
      rootRef.current?.style.setProperty(
        "--progress-x",
        String((elRect?.width / 100) * (props.timeline.progress() as number) * 100),
      )
    })
  }, [elRect?.width])

  /**
   * Listen keys
   *
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        props.timeline.isPaused ? props.timeline.resume() : props.timeline.pause()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [props.timeline])

  return (
    <div className={css.root} ref={rootRef}>
      <div className={css.wrapper}>
        <div
          className={css.progressContainer}
          onMouseMove={handleMouseMove}
          ref={progressContainerRef}
        >
          {props.timeline.adds.map((add, index) => {
            return <ItpLine key={index} add={add} wratio={wratio} index={index} />
          })}
        </div>
        <div className={css.progressIndicator} />
      </div>
    </div>
  )
}

/**
 * ItpLine component to visualize the progress of an interpolated timeline.
 * @param props
 * @returns
 */
const ItpLine = (props: { add: IAdd; wratio: number; index: number }) => {
  const { add, wratio } = props
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!add) return
    return add.instance.ticker.add(() => {
      setProgress(add.instance.progress() as number)
    })
  }, [add])

  return (
    <div
      className={css.instanceLineWrapper}
      style={{
        width: `${add.instance.duration * wratio}px`,
        transform: `translateX(${add.time.start * wratio}px)`,
      }}
    >
      <div className={css.instanceLine} />
      <div className={css.instanceLineProgress} style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
