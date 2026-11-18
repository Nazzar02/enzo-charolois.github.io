import { strataMesh } from './mesh.js'
import { engravingPlate } from './engraving.js'

const vertex = `
attribute vec3 position, normal;
attribute float metal;
uniform float yaw, pitch, aspect;
varying vec3 world, model, N;
varying float finish, lowerCut;
void main(){
  float c=cos(yaw),s=sin(yaw),u=cos(pitch),v=sin(pitch);
  mat3 turn=mat3(c,0.,-s, 0.,1.,0., s,0.,c);
  mat3 view=mat3(1.,0.,0., 0.,u,v, 0.,-v,u);
  world=view*turn*position;
  N=view*turn*normal; model=position; lowerCut=metal<0.?1.:0.; finish=metal<0.?-1.-metal:metal;
  float perspective=13.8/(13.8-world.z);
  gl_Position=vec4((world.x-.03)*perspective*.565/aspect, (world.y+.012)*perspective*.565,-world.z*.18,1.);
}`
const rearFragment = `
precision highp float;
varying vec3 world, N;
void main(){
  gl_FragColor=vec4(normalize(N)*.5+.5, .5+world.z*.19);
}`
const glassFragment = `
precision highp float;
varying vec3 world, model, N;
varying float finish, lowerCut;
uniform sampler2D rear, engraving;
uniform vec2 viewport;
uniform vec3 tint;
uniform float breath;
float strip(float x,float width){return exp(-x*x/(width*width));}
float hash(vec2 p){return fract(sin(mod(dot(p,vec2(23.71,53.17)),6.28))*4375.54);}
vec3 studio(vec3 d,vec3 p){
  // Two area lights and black flags, sampled by both reflection and transmission.
  vec3 env=vec3(.034,.046,.061)+.065*tint*max(0.,d.y+.4);
  float key=strip(d.x+.67+p.x*.11+p.y*.14+breath,.30)*smoothstep(-.65,.4,d.y+p.y*.16);
  float edge=strip(d.x+.91+p.y*.057,.082);
  float window=strip(d.x-.50+p.y*.13,.24)*strip(d.y-.19,.67);
  env+=vec3(.91,.93,.94)*key+vec3(.86,.89,.96)*edge;
  env+=vec3(.71,.67,.59)*window;
  env+=vec3(.58,.68,.73)*strip(d.y+.61+p.x*.20,.052)*smoothstep(-.6,.2,d.z);
  return env;
}
void main(){
  vec3 n=normalize(N),eye=normalize(vec3(0.,0.,13.8)-world);
  vec3 reflection=reflect(-eye,n);
  vec3 inside=refract(-eye,n,1./1.50);
  vec2 uv=gl_FragCoord.xy/viewport;
  vec4 back=texture2D(rear,uv);
  float depth=clamp(world.z-(back.a-.5)/.19,.025,2.6);
  vec2 offset=inside.xy*depth*.12*vec2(viewport.y/viewport.x,1.);
  vec4 hit=texture2D(rear,clamp(uv+offset,vec2(.001),vec2(.999)));
  if(hit.a>.01)back=hit;
  vec3 backN=normalize(back.rgb*2.-1.);
  float cosine=dot(inside,-backN);
  float critical=1.-2.25*(1.-cosine*cosine);
  vec3 exiting=normalize(1.50*inside+(1.50*cosine+sqrt(max(.001,critical)))*backN);
  float trapped=1.-smoothstep(-.075,.085,critical);
  vec3 exitRay=mix(exiting,reflect(inside,-backN),trapped);
  vec3 exitPos=world+inside*depth;
  vec3 transmitted=studio(exitRay,exitPos)*(.52+.30*trapped);
  // The light behind the object is refracted across the opposite bevel.
  float caustic=strip(exitRay.x*.75+exitRay.y*.60-exitPos.y*.13+.20,.13);
  vec3 dispersion=.51+.49*cos(vec3(.4,2.35,4.5)+exitPos.y*2.1+exitRay.x*4.);
  transmitted+=caustic*(vec3(.13)+dispersion*.45);
  float trace=world.y+exitRay.y*.22+sin(exitRay.x*2.+world.x)*.12;
  transmitted+=.16*tint*pow(.5+.5*cos(trace*103.),9.)*strip(trace+.15,.29);
  vec3 absorption=exp(-depth*(vec3(.50,.45,.40)+.78*(1.-tint)));
  vec3 surface=studio(reflection,world);
  float facing=clamp(abs(dot(n,eye)),0.,1.);
  float fresnel=.045+.955*pow(1.-facing,4.);
  float rim=pow(1.-facing,2.7);
  vec3 glass=mix(transmitted*absorption,surface,fresnel);
  float softReflection=strip(reflection.x*.62+reflection.y*.52+world.x*.26-world.y*.10-.12,.16);
  glass+=vec3(.19,.205,.21)*softReflection*(.24+.76*fresnel);
  glass+=surface*(.20+.10*finish)+.06*tint+.13*rim;
  // The lower cut leaves a graphite backing under the polished glass ribs.
  float ribWeight=smoothstep(.05,.95,lowerCut);
  vec3 ribs=(vec3(.095,.11,.125)+surface*.59+.04*tint)*(.38+finish*1.06);
  vec3 col=mix(glass,ribs,ribWeight*.91);
  col+=vec3(.60,.69,.72)*strip(reflection.x+.78+world.y*.087,.046)*.26;
  col+=(hash(floor(gl_FragCoord.xy))-.5)*.009;
  // Frontal incidence reveals the smoked face. Oblique views expose its rear facets.
  float frontal=smoothstep(.65,.97,facing)*(1.-ribWeight);
  vec3 smoked=vec3(.080,.103,.119)+surface*.29+tint*.045+softReflection*.08;
  col=mix(col,smoked,.81*frontal);
  // Project the inscription into the physical coordinates of the visible face.
  float height=(model.y+1.31)/2.67;
  vec2 local=model.xz-vec2(.33,-.06)*height;
  float frontAngle=.21+1.04719755;
  vec2 face=vec2(sin(frontAngle),cos(frontAngle));
  float distance=dot(local,face), row=0.;
  for(int i=1;i<3;i++){
    float a=frontAngle+float(i)*2.0943951;
    vec2 candidate=vec2(sin(a),cos(a));
    if(dot(local,candidate)>distance){
      distance=dot(local,candidate);face=candidate;row=3.-float(i);
    }
  }
  float u=.5+dot(local,vec2(face.y,-face.x))/1.65;
  float v=.5-(model.y-.15)/.50;
  if(u>.0 && u<1. && v>.0 && v<1. && lowerCut<.01){
    vec2 atlas=vec2(u,(row+v)*.25);
    float mask=texture2D(engraving,atlas).r;
    vec2 bevel=vec2(.0018,.0015);
    float lip=texture2D(engraving,atlas-bevel).r-texture2D(engraving,atlas+bevel).r;
    vec3 etch=vec3(.77,.79,.76)+.07*tint+.05*rim;
    col=mix(col,etch,mask*.90)+lip*.32;
  }
  gl_FragColor=vec4(col,1.);
}`

