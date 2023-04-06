/**
 * Converts a matrix string to a CSS transform string
 * @param matrixString
 */
export function convertMatrix(matrixString: string): {
    translateX?: string
    translateY?: string
    translateZ?: string
    scale?: string
    rotate?: string
    skew?: string
} {
    const matrixValues = matrixString
        .match(/matrix\((.+)\)/i)?.[1]
        .split(",")
        .map((val) => parseFloat(val.trim()))

    const a = matrixValues[0]
    const b = matrixValues[1]
    const c = matrixValues[2]
    const d = matrixValues[3]
    const tx = matrixValues[4]
    const ty = matrixValues[5]
    const tz = matrixValues[14] || 0

    // TODO doit retourner scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ ...
    const transformedValues: {
        translateX?: string
        translateY?: string
        translateZ?: string
        scale?: string
        rotate?: string
        skew?: string
    } = {}

    if (tx !== 0) {
        transformedValues.translateX = `translateX(${tx}px)`
    }
    if (ty !== 0) {
        transformedValues.translateY = `translateY(${ty}px)`
    }
    if (tz !== 0) {
        transformedValues.translateZ = `translateZ(${tz}px)`
    }
    if (a !== 1 || d !== 1) {
        transformedValues.scale = `scale(${a}, ${d})`
    }
    if (b !== 0 || c !== 0) {
        transformedValues.skew = `skew(${Math.atan2(c, d)}rad, ${Math.atan2(b, a)}rad)`
    }
    if (b !== 0 || c !== 0 || a !== 1 || d !== 1) {
        transformedValues.rotate = `rotate(${Math.atan2(b, a)}rad)`
    }
    return transformedValues
}
