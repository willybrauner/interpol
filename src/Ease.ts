// prettier-ignore
export const Ease = {
  linear: t => t,

  inQuad: t => t*t,
  outQuad: t => t*(2-t),
  inOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,

  inCubic: t => t*t*t,
  outCubic: t => (--t)*t*t+1,
  inOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,

  inQuart: t => t*t*t*t,
  outQuart: t => 1-(--t)*t*t*t,
  inOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,

  inQuint: t => t*t*t*t*t,
  outQuint: t => 1+(--t)*t*t*t*t,
  inOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t,

  inSine:t => -Math.cos(t * (Math.PI/2)) + 1,
  outSine:t => Math.sin(t * (Math.PI/2)),
  inOutSine:t => (-0.5 * (Math.cos(Math.PI*t) -1)),

  inExpo:t => (t===0) ? 0 : Math.pow(2, 10 * (t - 1)),
  outExpo:t => (t===1) ? 1 : -Math.pow(2, -10 * t) + 1,
  inOutExpo: t => {
    if (t===0) return 0;
    if (t===1) return 1;
    if ((t/=0.5) < 1) return 0.5 * Math.pow(2,10 * (t-1));
    return 0.5 * (-Math.pow(2, -10 * --t) + 2);
  },

}
