export const toCamelCase = (prop) => prop.replace(/(-\w)/g, (match) => match[1].toUpperCase())
