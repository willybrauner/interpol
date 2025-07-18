import { useMemo, useRef, useLayoutEffect, useState, useEffect } from "react"
import css from "./Visual.module.less"
import { IAdd, Timeline } from "@wbe/interpol"

export interface IProps {
  timeline: Timeline
}

export const Visual = (props: IProps) => {
  if (!props.timeline) {
    return
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const [elWidth, setElWidth] = useState<number>(0)
  useLayoutEffect(() => {
    if (!rootRef.current) return
    const updateWidth = () => {
      if (rootRef.current) {
        const width = rootRef.current.getBoundingClientRect().width
        setElWidth(width)
      }
    }
    updateWidth()
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(rootRef.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const wratio = useMemo(() => {
    return elWidth / props.timeline.duration
  }, [props.timeline?.duration, elWidth])

  return (
    <div className={css.root}>
      <div className={css.wrapper}>
        <div className={css.progressContainer} ref={rootRef}>
          {props.timeline.adds.map((add, index) => {
            return <ItpLine key={index} add={add} wratio={wratio} index={index} />
          })}
        </div>
      </div>
    </div>
  )
}

const ItpLine = (props: { add: IAdd; wratio: number; index: number }) => {
  const { add, wratio, index } = props

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!add) return
    return add.itp.ticker.add(() => {
      if (index === 0) console.log("xadd.itp.time", add.itp.time)
      setProgress(add.itp.progress() as number)
    })
  }, [add])

  useEffect(() => {
    //console.log("progress", progress * wratio)
  }, [progress])

  return (
    <div
      className={css.itpLineWrapper}
      style={{
        width: `${add.itp.duration * wratio}px`,
        transform: `translateX(${add.time.start * wratio}px)`,
      }}
    >
      <div className={css.itpLine} />
      <div
        className={css.itpLineProgress}
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  )
}
