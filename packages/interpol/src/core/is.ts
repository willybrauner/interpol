export const is = {
  string: (v: any): boolean => typeof v === "string",
  number: (v: any): boolean => typeof v === "number",
  function: (v: any): boolean => typeof v === "function",
  array: (v: any): boolean => Array.isArray(v),
}
