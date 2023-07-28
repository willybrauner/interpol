export const styles = (el: HTMLElement | null, s: Record<string, string>) => {
  for (let key in s) if (s.hasOwnProperty(key)) el.style[key] = s[key]
}
