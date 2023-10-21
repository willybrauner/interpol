precision highp float;
varying vec2 vUv;
uniform float uMove;

void main() {
    float strength = floor(vUv.y * 10. * uMove) / 10.;
    gl_FragColor = vec4(vec3(strength), 1.);
}
