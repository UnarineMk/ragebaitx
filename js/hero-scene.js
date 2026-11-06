// RageBaitX hero scene: a hand-written WebGL raymarcher (no libraries).
// Neon coastal city at dusk, wet road, palms and streetlights, seen from a
// first-person drive. Mouse looks around; scroll lifts the camera slightly.

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uIntro;
uniform float uHue;
uniform vec3  uCamPos;
uniform vec4  uCam;

#define PI 3.14159265
#define SPEED 9.0

vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }

float hash11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x), mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }

vec3 PINK, ORANGE, PURPLE, RED;

const vec3 SUNDIR = vec3(0.0, 0.0995, 0.995);

// ------------------------------------------------------------ sky + skyline
vec3 skyCol(vec3 rd, float t){
  float y = rd.y;
  vec3 top = lin(vec3(0.03, 0.012, 0.06));
  vec3 mid = lin(vec3(0.20, 0.055, 0.32));
  vec3 hor = lin(vec3(0.82, 0.24, 0.34));
  vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, y));
  c = mix(c, top, smoothstep(0.14, 0.62, y));

  // stars
  float a = atan(rd.x, rd.z);
  vec2 sc = vec2(a, y) * 140.0;
  vec2 sid = floor(sc); vec2 sf = fract(sc) - 0.5;
  float sh = hash21(sid);
  c += vec3(1.0, 0.9, 1.0) * step(0.993, sh) * smoothstep(0.12, 0.0, length(sf))
       * (0.55 + 0.45 * sin(t * 2.0 + sh * 60.0)) * smoothstep(0.12, 0.4, y) * 0.9;

  // sun (synthwave disc with cut lines)
  vec3 sr = normalize(cross(vec3(0,1,0), SUNDIR));
  vec3 su = cross(SUNDIR, sr);
  float dd = max(dot(rd, SUNDIR), 1e-3);
  vec2 sp = vec2(dot(rd, sr), dot(rd, su)) / dd;
  float sunR = 0.08;
  float r = length(sp);
  float sy = sp.y / sunR;
  float disk = smoothstep(sunR, sunR - 0.003, r);
  float cutZone = smoothstep(0.15, -0.9, sy);
  float cut = step(fract(sy * 7.0 - t * 0.06), cutZone * 0.55);
  vec3 sunC = mix(lin(vec3(1.0, 0.70, 0.30)), PINK * 1.1, smoothstep(0.8, -0.9, sy));
  c = mix(c, sunC * 1.15, disk * (1.0 - cut));
  c += PINK * exp(-r * 6.0) * 0.22 + ORANGE * exp(-r * 18.0) * 0.25;

  // thin horizon clouds
  float cl = smoothstep(0.55, 0.92, noise(vec2(a * 3.0 + t * 0.01, y * 22.0)));
  c += PINK * 0.07 * cl * smoothstep(0.18, 0.03, y) * step(0.0, y);

  // far skyline
  float hf = 0.015 + 0.05 * pow(hash11(floor(a * 70.0) + 3.0), 2.0)
           + 0.06 * exp(-pow((a - 0.22) * 3.0, 2.0)) * hash11(floor(a * 70.0) + 9.0);
  if (y < hf && y > -0.01) c = mix(c, lin(vec3(0.16, 0.06, 0.22)), 0.85);

  // near skyline with lit windows
  float k2 = 30.0;
  float ax = a * k2 + 0.37;
  float id2 = floor(ax);
  float hb = hash11(id2 * 1.7 + 2.0);
  float h2 = 0.008 + 0.035 * hb + 0.10 * exp(-pow((a - 0.22) * 4.0, 2.0)) * hash11(id2 + 11.0);
  float bx = fract(ax);
  if (y < h2 && y > -0.01) {
    vec3 bc = lin(vec3(0.035, 0.015, 0.055));
    vec2 wg = vec2(ax * 9.0, y * 260.0);
    float lit = step(0.5, fract(wg.x)) * step(0.45, fract(wg.y)) * step(0.7, hash21(floor(wg) + id2));
    lit *= step(0.08, bx) * step(bx, 0.92);
    vec3 wc = mix(PINK, ORANGE, hash11(id2 + 4.0));
    wc = mix(wc, PURPLE, step(0.75, hash11(id2 + 8.0)));
    bc += wc * lit * 0.55;
    bc += PINK * smoothstep(0.003, 0.0, abs(y - h2 + 0.0015)) * step(0.6, hb) * 0.8;
    c = bc;
  }
  // antennas with blinking tips
  if (hb > 0.82) {
    float ay = h2 + 0.03;
    float ad = abs(bx - 0.5);
    if (ad < 0.04 && y > h2 && y < ay) c = lin(vec3(0.04, 0.02, 0.06));
    float tip = smoothstep(0.02, 0.0, length(vec2((bx - 0.5) / k2 * 30.0, y - ay)));
    c += RED * tip * (0.5 + 0.5 * step(0.5, fract(t * 0.8 + hb * 5.0))) * 2.0;
  }
  // horizon haze
  c += PINK * 0.16 * exp(-abs(y) * 70.0);
  return c;
}

