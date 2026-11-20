// Plays the riding couple with a see-through background. ride.mp4 holds the picture on its left
// half and the transparency on its right half (see tools/prepare_assets.py); a WebGL canvas
// combines them every frame. Without WebGL it returns null and the page keeps the still.
const VERT = `attribute vec2 p; varying vec2 uv;
void main() { uv = vec2((p.x + 1.0) * 0.5, (1.0 - p.y) * 0.5); gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision mediump float; uniform sampler2D t; varying vec2 uv;
void main() {
  vec3 c = texture2D(t, vec2(uv.x * 0.5, uv.y)).rgb;
  float a = smoothstep(0.04, 0.96, texture2D(t, vec2(0.5 + uv.x * 0.5, uv.y)).r);
  gl_FragColor = vec4(c * a, a);
}`;

export function createAlphaVideo(video, canvas, onFirstFrame) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  for (const [k, v] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) {
    gl.texParameteri(gl.TEXTURE_2D, k, v);
  }

  let shown = false;
  function draw() {
    if (video.readyState >= 2 && video.videoWidth) {
      const w = video.videoWidth / 2, h = video.videoHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!shown && !video.paused) { shown = true; onFirstFrame?.(); }
    }
    if (video.requestVideoFrameCallback && !video.paused) video.requestVideoFrameCallback(draw);
    else requestAnimationFrame(draw);
  }
  draw();
  return true;
}
