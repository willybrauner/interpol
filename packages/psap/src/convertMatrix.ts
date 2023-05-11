/**
 * Converts a matrix string to a CSS transform string
 * @param matrixString
 */
import debug from "@wbe/debug"
const log = debug(`psap:convertMatrix`)

export function convertMatrix(matrixString: string) {
  const matrixValues = matrixString
    .replace(/^matrix(3d)?\(/, "")
    .replace(/\)$/, "")
    .split(", ")
    .map(parseFloat)

  let scaleX,
    scaleY,
    scaleZ,
    skewX,
    skewY,
    rotateX,
    rotateY,
    rotateZ,
    translateX,
    translateY,
    translateZ

  if (matrixValues.length === 6) {
    scaleX = matrixValues[0]
    skewY = matrixValues[1] / matrixValues[0]
    skewX = Math.atan2(matrixValues[2], matrixValues[3]) * (180 / Math.PI)
    scaleY = matrixValues[3] / Math.cos(skewX * (Math.PI / 180))
    translateX = matrixValues[4]
    translateY = matrixValues[5]
  } else if (matrixValues.length === 16) {
    scaleX = Math.sqrt(matrixValues[0] ** 2 + matrixValues[1] ** 2 + matrixValues[2] ** 2)
    scaleY = Math.sqrt(matrixValues[4] ** 2 + matrixValues[5] ** 2 + matrixValues[6] ** 2)
    scaleZ = Math.sqrt(matrixValues[8] ** 2 + matrixValues[9] ** 2 + matrixValues[10] ** 2)
    skewX = Math.atan2(matrixValues[6], matrixValues[10]) * (180 / Math.PI)
    skewY = Math.atan2(matrixValues[1], matrixValues[0]) * (180 / Math.PI)
    rotateX = Math.atan2(-matrixValues[9], matrixValues[5]) * (180 / Math.PI)
    rotateY = Math.asin(matrixValues[2]) * (180 / Math.PI)
    rotateZ = Math.atan2(-matrixValues[4], matrixValues[0]) * (180 / Math.PI)
    translateX = matrixValues[12]
    translateY = matrixValues[13]
    translateZ = matrixValues[14]
  }

  return {
    translateX: translateX ? `translateX(${translateX}px)` : "",
    translateY: translateY ? `translateY(${translateY}px)` : "",
    translateZ: translateZ ? `translateZ(${translateZ}px)` : "",
    scale: scaleX && scaleY && scaleZ ? `scale3d(${scaleX}, ${scaleY}, ${scaleZ})` : "",
    scaleX: scaleX ? `scaleX(${scaleX})` : "",
    scaleY: scaleY ? `scaleY(${scaleY})` : "",
    scaleZ: scaleZ ? `scaleZ(${scaleZ})` : "",
    rotate: rotateX && rotateY && rotateZ ? `rotate3d(${rotateX}, ${rotateY}, ${rotateZ})` : "",
    rotateX: rotateX ? `rotateX(${rotateX}deg)` : "",
    rotateY: rotateY ? `rotateY(${rotateY}deg)` : "",
    rotateZ: rotateZ ? `rotateZ(${rotateZ}deg)` : "",
    skew: skewX && skewY ? `skew(${skewX}deg, ${skewY}deg)` : "",
    skewX: skewX ? `skewX(${skewX}deg)` : "",
    skewY: skewY ? `skewY(${skewY}deg)` : "",
  }
}
