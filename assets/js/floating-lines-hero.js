const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.17;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.72;
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.09;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  vec2 screenUv = gl_FragCoord.xy / iResolution.xy;
  float rightEdgeFade = 1.0 - smoothstep(0.72, 0.97, screenUv.x);
  float alpha = clamp(max(max(color.r, color.g), color.b) * 0.96, 0.0, 0.72);
  alpha *= pow(rightEdgeFade, 1.15);
  gl_FragColor = vec4(color.rgb * rightEdgeFade, alpha);
}
`;

const MAX_GRADIENT_STOPS = 8;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function hexToVec3(hex, Vector3Ctor) {
  let value = hex.trim();

  if (value.startsWith("#")) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  return new Vector3Ctor(r / 255, g / 255, b / 255);
}

async function bootFloatingLines() {
  const container = document.getElementById("floatingLinesHero");
  const heroSection = container?.closest(".hero-section") ?? null;

  if (!container) {
    return;
  }

  if (prefersReducedMotion) {
    container.dataset.floatingLines = "disabled";
    if (heroSection) heroSection.dataset.floatingLines = "disabled";
    return;
  }

  container.dataset.floatingLines = "loading";
  if (heroSection) heroSection.dataset.floatingLines = "loading";

  try {
    const three = await import("https://unpkg.com/three@0.161.0/build/three.module.js");
    const {
      Scene,
      OrthographicCamera,
      WebGLRenderer,
      PlaneGeometry,
      Mesh,
      ShaderMaterial,
      Vector3,
      Vector2,
      Clock,
      SRGBColorSpace
    } = three;

    const targetMouse = new Vector2(-1000, -1000);
    const currentMouse = new Vector2(-1000, -1000);
    const targetInfluence = { value: 0 };
    const currentInfluence = { value: 0 };
    const targetParallax = new Vector2(0, 0);
    const currentParallax = new Vector2(0, 0);

    const options = {
      linesGradient: ["#eff2f5", "#d7dfe6", "#b0bac6", "#808c9d", "#445c80"],
      enabledWaves: ["top", "middle", "bottom"],
      lineCount: [3, 5, 4],
      lineDistance: [9.2, 6.2, 8.4],
      topWavePosition: { x: 7.2, y: 0.52, rotate: -0.18 },
      middleWavePosition: { x: 3.6, y: -0.04, rotate: 0.08 },
      bottomWavePosition: { x: 1.5, y: -0.6, rotate: 0.18 },
      animationSpeed: 0.64,
      interactive: true,
      bendRadius: 6.2,
      bendStrength: -0.22,
      mouseDamping: 0.04,
      parallax: true,
      parallaxStrength: 0.06,
      mixBlendMode: "normal"
    };

    const getLineCount = (waveType) => {
      if (typeof options.lineCount === "number") return options.lineCount;
      if (!options.enabledWaves.includes(waveType)) return 0;
      const index = options.enabledWaves.indexOf(waveType);
      return options.lineCount[index] ?? 6;
    };

    const getLineDistance = (waveType) => {
      if (typeof options.lineDistance === "number") return options.lineDistance;
      if (!options.enabledWaves.includes(waveType)) return 0.1;
      const index = options.enabledWaves.indexOf(waveType);
      return options.lineDistance[index] ?? 0.1;
    };

    const topLineCount = options.enabledWaves.includes("top") ? getLineCount("top") : 0;
    const middleLineCount = options.enabledWaves.includes("middle") ? getLineCount("middle") : 0;
    const bottomLineCount = options.enabledWaves.includes("bottom") ? getLineCount("bottom") : 0;

    const topLineDistance = options.enabledWaves.includes("top") ? getLineDistance("top") * 0.01 : 0.01;
    const middleLineDistance = options.enabledWaves.includes("middle") ? getLineDistance("middle") * 0.01 : 0.01;
    const bottomLineDistance = options.enabledWaves.includes("bottom") ? getLineDistance("bottom") * 0.01 : 0.01;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.domElement.className = "floating-lines-canvas";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.opacity = "1";
    renderer.domElement.style.mixBlendMode = options.mixBlendMode;
    renderer.domElement.style.filter = "saturate(0.86) contrast(1.04) brightness(0.97)";
    container.appendChild(renderer.domElement);
    container.dataset.floatingLines = "mounted";
    if (heroSection) heroSection.dataset.floatingLines = "mounted";

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: options.animationSpeed },
      enableTop: { value: options.enabledWaves.includes("top") },
      enableMiddle: { value: options.enabledWaves.includes("middle") },
      enableBottom: { value: options.enabledWaves.includes("bottom") },
      topLineCount: { value: topLineCount },
      middleLineCount: { value: middleLineCount },
      bottomLineCount: { value: bottomLineCount },
      topLineDistance: { value: topLineDistance },
      middleLineDistance: { value: middleLineDistance },
      bottomLineDistance: { value: bottomLineDistance },
      topWavePosition: {
        value: new Vector3(options.topWavePosition.x, options.topWavePosition.y, options.topWavePosition.rotate)
      },
      middleWavePosition: {
        value: new Vector3(options.middleWavePosition.x, options.middleWavePosition.y, options.middleWavePosition.rotate)
      },
      bottomWavePosition: {
        value: new Vector3(options.bottomWavePosition.x, options.bottomWavePosition.y, options.bottomWavePosition.rotate)
      },
      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: options.interactive },
      bendRadius: { value: options.bendRadius },
      bendStrength: { value: options.bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: options.parallax },
      parallaxStrength: { value: options.parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },
      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1))
      },
      lineGradientCount: { value: 0 }
    };

    const stops = options.linesGradient.slice(0, MAX_GRADIENT_STOPS);
    uniforms.lineGradientCount.value = stops.length;
    stops.forEach((hex, i) => {
      const color = hexToVec3(hex, Vector3);
      uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
    });

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();

    const setSize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      container.dataset.floatingLinesSize = `${Math.round(width)}x${Math.round(height)}`;
      renderer.setSize(width, height, false);
      uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
    };

    setSize();

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setSize) : null;
    if (resizeObserver) {
      resizeObserver.observe(container);
    }

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = renderer.getPixelRatio();

      targetMouse.set(x * dpr, (rect.height - y) * dpr);
      targetInfluence.value = 1;

      if (options.parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallax.set(offsetX * options.parallaxStrength, offsetY * options.parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetInfluence.value = 0;
    };

    if (options.interactive && heroSection) {
      heroSection.addEventListener("pointermove", handlePointerMove);
      heroSection.addEventListener("pointerleave", handlePointerLeave);
    }

    let raf = 0;
    let markedReady = false;

    const renderLoop = () => {
      uniforms.iTime.value = clock.getElapsedTime();

      if (options.interactive) {
        currentMouse.lerp(targetMouse, options.mouseDamping);
        uniforms.iMouse.value.copy(currentMouse);
        currentInfluence.value += (targetInfluence.value - currentInfluence.value) * options.mouseDamping;
        uniforms.bendInfluence.value = currentInfluence.value;
      }

      if (options.parallax) {
        currentParallax.lerp(targetParallax, options.mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallax);
      }

      renderer.render(scene, camera);

      if (!markedReady) {
        container.dataset.floatingLines = "ready";
        if (heroSection) heroSection.dataset.floatingLines = "ready";
        markedReady = true;
      }

      raf = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(raf);
      if (resizeObserver) resizeObserver.disconnect();
      if (options.interactive && heroSection) {
        heroSection.removeEventListener("pointermove", handlePointerMove);
        heroSection.removeEventListener("pointerleave", handlePointerLeave);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    }, { once: true });
  } catch (error) {
    console.error("Floating lines hero failed to initialize", error);
    container.dataset.floatingLines = "error";
    if (heroSection) heroSection.dataset.floatingLines = "error";
  }
}

bootFloatingLines();



