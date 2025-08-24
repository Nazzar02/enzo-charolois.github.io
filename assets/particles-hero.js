// assets/particles-hero.js — preset = screenshot params
import { Renderer, Camera, Geometry, Program, Mesh } from 'https://esm.sh/ogl';

const el = document.getElementById('hero-bg');
if (!el) console.warn('[Particles] #hero-bg not found');

/* ======== Fixed options from your screenshot ======== */
const opts = {
  particleColors: ['#8793ab'], // Color
  particleCount: 400,          // Count
  particleSpread: 10,          // Spread
  speed: 0.3,                  // Speed
  particleBaseSize: 200,       // Base Size
  sizeRandomness: 1,
  alphaParticles: true,        // Particle Transparency = ON
  disableRotation: true,       // Disable Rotation = ON
  cameraDistance: 20,
  moveParticlesOnHover: true,  // Mouse Interaction = ON
  particleHoverFactor: 1.0
};
/* ==================================================== */

function hexToRgb(hex){
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const int = parseInt(hex, 16);
  return [ ((int>>16)&255)/255, ((int>>8)&255)/255, (int&255)/255 ];
}

const vertex = /* glsl */`
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if (uAlphaParticles < 0.5) {
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

function initParticles(container, o = {}){
  if (!container) return;

  const {
    particleColors, particleCount, particleSpread, speed,
    particleBaseSize, sizeRandomness, alphaParticles,
    cameraDistance, moveParticlesOnHover, particleHoverFactor, disableRotation
  } = { ...opts, ...o };

  const renderer = new Renderer({ depth: false, alpha: true, antialias: false });
  const gl = renderer.gl;
  container.appendChild(gl.canvas);
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 15 });
  camera.position.set(0, 0, cameraDistance);

  function resize(){
    const width  = container.clientWidth  || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height);
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
  }
  new ResizeObserver(resize).observe(container);
  resize();

  const count = particleCount;
  const positions = new Float32Array(count * 3);
  const randoms   = new Float32Array(count * 4);
  const colors    = new Float32Array(count * 3);
  const palette   = (particleColors && particleColors.length ? particleColors : ['#fff']);

  for (let i = 0; i < count; i++) {
    let x, y, z, len;
    do { x = Math.random()*2-1; y = Math.random()*2-1; z = Math.random()*2-1; len = x*x+y*y+z*z; }
    while (len > 1 || len === 0);
    const r = Math.cbrt(Math.random());
    positions.set([x*r, y*r, z*r], i*3);
    randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i*4);
    colors.set(hexToRgb(palette[Math.floor(Math.random()*palette.length)]), i*3);
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    random:   { size: 4, data: randoms   },
    color:    { size: 3, data: colors    },
  });

  const program = new Program(gl, {
    vertex, fragment,
    uniforms: {
      uTime:           { value: 0 },
      uSpread:         { value: particleSpread },
      uBaseSize:       { value: particleBaseSize },
      uSizeRandomness: { value: sizeRandomness },
      uAlphaParticles: { value: alphaParticles ? 1 : 0 },
    },
    transparent: true,
    depthTest: false,
  });

  const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

  const mouse = { x: 0, y: 0 };
  function onMove(e){
    const rect = container.getBoundingClientRect();
    const cx = Math.max(rect.left, Math.min(rect.right, e.clientX));
    const cy = Math.max(rect.top,  Math.min(rect.bottom, e.clientY));
    mouse.x = ((cx - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -(((cy - rect.top)  / rect.height) * 2 - 1);
  }
  if (moveParticlesOnHover) window.addEventListener('mousemove', onMove);

  let raf = 0, last = performance.now(), elapsed = 0;
  function update(t){
    raf = requestAnimationFrame(update);
    const dt = t - last; last = t; elapsed += dt * speed;

    program.uniforms.uTime.value = elapsed * 0.001;

    if (moveParticlesOnHover) {
      particles.position.x = -mouse.x * particleHoverFactor;
      particles.position.y = -mouse.y * particleHoverFactor;
    } else {
      particles.position.x = particles.position.y = 0;
    }

    if (!disableRotation) {
      particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.10;
      particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      particles.rotation.z += 0.01 * speed;
    }

    renderer.render({ scene: particles, camera });
  }
  raf = requestAnimationFrame(update);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

if (el) initParticles(el);

// Tip: si 400 particules tirent trop le perf sur mobile, passe à ~200 en dessous de 640px.
