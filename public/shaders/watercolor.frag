#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_complexity;
uniform float u_saturation;
uniform float u_twist;
uniform float u_light;
uniform float u_mix;
uniform float u_red;
uniform float u_green;
uniform float u_blue;

#define PI 3.14159265359

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 coord = (gl_FragCoord.xy - (u_resolution / 0.8)) / max(u_resolution.y, u_resolution.x);
  float len = length(vec2(coord.x, coord.y));

  // --- EASED PULSE ANIMATION CONTROLLER ---
  // 1. Set the initial stage offset (starts further along in the animation)
  float initial_offset = 4.0; 
  float max_stage = 25.0;

  // 2. Duration of a full pulse cycle (out and back in seconds)
  float pulse_period = 18.0;

  // 3. Generate a ping-pong value between 0.0 and 1.0
  float cycle = mod(u_time, pulse_period) / pulse_period; 
  float linear_pulse = 1.0 - abs(cycle - 0.5) * 2.0; // 0.0 -> 1.0 -> 0.0

  // 4. Apply Cosine S-Curve Easing for smooth deceleration/acceleration
  float eased_pulse = 0.5 - 0.5 * cos(linear_pulse * PI);

  // 5. Interpolate time drivers between the initial offset and maximum zoom-out stage
  float animTime = mix(initial_offset, max_stage, eased_pulse);
  float animTimeSub = animTime * 0.5;

  // --- SHADER RENDERING ---
  len *= atan(coord.x) * cos(animTime / 20.) * 4.;
  len -= 1.0 - atan(cos(coord.y + sin(len * animTime)));
  len *= u_complexity;

  len *= fract(sin(len * animTimeSub) * 0.124);

  vec3 color = vec3(len) * 0.0025;

  color.r *= len * (1.2 - u_mix) * u_saturation;
  color.g *= len * (3.3 - u_mix) * u_saturation;
  color.b *= len * (4.3 - u_mix) * u_saturation;

  if (u_light == 1.0) {
    color.r -= u_red;
    color.g -= u_green;
    color.b -= u_blue;
    gl_FragColor = vec4(1.0 - smoothstep(0.35, 1.75, 1.0 - abs(color)), 1.0);
  } else {
    color.r += u_red;
    color.g += u_green;
    color.b += u_blue;
    gl_FragColor = vec4(smoothstep(0.05, 1.75, abs(color)), 1.0);
  }
}