// ------------------------------------------------------------ palm silhouette
float sdSeg(vec2 p, vec2 a, vec2 b, out float h){
  vec2 pa = p - a, ba = b - a;
  h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
float palm(vec2 q, float seed){
  float H = 5.2 + seed * 1.6;
  float lean = (seed - 0.5) * 1.1;
  float yy = clamp(q.y / H, 0.0, 1.0);
  float cx = lean * pow(yy, 1.6);
  float trunk = abs(q.x - cx) - mix(0.15, 0.07, yy);
  trunk = max(trunk, max(-q.y, q.y - H));
  float d = trunk;
  vec2 C = vec2(lean, H);
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float ang = PI * (0.06 + fi * 0.147) + (hash11(seed * 13.0 + fi) - 0.5) * 0.25;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 p1 = C + dir * 0.9;
    vec2 p2 = p1 + dir * 0.8 + vec2(0.0, -0.4);
    vec2 p3 = p2 + dir * 0.55 + vec2(0.0, -0.7);
    float h;
    float s1 = sdSeg(q, C, p1, h);  float th1 = mix(0.10, 0.08, h);
    float s2 = sdSeg(q, p1, p2, h); float th2 = mix(0.08, 0.05, h);
    float s3 = sdSeg(q, p2, p3, h); float th3 = mix(0.05, 0.012, h);
    float f = min(min(s1 - th1, s2 - th2), s3 - th3);
    d = min(d, f);
  }
  return d;
}

vec3 hueShift(vec3 c, float a){
  const vec3 k = vec3(0.57735);
  float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
}

