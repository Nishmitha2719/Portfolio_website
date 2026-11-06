/* ------------------------------------------------------------------
   Background engine
   1. A half-resolution WebGL nebula shader (falls back to CSS).
   2. One particle system that forms the hero name, then morphs into a
      different 3D structure for each section as you scroll.
------------------------------------------------------------------- */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = () => window.innerWidth < 760;

  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, active: false };
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    mouse.nx = e.clientX / innerWidth - 0.5; mouse.ny = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  document.addEventListener("pointerleave", () => (mouse.active = false));

  const SCENES = ["hero", "about", "skills", "projects", "research", "experience", "contact"];
  // Tints per scene (violet → ice mix and magenta amount) for the shader.
  const TINT = {
    hero: [0.55, 0.10], about: [0.35, 0.05], skills: [0.70, 0.05], projects: [0.45, 0.22],
    research: [0.85, 0.0], experience: [0.5, 0.12], contact: [0.3, 0.35],
  };
  const state = { scene: "hero", t: 0, tint: [0.55, 0.1], tintTarget: [0.55, 0.1], visible: true };
  const anchors = {}; // scene -> element whose centre the structure should sit on
  window.BG = { setScene, state, anchor: (scene, el) => (anchors[scene] = el) };

  /* ---------------- 1. Nebula shader ---------------- */
  const glCanvas = document.getElementById("bg-shader");
  let gl = null, uni = {};
  try { gl = glCanvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
  if (gl) {
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec2 k;uniform float s;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
 float tt=t*.035;
 vec2 q=vec2(fbm(p*1.6+tt),fbm(p*1.6-tt+3.1));
 float f=fbm(p*1.3+q*1.7+vec2(0.,s*.25));
 vec3 base=vec3(.0196,.0196,.035);
 vec3 violet=vec3(.48,.30,1.);vec3 ice=vec3(.45,.86,1.);vec3 mag=vec3(.85,.25,.75);
 vec3 tint=mix(violet,ice,k.x*q.y);tint=mix(tint,mag,k.y*smoothstep(.45,.8,q.x));
 float neb=smoothstep(.35,.95,f)*.42;
 neb*=smoothstep(1.25,.15,length(p-vec2(.25,-.05)));
 vec2 mp=(m-.5*r)/r.y;
 float light=.11/(1.+18.*dot(p-mp,p-mp));
 vec3 col=base+tint*neb+mix(violet,ice,.5)*light*.6;
 col*=1.-.55*dot(uv-.5,uv-.5)*2.;
 gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (v && f) {
      const prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.useProgram(prog);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        ["r", "t", "m", "k", "s"].forEach((u) => (uni[u] = gl.getUniformLocation(prog, u)));
        document.documentElement.classList.add("has-shader");
      } else gl = null;
    } else gl = null;
  }
  const SHADER_SCALE = 0.5;
  function sizeShader() {
    if (!gl) return;
    glCanvas.width = Math.round(innerWidth * SHADER_SCALE); glCanvas.height = Math.round(innerHeight * SHADER_SCALE);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
  }
  let smx = innerWidth / 2, smy = innerHeight / 2;
  function drawShader() {
    if (!gl) return;
    smx += (mouse.x - smx) * 0.06; smy += (mouse.y - smy) * 0.06;
    gl.uniform2f(uni.r, glCanvas.width, glCanvas.height);
    gl.uniform1f(uni.t, state.t);
    gl.uniform2f(uni.m, smx * SHADER_SCALE, (innerHeight - smy) * SHADER_SCALE);
    gl.uniform2f(uni.k, state.tint[0], state.tint[1]);
    gl.uniform1f(uni.s, scrollY / innerHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ---------------- 2. Particles ---------------- */
  const cv = document.getElementById("bg-particles");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, DPR = 1, N = 0, NODES = 0;
  let P = []; // particles
  const targets = {}; // scene -> Float32Array(N*3)
  let namePts = null; // screen-space points for hero name
  let nameReady = false;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }

  function sizeParticles() {
    DPR = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function init() {
    N = reduce ? 700 : small() ? 1000 : 2600;
    NODES = small() ? 70 : 130;
    P = [];
    for (let i = 0; i < N; i++) {
      P.push({
        x: rand(-1.4, 1.4), y: rand(-1, 1), z: rand(-1, 1),
        vx: 0, vy: 0, ox: 0, oy: 0, // screen-space repel offset
        sx: 0, sy: 0, ss: 1, // projected
        hue: Math.random(), node: i < NODES, tw: Math.random() * 6.28,
      });
    }
    buildTargets();
  }

  // World units: 1 = half the smaller viewport dimension.
  function unit() { return Math.min(W, H) * 0.5; }

  function buildTargets() {
    const T = (fn) => { const a = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const v = fn(i); a[i * 3] = v[0]; a[i * 3 + 1] = v[1]; a[i * 3 + 2] = v[2]; } return a; };
    const asp = W / H;
    const spreadX = Math.max(1.2, asp * 1.15);
    // starfield used by leftovers
    const star = () => [rand(-spreadX, spreadX) * 1.1, rand(-1.15, 1.15), rand(-1, 1.2)];

    // About: six interest clusters arranged on an ellipse
    const centers = [];
    for (let c = 0; c < 6; c++) { const a = (c / 6) * Math.PI * 2 + 0.4; centers.push([Math.cos(a) * 0.95 * Math.min(asp, 1.6), Math.sin(a) * 0.6, Math.sin(a * 2) * 0.4]); }
    targets.about = T((i) => {
      if (i % 3 === 0) return star();
      const c = centers[i % 6]; const r = i < NODES ? 0.16 : 0.24;
      return [c[0] + gauss() * r, c[1] + gauss() * r, c[2] + gauss() * r];
    });

    // Skills: neural network layers
    const layers = [4, 7, 9, 7, 4];
    targets.skills = T((i) => {
      if (i < NODES) {
        const L = i % layers.length; const k = Math.floor(i / layers.length) % layers[L];
        const x = (L - (layers.length - 1) / 2) * 0.48 * Math.min(asp, 1.7);
        const y = (k - (layers[L] - 1) / 2) * 0.2;
        return [x, y, Math.sin(k * 1.3 + L) * 0.15];
      }
      if (i % 2) return star();
      // signal dust flowing along layers
      const L = Math.floor(Math.random() * layers.length);
      return [(L - 2) * 0.48 * Math.min(asp, 1.7) + gauss() * 0.06, gauss() * 0.8, gauss() * 0.3];
    });

    // Projects: Fibonacci sphere + ring
    const golden = Math.PI * (3 - Math.sqrt(5));
    targets.projects = T((i) => {
      if (i % 5 === 4) { const a = rand(0, 6.283); const rr = rand(1.05, 1.25); return [Math.cos(a) * rr, gauss() * 0.03, Math.sin(a) * rr]; }
      if (i % 7 === 6) return star();
      const y = 1 - (i / (N - 1)) * 2; const rad = Math.sqrt(1 - y * y); const th = golden * i;
      return [Math.cos(th) * rad * 0.72, y * 0.72, Math.sin(th) * rad * 0.72];
    });

    // Research: a wave surface (animated in update)
    const g = Math.ceil(Math.sqrt(N * 0.8));
    targets.research = T((i) => {
      if (i >= g * g) return star();
      const gx = i % g, gz = Math.floor(i / g);
      return [(gx / (g - 1) - 0.5) * 2.4 * Math.min(asp, 1.6), 0, (gz / (g - 1) - 0.5) * 1.8];
    });
    targets.research.wave = true;

    // Experience: double helix (a timeline in 3D)
    targets.experience = T((i) => {
      if (i % 4 === 3) return star();
      const tt = (i / N) * 2; const strand = i % 2 ? Math.PI : 0;
      const a = tt * Math.PI * 6 + strand;
      return [Math.cos(a) * 0.32 + 0.0, (tt - 1) * 1.15, Math.sin(a) * 0.32];
    });

    // Contact: torus portal
    targets.contact = T((i) => {
      if (i % 6 === 5) return star();
      const u = rand(0, 6.283), v = rand(0, 6.283);
      const R = 0.5, r = 0.05 + Math.random() * 0.05;
      return [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)];
    });

    // Hero (before name sampled): a drifting universe
    targets.hero = T((i) => star());
    targets.heroStars = targets.hero;
    if (namePts) mapName();
  }

  // Sample the hero name from an offscreen canvas aligned with the real <h1>.
  function sampleName() {
    const h1 = document.getElementById("hero-name");
    if (!h1) return;
    const rect = h1.getBoundingClientRect();
    if (rect.width < 10) return;
    const cs = getComputedStyle(h1);
    const oc = document.createElement("canvas");
    const sc = 1; // sample in CSS px
    oc.width = Math.ceil(rect.width * sc); oc.height = Math.ceil(rect.height * sc);
    const o = oc.getContext("2d");
    o.fillStyle = "#fff";
    o.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * sc}px ${cs.fontFamily}`;
    o.textBaseline = "middle"; o.textAlign = "center";
    if ("letterSpacing" in o) o.letterSpacing = cs.letterSpacing;
    o.fillText(h1.textContent.trim(), oc.width / 2, oc.height / 2 + parseFloat(cs.fontSize) * 0.04);
    const data = o.getImageData(0, 0, oc.width, oc.height).data;
    const pts = [];
    const step = Math.max(2, Math.round(Math.sqrt((rect.width * rect.height) / (N * 0.9)) * 0.62));
    for (let y = 0; y < oc.height; y += step) for (let x = 0; x < oc.width; x += step) {
      if (data[(y * oc.width + x) * 4 + 3] > 140) pts.push([rect.left + x / sc + rand(-0.6, 0.6), rect.top + scrollY + y / sc + rand(-0.6, 0.6)]);
    }
    // shuffle so particles fly in from everywhere
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    namePts = pts;
    mapName();
    nameReady = pts.length > 50;
    document.documentElement.classList.toggle("name-particles", nameReady);
  }

  // Convert name screen points to world coords (camera with no rotation).
  function mapName() {
    const u = unit(); const a = new Float32Array(N * 3); const stars = targets.heroStars;
    const count = Math.min(namePts.length, N - Math.floor(N * 0.12));
    for (let i = 0; i < N; i++) {
      if (i < count) {
        a[i * 3] = (namePts[i][0] - W / 2) / u; a[i * 3 + 1] = (namePts[i][1] - H / 2) / u; a[i * 3 + 2] = 0;
      } else { a[i * 3] = stars[i * 3]; a[i * 3 + 1] = stars[i * 3 + 1]; a[i * 3 + 2] = stars[i * 3 + 2]; }
    }
    a.nameCount = count; a.name = true;
    targets.hero = a;
  }

  function setScene(name) {
    if (!targets[name] || state.scene === name) return;
    state.scene = name;
    state.tintTarget = TINT[name] || TINT.hero;
  }

  /* camera */
  let rotY = 0, rotX = 0, camRot = 0, rotEff = 0; const anc = { x: 0, y: 0 }; // camRot eases to 0 in hero so name stays flat
  function update(dt) {
    const tgt = targets[state.scene];
    const isHero = state.scene === "hero" && tgt.name;
    const isPortal = state.scene === "contact";
    camRot += ((isHero ? 0 : isPortal ? 0.2 : 1) - camRot) * 0.04;
    const zc = Math.cos(state.t * 0.12), zs = Math.sin(state.t * 0.12);
    rotY += dt * 0.00012 * (reduce ? 0 : 1);
    const wantX = mouse.ny * 0.35, wantY = mouse.nx * 0.5;
    rotX += (wantX * camRot - rotX) * 0.05;
    const TAU = Math.PI * 2;
    const want = isPortal ? Math.round(rotEff / TAU) * TAU : rotY;
    rotEff += (want - rotEff) * (isPortal ? 0.03 : 1);
    if (isPortal) rotY = rotEff; // so leaving the portal continues smoothly
    const ry = rotEff * camRot + wantY * camRot, rx = rotX;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const u = unit(); const persp = 2.6;
    const heroScroll = isHero ? scrollY : 0;
    let ax = 0, ay = 0; const an = anchors[state.scene];
    if (an) { const r = an.getBoundingClientRect(); ax = (r.left + r.width / 2 - W / 2) / u; ay = (r.top + r.height / 2 - H / 2) / u; }
    anc.x += (ax - anc.x) * 0.08; anc.y += (ay - anc.y) * 0.08;
    const ease = reduce ? 1 : 0.055;
    const time = state.t;
    for (let i = 0; i < N; i++) {
      const p = P[i];
      let tx = tgt[i * 3], ty = tgt[i * 3 + 1], tz = tgt[i * 3 + 2];
      if (isPortal) { const rx0 = tx * zc - ty * zs; ty = tx * zs + ty * zc; tx = rx0; }
      if (tgt.wave) ty = Math.sin(tx * 2.2 + time * 0.9) * 0.12 + Math.cos(tz * 3.1 + time * 0.6) * 0.09 + 0.15;
      const isName = isHero && i < tgt.nameCount;
      if (!isName) { tx += Math.sin(time * 0.3 + p.tw) * 0.012; ty += Math.cos(time * 0.27 + p.tw) * 0.012; }
      const e = isName && !reduce ? 0.085 : ease;
      p.x += (tx - p.x) * e; p.y += (ty - p.y) * e; p.z += (tz - p.z) * e;
      // rotate
      let x1 = p.x * cy - p.z * sy, z1 = p.x * sy + p.z * cy;
      let y1 = p.y * cx - z1 * sx; z1 = p.y * sx + z1 * cx;
      const k = isName ? 1 : persp / (persp + z1);
      let X = W / 2 + (x1 * k + anc.x) * u, Y = H / 2 + (y1 * k + anc.y) * u - (isName ? heroScroll : 0);
      // mouse repel (screen space, springy)
      if (mouse.active && !reduce) {
        const dx = X + p.ox - mouse.x, dy = Y + p.oy - mouse.y; const d2 = dx * dx + dy * dy;
        const R = isName ? 90 : 130;
        if (d2 < R * R && d2 > 0.01) { const d = Math.sqrt(d2); const f = (1 - d / R) * (isName ? 3.2 : 1.6); p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
      p.vx += -p.ox * 0.06; p.vy += -p.oy * 0.06; p.vx *= 0.82; p.vy *= 0.82;
      p.ox += p.vx; p.oy += p.vy;
      p.sx = X + p.ox; p.sy = Y + p.oy; p.ss = k; p.zz = z1; p.isName = isName;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const sceneLines = state.scene !== "hero" && state.scene !== "research";
    // connection lines among nodes
    if (!reduce || true) {
      const maxD = state.scene === "skills" ? 105 : state.scene === "contact" ? 60 : 100;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < NODES; i++) {
        const a = P[i];
        for (let j = i + 1; j < NODES; j++) {
          const b = P[j]; const dx = a.sx - b.sx, dy = a.sy - b.sy; const d2 = dx * dx + dy * dy;
          let lim = maxD;
          if (!sceneLines) { // in hero: only connect near cursor (interactive network)
            const mx = a.sx - mouse.x, my = a.sy - mouse.y;
            if (!mouse.active || mx * mx + my * my > 220 * 220) continue;
            lim = 130;
          }
          if (d2 < lim * lim) {
            const al = (1 - Math.sqrt(d2) / lim) * (sceneLines ? 0.18 : 0.3);
            ctx.strokeStyle = `rgba(150,140,255,${al})`;
            ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
          }
        }
      }
    }
    ctx.globalCompositeOperation = "lighter";
    const t = state.t;
    for (let i = 0; i < N; i++) {
      const p = P[i];
      if (p.sx < -10 || p.sx > W + 10 || p.sy < -10 || p.sy > H + 10) continue;
      let s, a;
      if (p.isName) { s = small() ? 1.6 : 1.9; a = 0.95; }
      else {
        s = (p.node ? 2.2 : 1.2) * p.ss; a = Math.max(0.12, Math.min(0.9, 0.55 * p.ss - p.zz * 0.15)) * (0.75 + 0.25 * Math.sin(t * 1.5 + p.tw));
      }
      const ice = p.hue > 0.62; const mag = p.hue < 0.06;
      ctx.fillStyle = p.isName
        ? (p.hue > 0.8 ? `rgba(127,231,255,${a})` : `rgba(238,237,247,${a})`)
        : mag ? `rgba(217,75,200,${a})` : ice ? `rgba(127,231,255,${a})` : `rgba(150,120,255,${a})`;
      ctx.fillRect(p.sx - s / 2, p.sy - s / 2, s, s);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last); last = now;
    if (state.visible) {
      state.t += dt / 1000;
      state.tint[0] += (state.tintTarget[0] - state.tint[0]) * 0.03;
      state.tint[1] += (state.tintTarget[1] - state.tint[1]) * 0.03;
      drawShader();
      update(dt); draw();
    }
    requestAnimationFrame(frame);
  }

  function resize() { sizeShader(); sizeParticles(); buildTargets(); if (namePts) sampleName(); }
  let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(resize, 150); });
  document.addEventListener("visibilitychange", () => (state.visible = !document.hidden));

  sizeShader(); sizeParticles(); init();
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    // let the h1 entrance settle into its final box before sampling
    setTimeout(sampleName, 120);
  });
  window.BG.resample = sampleName;
  requestAnimationFrame(frame);
})();
