/* ------------------------------------------------------------------
   Project-specific generative visuals (SVG). Each project gets its own
   drawing derived from what it actually does. All are illustrative
   artwork, not data plots.
------------------------------------------------------------------- */
(function () {
  "use strict";
  const V = "#9B7BFF", I = "#7FE7FF", M = "#D94BC8", Wt = "#EEEDF7";
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const svg = (inner, extra = "") => `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" ${extra}>${inner}</svg>`;
  const grid = (op = 0.06) => { let g = ""; for (let x = 0; x <= 400; x += 20) g += `<line x1="${x}" y1="0" x2="${x}" y2="260"/>`; for (let y = 0; y <= 260; y += 20) g += `<line x1="0" y1="${y}" x2="400" y2="${y}"/>`; return `<g stroke="${Wt}" stroke-opacity="${op}" stroke-width=".5">${g}</g>`; };

  const VIS = {
    optimizer() {
      // schematic loss curve: Adam phase then SGD phase after switch at 80%
      let a = "", b = ""; const sw = 0.8;
      for (let i = 0; i <= 100; i++) {
        const t = i / 100, x = 30 + t * 340;
        const y = 222 - (170 * Math.exp(-t * 4.2) + 12 * Math.sin(t * 40) * Math.exp(-t * 3)) + (t > sw ? (t - sw) * 60 : 0) - 12;
        (t <= sw ? (a += `${a ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`) : (b += `${b ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`));
        if (Math.abs(t - sw) < 0.006) b = `M${x.toFixed(1)},${y.toFixed(1)}`;
      }
      const sx = 30 + sw * 340;
      return svg(`${grid()}
        <path d="${a}" fill="none" stroke="${V}" stroke-width="2.2" class="draw"/>
        <path d="${b}" fill="none" stroke="${I}" stroke-width="2.4" class="draw d2"/>
        <line x1="${sx}" y1="20" x2="${sx}" y2="240" stroke="${Wt}" stroke-opacity=".5" stroke-dasharray="3 4"/>
        <circle cx="${sx}" cy="20" r="3.5" fill="${I}" class="pulse"/>
        <text x="${sx - 8}" y="252" fill="${Wt}" fill-opacity=".6" font-size="10" text-anchor="end" font-family="var(--mono)">Adam</text>
        <text x="${sx + 8}" y="252" fill="${I}" font-size="10" font-family="var(--mono)">SGD</text>
        <text x="${sx}" y="14" fill="${Wt}" fill-opacity=".7" font-size="9" text-anchor="middle" font-family="var(--mono)">switch @ 80%</text>`);
    },
    canopy() {
      const r = rng(7); let cells = "";
      const cols = 16, rows = 10, w = 400 / cols, h = 260 / rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const d = Math.hypot(x - 11, y - 4) + r() * 2.2; const risk = Math.max(0, 1 - d / 7);
        const c = risk > 0.62 ? M : risk > 0.3 ? V : I;
        const op = risk > 0.3 ? 0.18 + risk * 0.6 : 0.06 + r() * 0.1;
        cells += `<rect x="${x * w + 1}" y="${y * h + 1}" width="${w - 2}" height="${h - 2}" rx="2" fill="${c}" fill-opacity="${op.toFixed(2)}" ${risk > 0.62 ? 'class="blink" style="animation-delay:' + (r() * 2).toFixed(2) + 's"' : ""}/>`;
      }
      let contours = ""; for (let k = 1; k <= 4; k++) contours += `<ellipse cx="${11 * w + w / 2}" cy="${4 * h + h / 2}" rx="${k * 34}" ry="${k * 24}" fill="none" stroke="${Wt}" stroke-opacity="${0.22 - k * 0.04}" stroke-dasharray="2 5"/>`;
      return svg(`${cells}${contours}<rect class="scan" x="0" y="0" width="400" height="2" fill="${I}" fill-opacity=".7"/>`);
    },
    rf() {
      let bars = ""; const r = rng(3);
      for (let i = 0; i < 64; i++) { const x = 10 + i * 6; const peak = Math.exp(-((i - 22) ** 2) / 18) + 0.7 * Math.exp(-((i - 44) ** 2) / 8); const h = 8 + peak * 120 + r() * 14; bars += `<rect x="${x}" y="${232 - h}" width="3.4" height="${h}" fill="${peak > 0.4 ? I : V}" fill-opacity="${0.35 + peak * 0.6}" class="eq" style="animation-delay:${(r() * 1.2).toFixed(2)}s"/>`; }
      const drone = `<g transform="translate(300 58)" fill="none" stroke="${Wt}" stroke-width="1.4" stroke-opacity=".85"><rect x="-10" y="-5" width="20" height="10" rx="3"/><line x1="-10" y1="-3" x2="-30" y2="-14"/><line x1="10" y1="-3" x2="30" y2="-14"/><line x1="-10" y1="3" x2="-30" y2="14"/><line x1="10" y1="3" x2="30" y2="14"/><ellipse cx="-30" cy="-14" rx="11" ry="2.5"/><ellipse cx="30" cy="-14" rx="11" ry="2.5"/><ellipse cx="-30" cy="14" rx="11" ry="2.5"/><ellipse cx="30" cy="14" rx="11" ry="2.5"/></g>`;
      let waves = ""; for (let k = 0; k < 3; k++) waves += `<circle cx="300" cy="58" r="20" fill="none" stroke="${I}" class="ring" style="animation-delay:${k * 0.8}s"/>`;
      return svg(`${grid(0.05)}${bars}${waves}${drone}<line x1="0" y1="232" x2="400" y2="232" stroke="${Wt}" stroke-opacity=".3"/>`);
    },
    leaf() {
      const leaf = "M200 26 C 270 60 300 140 200 236 C 100 140 130 60 200 26 Z";
      let veins = ""; for (let i = 0; i < 7; i++) { const y = 70 + i * 22; const w = 52 - Math.abs(i - 3) * 6; veins += `<path d="M200 ${y + 14} Q ${200 - w * 0.6} ${y + 2} ${200 - w} ${y - 10}" /><path d="M200 ${y + 14} Q ${200 + w * 0.6} ${y + 2} ${200 + w} ${y - 10}" />`; }
      // angular margin arcs on the right (ArcFace idea)
      const arcs = `<g transform="translate(330 130)" fill="none"><circle r="46" stroke="${Wt}" stroke-opacity=".15"/>
        <line x1="0" y1="0" x2="40" y2="-23" stroke="${I}" stroke-width="1.6"/><line x1="0" y1="0" x2="46" y2="0" stroke="${V}" stroke-width="1.6"/>
        <path d="M30 0 A30 30 0 0 0 26 -15" stroke="${M}" stroke-width="2"/><circle cx="40" cy="-23" r="3" fill="${I}"/><circle cx="46" cy="0" r="3" fill="${V}"/></g>`;
      return svg(`${grid(0.04)}<g class="float"><path d="${leaf}" fill="${V}" fill-opacity=".12" stroke="${V}" stroke-width="1.6"/>
        <line x1="200" y1="34" x2="200" y2="232" stroke="${I}" stroke-width="1.2"/><g fill="none" stroke="${I}" stroke-opacity=".55" stroke-width=".9">${veins}</g></g>
        <rect class="scan" x="110" y="0" width="180" height="2" fill="${I}" fill-opacity=".8"/>${arcs}
        <g stroke="${Wt}" stroke-opacity=".5" fill="none"><path d="M96 30 h-14 v14"/><path d="M304 30 h14 v14"/><path d="M96 238 h-14 v-14"/><path d="M304 238 h14 v-14"/></g>`);
    },
    veena() {
      let strings = "";
      for (let s = 0; s < 4; s++) { let d = ""; for (let i = 0; i <= 80; i++) { const x = 20 + i * 4.5; const y = 70 + s * 26 + Math.sin(i * 0.35 + s) * (8 - s * 1.5) * Math.sin((i / 80) * Math.PI); d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; } strings += `<path d="${d}" fill="none" stroke="${s % 2 ? I : V}" stroke-width="${1.6 - s * 0.2}" class="vib" style="animation-delay:${s * 0.15}s"/>`; }
      let spec = ""; const r = rng(11); for (let i = 0; i < 40; i++) { const h = 6 + Math.abs(Math.sin(i * 0.7)) * 34 * (1 - i / 50) + r() * 6; spec += `<rect x="${20 + i * 9}" y="${238 - h}" width="5" height="${h}" fill="${i % 7 === 0 ? M : V}" fill-opacity=".55" class="eq" style="animation-delay:${(r()).toFixed(2)}s"/>`; }
      return svg(`${grid(0.04)}${strings}${spec}<circle cx="372" cy="40" r="5" fill="${I}" class="pulse"/>`);
    },
    graph() {
      const r = rng(19); const nodes = []; for (let i = 0; i < 26; i++) nodes.push([30 + r() * 340, 25 + r() * 210]);
      nodes[0] = [200, 130];
      let edges = ""; nodes.forEach((a, i) => { if (!i) return; const j = Math.floor(r() * i); const b = nodes[j]; edges += `<line x1="${a[0].toFixed(0)}" y1="${a[1].toFixed(0)}" x2="${b[0].toFixed(0)}" y2="${b[1].toFixed(0)}"/>`; });
      let dots = nodes.map((n, i) => `<circle cx="${n[0].toFixed(0)}" cy="${n[1].toFixed(0)}" r="${i ? 3.2 : 6}" fill="${i ? (Math.hypot(n[0] - 200, n[1] - 130) < 110 ? M : V) : M}"/>`).join("");
      let ripple = ""; for (let k = 0; k < 3; k++) ripple += `<circle cx="200" cy="130" r="10" fill="none" stroke="${M}" class="ring big" style="animation-delay:${k}s"/>`;
      return svg(`<g stroke="${Wt}" stroke-opacity=".22" stroke-width=".8">${edges}</g>${ripple}${dots}`);
    },
    clusters() {
      const r = rng(5); const C = [[110, 90, V], [270, 80, I], [210, 190, M]]; let pts = "";
      C.forEach(([cx, cy, c], ci) => { for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 46; pts += `<circle cx="${(cx + Math.cos(a) * d * 1.3).toFixed(1)}" cy="${(cy + Math.sin(a) * d * 0.8).toFixed(1)}" r="2.3" fill="${c}" fill-opacity=".8"/>`; } });
      const ell = C.map(([cx, cy, c], i) => `<ellipse cx="${cx}" cy="${cy}" rx="70" ry="44" fill="none" stroke="${c}" stroke-opacity=".5" stroke-dasharray="3 4" class="spin" style="transform-origin:${cx}px ${cy}px;animation-delay:${i}s"/>`).join("");
      const axes = `<g stroke="${Wt}" stroke-opacity=".3"><line x1="24" y1="236" x2="380" y2="236"/><line x1="24" y1="236" x2="24" y2="20"/></g><text x="380" y="250" text-anchor="end" fill="${Wt}" fill-opacity=".5" font-size="9" font-family="var(--mono)">PC1</text><text x="30" y="22" fill="${Wt}" fill-opacity=".5" font-size="9" font-family="var(--mono)">PC2</text>`;
      const therm = `<g transform="translate(350 40)"><rect x="-4" y="0" width="8" height="60" rx="4" fill="none" stroke="${Wt}" stroke-opacity=".5"/><rect x="-2" y="18" width="4" height="40" rx="2" fill="${M}" class="blink"/><circle cy="66" r="7" fill="${M}"/></g>`;
      return svg(`${axes}${ell}${pts}${therm}`);
    },
    dental() {
      let teeth = ""; for (let i = 0; i < 14; i++) { const a = Math.PI * (0.08 + (i / 13) * 0.84); const x = 200 - Math.cos(a) * 140, y = 220 - Math.sin(a) * 160; teeth += `<rect x="${(x - 9).toFixed(1)}" y="${(y - 12).toFixed(1)}" width="18" height="24" rx="7" transform="rotate(${((a * 180) / Math.PI - 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${Wt}" fill-opacity=".08" stroke="${i === 4 || i === 9 ? I : Wt}" stroke-opacity="${i === 4 || i === 9 ? 1 : 0.5}"/>`; }
      const marks = [4, 9].map((i) => { const a = Math.PI * (0.08 + (i / 13) * 0.84); const x = 200 - Math.cos(a) * 140, y = 220 - Math.sin(a) * 160; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="18" fill="none" stroke="${I}" stroke-dasharray="2 3" class="spin" style="transform-origin:${x.toFixed(1)}px ${y.toFixed(1)}px"/>`; }).join("");
      return svg(`${grid(0.05)}${teeth}${marks}<rect class="scan" x="0" y="0" width="400" height="2" fill="${V}"/><text x="200" y="150" text-anchor="middle" fill="${Wt}" fill-opacity=".45" font-size="10" font-family="var(--mono)">match?</text>`);
    },
    collab() {
      const teams = [[110, 120, V], [290, 120, I]]; let g = "";
      teams.forEach(([cx, cy, c]) => { g += `<circle cx="${cx}" cy="${cy}" r="58" fill="${c}" fill-opacity=".06" stroke="${c}" stroke-opacity=".4"/>`; for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.28; g += `<circle cx="${(cx + Math.cos(a) * 34).toFixed(1)}" cy="${(cy + Math.sin(a) * 34).toFixed(1)}" r="9" fill="#0a0a14" stroke="${c}" stroke-width="1.4"/>`; } });
      g += `<circle r="9" fill="#0a0a14" stroke="${M}" stroke-width="1.6"><animateMotion dur="5s" repeatCount="indefinite" path="M200 230 C 200 170 150 160 140 140"/></circle>`;
      g += `<path d="M168 120 H232" stroke="${Wt}" stroke-opacity=".35" stroke-dasharray="3 4"/>`;
      return svg(`${grid(0.04)}${g}`);
    },
    genai() {
      const r = rng(23); let cells = ""; const n = 20, s = 13;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = x - 9.5, dy = y - 9.5; const inside = Math.hypot(dx, dy) < 7 + Math.sin(Math.atan2(dy, dx) * 5) * 1.6;
        cells += `<rect x="${70 + x * s}" y="${0 + y * s}" width="${s - 1}" height="${s - 1}" fill="${inside ? (r() > 0.5 ? V : I) : Wt}" fill-opacity="${inside ? 0.75 : 0.05 + r() * 0.1}" class="${inside ? "resolve" : ""}" style="animation-delay:${(r() * 1.5).toFixed(2)}s"/>`;
      }
      return svg(`<g transform="translate(0 0)">${cells}</g><text x="20" y="246" fill="${Wt}" fill-opacity=".55" font-size="10" font-family="var(--mono)">prompt → image</text>`);
    },
    commerce() {
      let g = ""; for (let i = 0; i < 6; i++) { const x = 40 + (i % 3) * 110, y = 30 + Math.floor(i / 3) * 110; g += `<rect x="${x}" y="${y}" width="90" height="92" rx="8" fill="${Wt}" fill-opacity=".04" stroke="${Wt}" stroke-opacity=".2"/><rect x="${x + 10}" y="${y + 10}" width="70" height="44" rx="4" fill="${i === 4 ? I : V}" fill-opacity="${i === 4 ? 0.5 : 0.18}"/><rect x="${x + 10}" y="${y + 64}" width="44" height="5" rx="2" fill="${Wt}" fill-opacity=".35"/><rect x="${x + 10}" y="${y + 75}" width="26" height="5" rx="2" fill="${Wt}" fill-opacity=".2"/>`; }
      return svg(`${g}<circle cx="300" cy="185" r="5" fill="${I}" class="pulse"/>`);
    },
    calendar() {
      let g = ""; const r = rng(31);
      for (let i = 0; i < 35; i++) { const x = 40 + (i % 7) * 46, y = 40 + Math.floor(i / 7) * 42; const ev = [3, 9, 10, 17, 24, 30].includes(i); g += `<rect x="${x}" y="${y}" width="40" height="36" rx="5" fill="${ev ? (i === 17 ? I : V) : Wt}" fill-opacity="${ev ? (i === 17 ? 0.6 : 0.3) : 0.04}" stroke="${Wt}" stroke-opacity=".12"/><text x="${x + 6}" y="${y + 13}" font-size="8" fill="${Wt}" fill-opacity=".5" font-family="var(--mono)">${i + 1}</text>`; }
      return svg(`${g}<rect x="40" y="18" width="314" height="1" fill="${Wt}" fill-opacity=".3"/>`);
    },
  };
  window.VISUALS = (key) => (VIS[key] ? VIS[key]() : "");
})();