void main(){
  PINK = lin(vec3(1.0, 0.239, 0.506));
  ORANGE = lin(vec3(1.0, 0.443, 0.22));
  PURPLE = lin(vec3(0.541, 0.259, 1.0));
  RED = lin(vec3(1.0, 0.08, 0.16));

  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRes) / uRes.y;
  float t = uTime;

  // ---------------- camera (first-person drive, or fixed preset for stills)
  float s = smoothstep(0.0, 1.0, uScroll);
  vec3 ro = vec3(uMouse.x * 0.7 + sin(t * 0.07) * 0.35, 1.45 + uMouse.y * 0.3 + s * 0.5 + (1.0 - uIntro) * 2.0, -4.0);
  vec3 ta = vec3(uMouse.x * 1.6 + sin(t * 0.05) * 0.5, 1.5 + uMouse.y * 0.6 + s * 0.3, 12.0);
  if (uCam.w > 0.5) { ro = uCamPos; ta = uCam.xyz; }
  vec3 fw = normalize(ta - ro);
  vec3 rt = normalize(cross(vec3(0, 1, 0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.55 * fw);

  // ---------------- sky
  vec3 col = skyCol(rd, t);
  float tMax = 1e4;

  // ---------------- ground
  if (rd.y < 0.0) {
    float tg = -ro.y / rd.y;
    tMax = tg;
    vec3 p = ro + rd * tg;
    float wz = p.z + t * SPEED;
    float ax = abs(p.x);
    float road = 1.0 - smoothstep(3.1, 3.25, ax);

    vec3 asphalt = lin(vec3(0.022, 0.018, 0.03)) * (0.7 + 0.6 * noise(p.xz * 6.0));
    float dash = step(fract(wz * 0.22), 0.45) * (1.0 - smoothstep(0.05, 0.08, ax));
    float edge = 1.0 - smoothstep(0.035, 0.07, abs(ax - 2.95));

    vec3 rr = vec3(rd.x, -rd.y, rd.z);
    rr.x += (noise(p.xz * 2.5 + t * 0.2) - 0.5) * 0.025;
    rr.y += noise(p.xz * 1.7 + 3.0) * 0.006;
    vec3 refl = skyCol(normalize(rr), t);
    float fres = pow(1.0 - abs(rd.y), 5.0) * 0.9 + 0.06;
    float wet = 0.35 + 0.65 * smoothstep(0.25, 0.85, noise(p.xz * 0.3));
    vec3 roadC = asphalt + refl * fres * 0.42 * wet + vec3(0.85) * dash * 0.55 + ORANGE * edge * 1.1;

    float lw = 0.012 + 0.003 * tg;
    float gx = abs(fract(p.x * 0.5) - 0.5);
    float gz = abs(fract(wz * 0.5) - 0.5);
    float grid = max(smoothstep(lw, 0.0, gx), smoothstep(lw, 0.0, gz)) * exp(-tg * 0.025);
    vec3 offC = lin(vec3(0.010, 0.006, 0.02)) + PURPLE * grid * 0.75 + refl * fres * 0.10;
    col = mix(offC, roadC, road);

    // streetlight pools
    float lz = mod(wz, 9.0) - 4.5;
    col += ORANGE * 0.35 * exp(-(pow(ax - 3.6, 2.0) + lz * lz) * 0.32);

    col = mix(col, lin(vec3(0.36, 0.10, 0.22)), 1.0 - exp(-tg * 0.02));
  }

  // ---------------- palms (vertical planes at both road sides)
  for (int i = 0; i < 2; i++) {
    float side = i == 0 ? -1.0 : 1.0;
    float W = side * 7.0;
    if (abs(rd.x) > 1e-4) {
      float tp = (W - ro.x) / rd.x;
      if (tp > 0.0 && tp < tMax) {
        vec3 q = ro + rd * tp;
        float wz = q.z + t * SPEED;
        float cell = floor(wz / 9.0);
        float lz = wz - (cell + 0.5) * 9.0;
        float seed = hash11(cell * 7.13 + side * 3.1);
        if (seed > 0.12 && q.y > -0.1 && q.y < 8.5) {
          float d = palm(vec2(lz * side, q.y), seed);
          float aw = tp * 1.6 / uRes.y;
          float al = smoothstep(aw, -aw, d);
          vec3 pc = lin(vec3(0.008, 0.004, 0.014)) + PINK * smoothstep(aw * 4.0, 0.0, abs(d)) * 0.08;
          pc = mix(pc, lin(vec3(0.36, 0.10, 0.22)), 1.0 - exp(-tp * 0.009));
          col = mix(col, pc, al);
          if (al > 0.5) tMax = tp;
        }
      }
    }
  }

  // ---------------- streetlight poles + lamp glow
  for (int i = 0; i < 2; i++) {
    float side = i == 0 ? -1.0 : 1.0;
    float X = side * 4.3;
    if (abs(rd.x) > 1e-4) {
      float tp = (X - ro.x) / rd.x;
      if (tp > 0.0 && tp < tMax) {
        vec3 q = ro + rd * tp;
        float wz = q.z + t * SPEED;
        float lz = mod(wz, 9.0) - 4.5;
        float aw = tp * 1.6 / uRes.y;
        float pole = smoothstep(0.05 + aw, 0.05, abs(lz)) * step(0.0, q.y) * step(q.y, 4.4) * smoothstep(6.0, 11.0, tp);
        col = mix(col, lin(vec3(0.02, 0.012, 0.03)), pole);
      }
    }
  }
  float base = floor((ro.z + t * SPEED) / 9.0);
  for (int k = 0; k < 7; k++) {
    float z = (base + float(k)) * 9.0 + 4.5 - t * SPEED;
    for (int i = 0; i < 2; i++) {
      float side = i == 0 ? -1.0 : 1.0;
      vec3 L = vec3(side * 4.3, 4.45, z);
      vec3 oc = L - ro;
      float tl = dot(oc, rd);
      if (tl > 0.0 && tl < tMax + 0.5) {
        float d = length(oc - rd * tl);
        col += ORANGE * 0.0035 / (d * d + 0.0015) * exp(-tl * 0.02);
      }
    }
  }

  // ---------------- floating particles
  for (int l = 0; l < 2; l++) {
    float fl = float(l);
    vec2 pu = frag / uRes.y * (22.0 + fl * 14.0) + vec2(t * (0.25 + fl * 0.2), -t * (0.5 + fl * 0.3));
    vec2 pid = floor(pu);
    vec2 pf = fract(pu) - 0.5;
    float ph = hash21(pid + fl * 17.0);
    vec2 off = vec2(hash21(pid + 3.0), hash21(pid + 7.0)) - 0.5;
    float pd = length(pf - off * 0.6);
    col += mix(PINK, ORANGE, ph) * smoothstep(0.06, 0.0, pd) * step(0.94, ph) * (0.4 + 0.6 * sin(t * 1.5 + ph * 40.0)) * 0.35;
  }

  // ---------------- post
  col = hueShift(col, uHue);
  col *= mix(0.0, 1.0, smoothstep(0.0, 1.0, uIntro));
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  vec2 vu = frag / uRes;
  col *= mix(0.45, 1.0, smoothstep(1.15, 0.35, length((vu - 0.5) * vec2(1.25, 1.0))));
  col += (hash21(frag + fract(t * 7.0) * 100.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('Shader compile failed: ' + log);
  }
  return s;
}

/**
 * Creates the hero scene on a canvas.
 * opts: { quality, staticFrame, fixed: {time, mouse:[x,y], scroll, hue}, preserveDrawingBuffer }
 * Returns a controller, or null if WebGL is unavailable.
 */
export function createHeroScene(canvas, opts = {}) {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
  });
  if (!gl) return null;

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    console.warn('[RageBaitX] WebGL scene disabled:', e.message);
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uMouse', 'uScroll', 'uIntro', 'uHue', 'uCamPos', 'uCam'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  const fixed = opts.fixed || null;
  const state = {
    quality: opts.quality ?? 0.7,
    mouse: [0, 0],
    mouseTarget: [0, 0],
    scroll: 0,
    intro: fixed ? 1 : 0,
    running: false,
    raf: 0,
    start: performance.now(),
    frameTimes: [],
    frozenTime: 12.0,
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr * state.quality));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr * state.quality));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  }

  function draw(now) {
    resize();
    const elapsed = (now - state.start) / 1000;
    if (!fixed) {
      state.mouse[0] += (state.mouseTarget[0] - state.mouse[0]) * 0.05;
      state.mouse[1] += (state.mouseTarget[1] - state.mouse[1]) * 0.05;
      state.intro = Math.min(1, state.intro + 1 / 150);
    }
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, fixed ? fixed.time : opts.staticFrame ? state.frozenTime : elapsed + 4.0);
    gl.uniform2f(U.uMouse, ...(fixed ? fixed.mouse || [0, 0] : state.mouse));
    gl.uniform1f(U.uScroll, fixed ? fixed.scroll || 0 : state.scroll);
    gl.uniform1f(U.uIntro, fixed ? 1 : ease(state.intro));
    gl.uniform1f(U.uHue, fixed ? fixed.hue || 0 : 0);
    const cam = fixed && fixed.cam;
    gl.uniform3f(U.uCamPos, ...(cam ? cam.slice(0, 3) : [0, 0, 0]));
    gl.uniform4f(U.uCam, ...(cam ? [...cam.slice(3, 6), 1] : [0, 0, 0, 0]));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    if (!state.running) return;
    const t0 = performance.now();
    draw(now);
    // adaptive quality: watch the frame interval and back off on slow devices
    state.frameTimes.push(t0);
    if (state.frameTimes.length > 40) {
      const ft = state.frameTimes;
      const avg = (ft[ft.length - 1] - ft[0]) / (ft.length - 1);
      state.frameTimes = [];
      if (avg > 24 && state.quality > 0.42) state.quality = Math.max(0.4, state.quality - 0.12);
      else if (avg < 15 && state.quality < (opts.maxQuality ?? 0.85)) state.quality = Math.min(opts.maxQuality ?? 0.85, state.quality + 0.05);
    }
    state.raf = requestAnimationFrame(loop);
  }

  return {
    start() {
      if (opts.staticFrame || fixed) {
        state.intro = 1;
        draw(performance.now());
        return;
      }
      if (state.running) return;
      state.running = true;
      state.raf = requestAnimationFrame(loop);
    },
    stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    },
    setMouse(x, y) { state.mouseTarget = [x, y]; },
    setScroll(v) {
      state.scroll = v;
      if (opts.staticFrame) draw(performance.now());
    },
    renderOnce() { draw(performance.now()); },
    get running() { return state.running; },
  };
}
