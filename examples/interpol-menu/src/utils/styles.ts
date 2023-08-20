
//prettier-ignore
export const styles = (el: HTMLElement[] | HTMLElement | null, s: Record<string, string|number>) => {
  for (let key in s)
    if (s.hasOwnProperty(key))
      if (Array.isArray(el))
        for (let i = 0; i < el.length; i++)
          el[i].style[key] = s[key]
        else el.style[key] = s[key]
}
