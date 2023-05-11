/**
 * Converts a matrix string to a CSS transform string
 * @param matrixString
 */

export function convertMatrix(matrixString: string) {
  const isMatrix3d = matrixString.includes("matrix3d")
  const matrixValues = matrixString
    .match(/(?:matrix|matrix3d)\((.+)\)/i)?.[1]
    .split(",")
    .map((val) => parseFloat(val.trim()))
  const transformedValues: Record<string, string> = {
    translateX: "",
    translateY: "",
    translateZ: "",
    scale: "",
    scaleX: "",
    scaleY: "",
    scaleZ: "",
    rotate: "",
    rotateX: "",
    rotateY: "",
    rotateZ: "",
    skew: "",
    skewX: "",
    skewY: "",
  }

  if (isMatrix3d) {
    const [tx, ty, tz, a, b, c, d, e, f, g, h, i] = matrixValues
    const scaleX = Math.sqrt(a * a + b * b + c * c)
    const scaleY = Math.sqrt(d * d + e * e + f * f)
    const scaleZ = Math.sqrt(g * g + h * h + i * i)
    const rotateX = Math.atan2(-f, e) * (180 / Math.PI)
    const rotateY = Math.asin(c) * (180 / Math.PI)
    const rotateZ = Math.atan2(-b, a) * (180 / Math.PI)
    const skewX = Math.atan2(d, a) * (180 / Math.PI)
    const skewY = Math.atan2(b, a) * (180 / Math.PI)

    transformedValues.translateX = `translateX(${tx}px)`
    transformedValues.translateY = `translateY(${ty}px)`
    transformedValues.translateZ = `translateZ(${tz}px)`
    transformedValues.scale = `scale(${scaleX}, ${scaleY}, ${scaleZ})`
    transformedValues.scaleX = `scaleX(${scaleX})`
    transformedValues.scaleY = `scaleY(${scaleY})`
    transformedValues.scaleZ = `scaleZ(${scaleZ})`
    transformedValues.rotate = `rotate3d(${rotateX}, ${rotateY}, ${rotateZ})`
    transformedValues.rotateX = `rotateX(${rotateX}deg)`
    transformedValues.rotateY = `rotateY(${rotateY}deg)`
    transformedValues.rotateZ = `rotateZ(${rotateZ}deg)`
    transformedValues.skew = `skew(${skewX}deg, ${skewY}deg)`
    transformedValues.skewX = `skewX(${skewX}deg)`
    transformedValues.skewY = `skewY(${skewY}deg)`
  } else {
    const [tx, ty, a, b, c, d] = matrixValues
    const scaleX = Math.sqrt(a * a + b * b)
    const scaleY = Math.sqrt(c * c + d * d)
    const rotate = Math.atan2(b, a) * (180 / Math.PI)
    const skew = Math.atan2(c, d) - Math.atan2(b, a)

    transformedValues.translateX = `translateX(${tx}px)`
    transformedValues.translateY = `translateY(${ty}px)`
    transformedValues.scale = `scale(${scaleX}, ${scaleY})`
    transformedValues.scaleX = `scaleX(${scaleX})`
    transformedValues.scaleY = `scaleY(${scaleY})`
    transformedValues.rotate = `rotate(${rotate}deg)`
    transformedValues.skew = `skew(${skew}rad)`
  }

  return transformedValues
}