function linkProgram(gl, fragmentSource) {
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragmentSource],
  ]) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw Error(gl.getShaderInfoLog(shader))
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw Error(gl.getProgramInfoLog(program))
  const uniforms = Object.fromEntries(
    [
      'yaw',
      'pitch',
      'aspect',
      'tint',
      'breath',
      'rear',
      'engraving',
      'viewport',
    ].map((k) => [k, gl.getUniformLocation(program, k)]),
  )
  const attributes = ['position', 'normal', 'metal'].map((k) =>
    gl.getAttribLocation(program, k),
  )
  return { program, uniforms, attributes }
}
export function createStudio(canvas, locale = document.documentElement.lang) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  if (!gl) return null
  const rear = linkProgram(gl, rearFragment),
    glass = linkProgram(gl, glassFragment)
  const passes = [rear, glass]
  for (const pass of passes) {
    const mesh = strataMesh(pass === rear)
    pass.buffer = gl.createBuffer()
    pass.count = mesh.length / 7
    gl.bindBuffer(gl.ARRAY_BUFFER, pass.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW)
  }
  const inscription = gl.createTexture()
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, inscription)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    engravingPlate(locale),
  )
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  )
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.activeTexture(gl.TEXTURE0)
  const target = gl.createFramebuffer(),
    texture = gl.createTexture(),
    depthBuffer = gl.createRenderbuffer()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.clearColor(0, 0, 0, 0)
  let lastW = 0,
    lastH = 0
  function draw(angle, tilt, color, light = 0) {
    const dpr = Math.min(devicePixelRatio, 1.65)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)),
      h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (w !== lastW || h !== lastH) {
      lastW = w
      lastH = h
      canvas.width = w
      canvas.height = h
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        w,
        h,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      )
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target)
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      )
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer,
      )
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw Error('Rear-surface target unavailable')
    }
    gl.viewport(0, 0, w, h)
    for (const pass of passes) {
      gl.bindBuffer(gl.ARRAY_BUFFER, pass.buffer)
      const front = pass === glass
      gl.bindFramebuffer(gl.FRAMEBUFFER, front ? null : target)
      gl.bindTexture(gl.TEXTURE_2D, front ? texture : null)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.cullFace(front ? gl.BACK : gl.FRONT)
      gl.useProgram(pass.program)
      pass.attributes.forEach((attr, i) => {
        if (attr < 0) return
        gl.enableVertexAttribArray(attr)
        gl.vertexAttribPointer(
          attr,
          i === 2 ? 1 : 3,
          gl.FLOAT,
          false,
          28,
          i * 12,
        )
      })
      const u = pass.uniforms
      // Centre the normal of a broad face on the camera; the bevel keeps a small rake.
      gl.uniform1f(u.yaw, angle - (0.21 + Math.PI / 3) + 0.055)
      gl.uniform1f(u.pitch, 0.057 + tilt)
      gl.uniform1f(u.aspect, w / h)
      if (front) {
        gl.uniform3fv(u.tint, color)
        gl.uniform1f(u.breath, light)
        gl.uniform2f(u.viewport, w, h)
        gl.uniform1i(u.rear, 0)
        gl.uniform1i(u.engraving, 1)
      }
      gl.drawArrays(gl.TRIANGLES, 0, pass.count)
    }
  }
  draw.dispose = () => {
    for (const pass of passes) gl.deleteBuffer(pass.buffer)
    gl.deleteFramebuffer(target)
    gl.deleteRenderbuffer(depthBuffer)
    gl.deleteTexture(texture)
    gl.deleteTexture(inscription)
    gl.deleteProgram(rear.program)
    gl.deleteProgram(glass.program)
  }
  return draw
}
