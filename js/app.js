/* ------------------------------------------------------------------
   Interaction layer: cursor, magnetic buttons, nav, section scenes,
   about, skills constellation, project gallery + detail panel,
   research figures, experience timeline, contact.
------------------------------------------------------------------- */
(function () {
  "use strict";
  const D = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => innerWidth <= 760;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Cursor ---------------- */
  const cursor = $(".cursor");
  if (finePointer && !reduce) {
    document.documentElement.classList.add("has-cursor");
    const dot = $(".cursor-dot"), ring = $(".cursor-ring"), label = $(".cursor-label");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    addEventListener("pointerup", () => cursor.classList.remove("is-down"));
    (function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      dot.style.transform = `translate(${x}px,${y}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("a, button, [data-cursor]");
      cursor.classList.toggle("is-hover", !!t);
      const lab = t && t.closest("[data-cursor]");
      cursor.classList.toggle("is-label", !!lab);
      if (lab) label.textContent = lab.getAttribute("data-cursor");
    });
  }

  /* ---------------- Magnetic ---------------- */
  function magnetize(el) {
    if (!finePointer || reduce) return;
    const strength = el.classList.contains("portal-btn") ? 0.35 : 0.28;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - (r.left + r.width / 2)) * strength).toFixed(1) + "px");
      el.style.setProperty("--my", ((e.clientY - (r.top + r.height / 2)) * strength).toFixed(1) + "px");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); });
  }
  $$(".magnetic").forEach(magnetize);

  /* ---------------- Nav, progress, scenes ---------------- */
  const nav = $("#nav"), bar = $(".progress span");
  const sections = $$("[data-scene]");
  const navLinks = $$("[data-nav]");
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      nav.classList.toggle("is-solid", scrollY > 40);
      const mid = innerHeight * 0.5;
      let current = sections[0];
      for (const s of sections) { if (s.getBoundingClientRect().top <= mid) current = s; }
      const scene = current.dataset.scene;
      // morph out of the name a little before the hero leaves
      const heroOut = scene === "hero" && scrollY > innerHeight * 0.45 ? "about" : scene;
      window.BG && window.BG.setScene(heroOut);
      navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === scene));
      scrubStatement(); fillTimeline();
    });
  }
  addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = $(".menu-btn"), menu = $("#mobile-menu");
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(open)); menu.hidden = !open;
    document.body.classList.toggle("panel-lock", open);
  });
  $$("#mobile-menu a").forEach((a) => a.addEventListener("click", () => { menuBtn.setAttribute("aria-expanded", "false"); menu.hidden = true; document.body.classList.remove("panel-lock"); }));

  /* ---------------- Reveals ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, .chapters").forEach((el) => io.observe(el));

  /* ---------------- About: statement scrub ---------------- */
  const st = $("#statement");
  const HL = ["medicinal", "veena,", "drones", "IEEE", "runs."];
  st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="w${HL.includes(w) ? " hl" : ""}">${esc(w)}</span>`).join(" ");
  const words = $$(".w", st);
  function scrubStatement() {
    if (reduce) { words.forEach((w) => w.classList.add("on")); return; }
    const r = st.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
  }

  /* ---------------- About: interests orbit ---------------- */
  const INTERESTS = [
    ["Artificial Intelligence", "The question underneath everything else: building systems that perceive, reason and act usefully."],
    ["Machine Learning", "Where most of my projects start: features, models and honest evaluation, from forest-loss risk to cattle health."],
    ["Deep Learning", "CNN backbones and metric learning. EfficientNet with ArcFace is the work that became my IEEE paper."],
    ["Generative AI", "Models that create. My image-generation internship project is where I first saw how creative AI can be."],
    ["Software Development", "Ideas only count once they run. React, Next.js and the MERN stack turn models into things people can use."],
    ["Research & experimentation", "Asking “what if?” and then measuring it, like when exactly an optimizer should switch from Adam to SGD."],
  ];
  const orbitList = $("#orbit-items"), iName = $("#interest-name"), iText = $("#interest-text");
  orbitList.innerHTML = INTERESTS.map(([n], i) => `<li><button type="button" data-i="${i}" ${i === 0 ? 'class="is-on"' : ""} aria-pressed="${i === 0}">${esc(n)}</button></li>`).join("");
  const orbitItems = $$("li", orbitList);
  let orbitAngle = 0, orbitPaused = false;
  function pickInterest(i) {
    $$("button", orbitList).forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-pressed", String(k === i)); });
    iName.textContent = INTERESTS[i][0]; iText.textContent = INTERESTS[i][1];
  }
  orbitList.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pickInterest(+b.dataset.i); });
  orbitList.addEventListener("pointerover", (e) => { const b = e.target.closest("button"); if (b) { pickInterest(+b.dataset.i); orbitPaused = true; } });
  orbitList.addEventListener("pointerleave", () => (orbitPaused = false));
  orbitList.addEventListener("focusin", (e) => { const b = e.target.closest("button"); if (b) { pickInterest(+b.dataset.i); orbitPaused = true; } });
  orbitList.addEventListener("focusout", () => (orbitPaused = false));
  const orbitEl = $("#orbit");
  let orbitVisible = false;
  new IntersectionObserver((es) => (orbitVisible = es[0].isIntersecting)).observe(orbitEl);
  function placeOrbit() {
    if (isMobile()) { orbitItems.forEach((li) => (li.style.transform = "")); return; }
    const w = orbitEl.clientWidth, h = orbitEl.clientHeight;
    orbitItems.forEach((li, i) => {
      const a = orbitAngle + (i / orbitItems.length) * Math.PI * 2;
      const rx = w * 0.46, ry = h * 0.44;
      li.style.transform = `translate(${(w / 2 + Math.cos(a) * rx).toFixed(1)}px, ${(h / 2 + Math.sin(a) * ry).toFixed(1)}px)`;
    });
  }
  (function orbitLoop() {
    if (orbitVisible && !orbitPaused && !reduce) orbitAngle += 0.0016;
    if (orbitVisible) placeOrbit();
    requestAnimationFrame(orbitLoop);
  })();
  placeOrbit();

  /* ---------------- Skills constellation ---------------- */
  const GROUP_COLORS = ["#9B7BFF", "#7FE7FF", "#D94BC8", "#EEEDF7"];
  const GROUP_POS = [[0.18, 0.3], [0.5, 0.64], [0.79, 0.28], [0.16, 0.76]];
  const LINKS = [["Python", "Machine Learning"], ["Python", "Deep Learning"], ["Python", "Jupyter Notebook"], ["JavaScript", "React"], ["React", "Next.js"],
    ["TypeScript", "Next.js"], ["Git", "GitHub"], ["Deep Learning", "Computer Vision"], ["LLMs", "Generative AI"], ["NLP", "LLMs"], ["GitHub", "Next.js"], ["Java", "C++"], ["VS Code", "Python"]];
  const nodesWrap = $("#const-nodes"), linesSvg = $("#const-lines"), cbox = $("#constellation");
  nodesWrap.innerHTML = D.skills.map((g, gi) => `<div class="cgroup-m"><h3>${esc(g.group)}</h3><div>${g.items.map(([n], ii) =>
    `<button type="button" class="cnode" style="--c:${GROUP_COLORS[gi]}" data-g="${gi}" data-i="${ii}" aria-describedby="const-info">${esc(n)}</button>`).join("")}</div></div>`).join("");
  const cnodes = $$(".cnode", nodesWrap);
  const nodeInfo = (b) => { const g = D.skills[+b.dataset.g]; return { group: g.group, name: g.items[+b.dataset.i][0], text: g.items[+b.dataset.i][1] }; };
  let base = []; // base positions
  function layoutConstellation() {
    if (isMobile()) { cnodes.forEach((b) => (b.style.transform = "")); linesSvg.innerHTML = ""; return; }
    const w = cbox.clientWidth, h = cbox.clientHeight;
    base = cnodes.map((b) => {
      const gi = +b.dataset.g, ii = +b.dataset.i, n = D.skills[gi].items.length;
      const [cx, cy] = GROUP_POS[gi]; const a = (ii / n) * Math.PI * 2 - Math.PI / 2 + gi;
      const r = n > 4 ? 0.12 : 0.1;
      return [cx * w + Math.cos(a) * r * w * 0.95, cy * h + Math.sin(a) * r * h * 1.45];
    });
    linesSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const byName = {}; cnodes.forEach((b, k) => (byName[nodeInfo(b).name] = k));
    let html = "";
    D.skills.forEach((g, gi) => {
      const idx = cnodes.map((b, k) => (+b.dataset.g === gi ? k : -1)).filter((k) => k >= 0);
      idx.forEach((k, j) => { const m = idx[(j + 1) % idx.length]; html += `<line data-a="${k}" data-b="${m}"/>`; });
      html += `<text x="${GROUP_POS[gi][0] * w}" y="${GROUP_POS[gi][1] * h + 4}" text-anchor="middle">${esc(g.group)}</text>`;
    });
    LINKS.forEach(([a, b]) => { if (byName[a] != null && byName[b] != null) html += `<line data-a="${byName[a]}" data-b="${byName[b]}" stroke-dasharray="3 5"/>`; });
    linesSvg.innerHTML = html;
  }
  const cmouse = { x: 0, y: 0 };
  cbox.addEventListener("pointermove", (e) => { const r = cbox.getBoundingClientRect(); cmouse.x = (e.clientX - r.left) / r.width - 0.5; cmouse.y = (e.clientY - r.top) / r.height - 0.5; });
  let constVisible = false;
  new IntersectionObserver((es) => (constVisible = es[0].isIntersecting)).observe(cbox);
  let ct = 0;
  (function constLoop() {
    if (constVisible && !isMobile() && base.length) {
      ct += reduce ? 0 : 0.012;
      const pos = base.map(([x, y], k) => {
        const gi = +cnodes[k].dataset.g; const depth = 14 + gi * 6;
        return [x + Math.sin(ct + k * 1.7) * 6 - cmouse.x * depth, y + Math.cos(ct * 0.8 + k) * 6 - cmouse.y * depth];
      });
      cnodes.forEach((b, k) => (b.style.transform = `translate(${pos[k][0].toFixed(1)}px, ${pos[k][1].toFixed(1)}px) translate(-50%,-50%)`));
      $$("line", linesSvg).forEach((l) => { const a = pos[+l.dataset.a], b = pos[+l.dataset.b]; l.setAttribute("x1", a[0]); l.setAttribute("y1", a[1]); l.setAttribute("x2", b[0]); l.setAttribute("y2", b[1]); });
    }
    requestAnimationFrame(constLoop);
  })();
  function activateNode(b) {
    const info = nodeInfo(b); const k = cnodes.indexOf(b);
    $("#ci-group").textContent = info.group; $("#ci-name").textContent = info.name; $("#ci-text").textContent = info.text;
    $("#ci-group").style.color = GROUP_COLORS[+b.dataset.g] === "#EEEDF7" ? "var(--muted)" : GROUP_COLORS[+b.dataset.g];
    const linked = new Set([k]);
    $$("line", linesSvg).forEach((l) => { const on = +l.dataset.a === k || +l.dataset.b === k; l.classList.toggle("on", on); if (on) { linked.add(+l.dataset.a); linked.add(+l.dataset.b); } });
    cnodes.forEach((n, j) => { n.classList.toggle("is-on", j === k); n.classList.toggle("is-dim", !linked.has(j)); });
  }
  function clearNodes() { cnodes.forEach((n) => n.classList.remove("is-dim")); }
  nodesWrap.addEventListener("pointerover", (e) => { const b = e.target.closest(".cnode"); if (b) activateNode(b); });
  nodesWrap.addEventListener("pointerleave", clearNodes);
  nodesWrap.addEventListener("focusin", (e) => { const b = e.target.closest(".cnode"); if (b) activateNode(b); });
  nodesWrap.addEventListener("click", (e) => { const b = e.target.closest(".cnode"); if (b) activateNode(b); });
  layoutConstellation();

  /* ---------------- Projects ---------------- */
  const grid = $("#project-grid"), filters = $("#filters");
  const spanOf = (p) => (p.id === "fixed-switch-optimizer" ? "span-6" : p.featured ? "span-3" : "");
  grid.innerHTML = D.projects.map((p) => {
    const live = p.links.find((l) => /live/i.test(l[0]));
    return `<article class="pcard ${spanOf(p)}" data-id="${p.id}" data-cats="${p.cats.join(" ")}" data-cursor="View">
      <div class="pcard-inner">
        <div class="pvis">${spanOf(p) === "span-6" ? window.VISUALS(p.visual).replace("xMidYMid slice", "xMidYMid meet") : window.VISUALS(p.visual)}${p.metric ? `<span class="pmetric">${esc(p.metric[0])} ${esc(p.metric[1])}</span>` : ""}</div>
        <div class="pbody">
          ${p.featured ? `<span class="flag">Research highlight</span>` : ""}
          <p class="pcat">${esc(p.label)}</p>
          <h3 class="ptitle">${esc(p.title)}</h3>
          ${p.subtitle ? `<p class="psub">${esc(p.subtitle)}</p>` : ""}
          <p class="psum">${esc(p.summary)}</p>
          <div class="tags">${p.tech.slice(0, 5).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <div class="pmore"><button type="button" class="open" data-open="${p.id}">View details<span class="sr"> about ${esc(p.title)}</span></button>
          ${live ? `<a class="plive" href="${live[1]}" target="_blank" rel="noopener noreferrer" data-cursor="Visit">Live demo</a>` : ""}</div>
        </div>
      </div></article>`;
  }).join("");
  // whole card opens details (but keep live-demo link working)
  const style = document.createElement("style");
  style.textContent = `.pmore .open::before{content:"";position:absolute;inset:0;z-index:1}.plive{position:relative;z-index:2}`;
  document.head.appendChild(style);

  const counts = Object.fromEntries(D.categories.map(([k]) => [k, k === "all" ? D.projects.length : D.projects.filter((p) => p.cats.includes(k)).length]));
  filters.innerHTML = D.categories.map(([k, n], i) => `<button type="button" class="filter" data-f="${k}" aria-pressed="${i === 0}">${esc(n)}<sup>${counts[k]}</sup></button>`).join("");
  const cards = $$(".pcard", grid);
  filters.addEventListener("click", (e) => {
    const b = e.target.closest(".filter"); if (!b || b.getAttribute("aria-pressed") === "true") return;
    $$(".filter", filters).forEach((f) => f.setAttribute("aria-pressed", String(f === b)));
    const f = b.dataset.f;
    const before = new Map(cards.filter((c) => !c.classList.contains("is-hidden")).map((c) => [c, c.getBoundingClientRect()]));
    cards.forEach((c) => c.classList.toggle("is-hidden", !(f === "all" || c.dataset.cats.split(" ").includes(f))));
    if (reduce) return;
    cards.filter((c) => !c.classList.contains("is-hidden")).forEach((c, i) => {
      const r = c.getBoundingClientRect(); const o = before.get(c);
      if (o) c.animate([{ transform: `translate(${o.left - r.left}px, ${o.top - r.top}px)` }, { transform: "none" }], { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" });
      else c.animate([{ opacity: 0, transform: "translateY(30px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 650, delay: i * 50, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
    });
  });

  // 3D tilt + light
  if (finePointer && !reduce) {
    cards.forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        const k = c.classList.contains("span-6") ? 3 : 7;
        c.style.setProperty("--ry", ((px - 0.5) * k).toFixed(2) + "deg"); c.style.setProperty("--rx", ((0.5 - py) * k).toFixed(2) + "deg");
        c.style.setProperty("--lx", (px * 100).toFixed(1) + "%"); c.style.setProperty("--ly", (py * 100).toFixed(1) + "%");
      });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    const portrait = $(".portrait");
    portrait.addEventListener("pointermove", (e) => { const r = portrait.getBoundingClientRect(); portrait.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 10}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 10}deg)`; });
    portrait.addEventListener("pointerleave", () => (portrait.style.transform = ""));
  }

  /* ---------------- Project detail panel ---------------- */
  const panel = $("#panel"), pbody = $("#panel-body"), pscroll = $("#panel-scroll"), pclose = $("#panel-close");
  let openId = null, returnFocus = null;
  const byId = Object.fromEntries(D.projects.map((p) => [p.id, p]));
  function renderPanel(p) {
    const i = D.projects.indexOf(p); const prev = D.projects[(i - 1 + D.projects.length) % D.projects.length], next = D.projects[(i + 1) % D.projects.length];
    const links = p.links.filter((l) => l[1]);
    const pubLink = p.id === "medicinal-leaf" && D.publication.url ? [["Read the paper on IEEE", D.publication.url]] : [];
    const allLinks = [...links, ...pubLink];
    pbody.innerHTML = `
      <p class="pd-cat">${esc(p.label)}</p>
      <h2 class="pd-title" id="panel-title">${esc(p.title)}</h2>
      <p class="pd-sub">${esc(p.subtitle || "")}</p>
      <div class="pd-vis">${window.VISUALS(p.visual).replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="xMidYMid meet"')}</div>
      <div class="pd-grid">
        <div>
          <p class="pd-desc">${esc(p.description)}</p>
          ${p.sections.map(([h, items]) => `<div class="pd-sec"><h3>${esc(h)}</h3><ul class="pd-list">${items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul></div>`).join("")}
        </div>
        <aside class="pd-side">
          ${p.metric ? `<div><h3>Result</h3><p class="pd-metric">${esc(p.metric[0])}<small>${esc(p.metric[1])}</small></p></div>` : ""}
          <div><h3>Technologies</h3><div class="tags">${p.tech.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>
          ${allLinks.length ? `<div><h3>Links</h3><div class="pd-links">${allLinks.map(([n, u]) => `<a class="btn btn-ghost" href="${esc(u)}" target="_blank" rel="noopener noreferrer"><span>${esc(n)}</span></a>`).join("")}</div></div>` : ""}
        </aside>
      </div>
      <nav class="pd-nav" aria-label="More projects">
        <button type="button" data-go="${prev.id}"><small>Previous</small><b>${esc(prev.title)}</b></button>
        <button type="button" data-go="${next.id}"><small>Next</small><b>${esc(next.title)}</b></button>
      </nav>`;
  }
  function setClipFrom(el) {
    const r = el ? el.getBoundingClientRect() : { top: innerHeight / 2, left: innerWidth / 2, right: innerWidth / 2, bottom: innerHeight / 2 };
    panel.style.setProperty("--ct", Math.max(0, r.top) + "px"); panel.style.setProperty("--cl", Math.max(0, r.left) + "px");
    panel.style.setProperty("--cr", Math.max(0, innerWidth - r.right) + "px"); panel.style.setProperty("--cb", Math.max(0, innerHeight - r.bottom) + "px");
  }
  function openProject(id, fromEl) {
    const p = byId[id]; if (!p) return;
    returnFocus = openId ? returnFocus : document.activeElement;
    renderPanel(p); pscroll.scrollTop = 0;
    if (!openId) {
      setClipFrom(fromEl || $(`.pcard[data-id="${id}"]`));
      panel.hidden = false; panel.offsetWidth; // reflow
      panel.classList.add("is-open"); document.body.classList.add("panel-lock");
    }
    openId = id;
    if (location.hash !== "#" + id) { try { history.replaceState(null, "", "#" + id); } catch (e) {} }
    setTimeout(() => pclose.focus({ preventScroll: true }), 50);
  }
  function closeProject() {
    if (!openId) return;
    const card = $(`.pcard[data-id="${openId}"]`);
    setClipFrom(card && card.offsetParent ? card : null);
    panel.classList.remove("is-open"); openId = null;
    const done = () => { if (!openId) { panel.hidden = true; document.body.classList.remove("panel-lock"); } };
    reduce ? done() : setTimeout(done, 700);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openProject(o.dataset.open, o.closest(".pcard") || o); return; }
    const g = e.target.closest("[data-go]");
    if (g) openProject(g.dataset.go);
  });
  pclose.addEventListener("click", closeProject);
  document.addEventListener("keydown", (e) => {
    if (!openId) return;
    if (e.key === "Escape") closeProject();
    if (e.key === "Tab") { // focus trap
      const f = $$("button, a[href]", panel).filter((x) => x.offsetParent !== null || x === pclose);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  function fromHash() { const h = location.hash.slice(1); if (byId[h]) openProject(h); else if (openId && !h) closeProject(); }
  addEventListener("hashchange", fromHash);

  /* ---------------- Research ---------------- */
  if (D.publication.url) {
    $("#pub-link-slot").innerHTML = `<a href="${esc(D.publication.url)}" target="_blank" rel="noopener noreferrer">Read on IEEE Xplore</a>`;
  }
  if (D.publication.title) $("#s1-title").textContent = D.publication.title;

  // count-up
  const num = $(".result-num");
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return; o.disconnect();
    if (reduce) return;
    const target = parseFloat(num.dataset.count); const t0 = performance.now();
    (function tick(now) { const p = clamp((now - t0) / 1600, 0, 1); const v = target * (1 - Math.pow(1 - p, 4)); num.innerHTML = v.toFixed(2) + "<small>%</small>"; if (p < 1) requestAnimationFrame(tick); })(t0);
  }, { threshold: 0.6 }).observe(num);

  // Optimizer schematic
  const oc = $("#opt-chart"), octx = oc.getContext("2d");
  let optMode = "fixed", optP = 0, optVisible = false;
  function lossAt(t) { return 0.14 + 0.82 * Math.exp(-4.6 * t) + 0.05 * Math.sin(t * 46) * Math.exp(-2.2 * t) + 0.018 * Math.sin(t * 131); }
  function switchPoint() {
    if (optMode === "fixed") return 0.8;
    // DMC: first point where a smoothed slope falls under a threshold (stabilized)
    for (let t = 0.1; t < 1; t += 0.005) { const s = (lossAt(t - 0.04) - lossAt(t + 0.04)) / 0.08; if (s < 0.09) return t; }
    return 0.6;
  }
  function drawOpt() {
    const dpr = Math.min(devicePixelRatio || 1, 2); const w = oc.clientWidth, h = oc.clientHeight;
    if (oc.width !== Math.round(w * dpr)) { oc.width = Math.round(w * dpr); oc.height = Math.round(h * dpr); }
    octx.setTransform(dpr, 0, 0, dpr, 0, 0); octx.clearRect(0, 0, w, h);
    const L = 34, R = w - 12, T = 16, B = h - 64, MB = h - 22; // main plot and momentum strip
    const X = (t) => L + t * (R - L), Y = (v) => B - (v / 1.05) * (B - T);
    octx.strokeStyle = "rgba(238,237,247,.08)"; octx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = T + (i / 4) * (B - T); octx.beginPath(); octx.moveTo(L, y); octx.lineTo(R, y); octx.stroke(); }
    octx.strokeStyle = "rgba(238,237,247,.35)"; octx.beginPath(); octx.moveTo(L, T); octx.lineTo(L, B); octx.lineTo(R, B); octx.stroke();
    octx.fillStyle = "rgba(238,237,247,.5)"; octx.font = "11px 'JetBrains Mono', monospace";
    octx.save(); octx.translate(12, (T + B) / 2); octx.rotate(-Math.PI / 2); octx.textAlign = "center"; octx.fillText("training loss", 0, 0); octx.restore();
    octx.textAlign = "right"; octx.fillText("training budget →", R, MB + 18);
    const sp = switchPoint();
    // stabilization window (DMC)
    if (optMode === "dmc") { octx.fillStyle = "rgba(127,231,255,.07)"; octx.fillRect(X(sp - 0.08), T, X(sp) - X(sp - 0.08), B - T); }
    const end = optP;
    const seg = (a, b, col, wdt) => { if (b <= a) return; octx.strokeStyle = col; octx.lineWidth = wdt; octx.beginPath(); for (let t = a; t <= b + 1e-6; t += 0.003) { let v = lossAt(t); if (t > sp) v -= (t - sp) * 0.09; v += t > sp ? 0 : 0; t === a ? octx.moveTo(X(t), Y(v)) : octx.lineTo(X(t), Y(v)); } octx.stroke(); };
    seg(0, Math.min(end, sp), "#9B7BFF", 2.2);
    seg(sp, end, "#7FE7FF", 2.4);
    if (end >= sp) {
      octx.setLineDash([3, 4]); octx.strokeStyle = "rgba(238,237,247,.55)"; octx.lineWidth = 1; octx.beginPath(); octx.moveTo(X(sp), T); octx.lineTo(X(sp), MB); octx.stroke(); octx.setLineDash([]);
      octx.fillStyle = "#7FE7FF"; octx.beginPath(); octx.arc(X(sp), Y(lossAt(sp)), 4.5, 0, 7); octx.fill();
      octx.fillStyle = "#EEEDF7"; octx.textAlign = sp > 0.7 ? "right" : "left";
      octx.fillText(optMode === "fixed" ? "switch at 80% of budget" : "switch when loss stabilizes", X(sp) + (sp > 0.7 ? -8 : 8), T + 10);
    }
    octx.textAlign = "left"; octx.fillStyle = "#9B7BFF"; octx.fillText("Adam", X(0.04), Y(0.98));
    if (end > sp + 0.05) { octx.fillStyle = "#7FE7FF"; octx.fillText("SGD", X(Math.min(sp + 0.03, 0.93)), Y(lossAt(sp)) + 26); }
    // momentum strip
    octx.fillStyle = "rgba(238,237,247,.45)"; octx.textAlign = "left"; octx.fillText("momentum", L, B + 20);
    const mY0 = MB, mH = 14;
    octx.strokeStyle = "rgba(238,237,247,.15)"; octx.strokeRect(L, mY0 - mH, R - L, mH);
    for (let t = 0; t <= end; t += 0.01) {
      let m;
      if (t <= sp) m = 0.5; else m = optMode === "fixed" ? 0.9 : 0.5 + 0.4 * (1 - Math.exp(-(t - sp) * 14));
      octx.fillStyle = t <= sp ? `rgba(155,123,255,${m})` : `rgba(127,231,255,${m})`;
      octx.fillRect(X(t), mY0 - mH * m, (R - L) * 0.01 + 0.5, mH * m);
    }
  }
  function animateOpt() {
    if (reduce) { optP = 1; drawOpt(); return; }
    optP = 0; const t0 = performance.now();
    (function tick(now) { optP = clamp((now - t0) / 2400, 0, 1); drawOpt(); if (optP < 1) requestAnimationFrame(tick); })(t0);
  }
  $$(".seg").forEach((b) => b.addEventListener("click", () => {
    optMode = b.dataset.mode; $$(".seg").forEach((s) => { s.classList.toggle("is-on", s === b); s.setAttribute("aria-pressed", String(s === b)); }); animateOpt();
  }));
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); animateOpt(); } }, { threshold: 0.4 }).observe(oc);
  drawOpt();

  // RF waterfall
  const rc = $("#rf-chart"), rctx = rc.getContext("2d");
  rc.width = 256; rc.height = 120;
  let rfVisible = false, rfT = 0;
  new IntersectionObserver((es) => (rfVisible = es[0].isIntersecting)).observe(rc);
  const rfRow = rctx.createImageData(256, 1);
  function cmap(v) { // void → violet → ice → white
    v = clamp(v, 0, 1);
    if (v < 0.45) { const k = v / 0.45; return [5 + 134 * k, 5 + 87 * k, 9 + 246 * k]; }
    if (v < 0.8) { const k = (v - 0.45) / 0.35; return [139 - 12 * k, 92 + 139 * k, 255]; }
    const k = (v - 0.8) / 0.2; return [127 + 111 * k, 231 + 6 * k, 255 - 8 * k];
  }
  rctx.fillStyle = "#050509"; rctx.fillRect(0, 0, 256, 120);
  function rfStep() {
    rfT++;
    const hop = 40 + ((Math.floor(rfT / 9) * 53) % 170); // frequency-hopping control link
    const burst = rfT % 9 < 6;
    for (let x = 0; x < 256; x++) {
      let v = Math.random() * 0.1;
      v += 0.55 * Math.exp(-((x - 200) ** 2) / 30) * (0.8 + 0.2 * Math.sin(rfT * 0.2)); // steady video downlink band
      if (burst) v += 0.8 * Math.exp(-((x - hop) ** 2) / 4);
      const [r, g, b] = cmap(v); const i = x * 4;
      rfRow.data[i] = r; rfRow.data[i + 1] = g; rfRow.data[i + 2] = b; rfRow.data[i + 3] = 255;
    }
    rctx.drawImage(rc, 0, 0, 256, 119, 0, 1, 256, 119);
    rctx.putImageData(rfRow, 0, 0);
  }
  for (let i = 0; i < 120; i++) rfStep();
  (function rfLoop() { if (rfVisible && !reduce) rfStep(); requestAnimationFrame(rfLoop); })();

  /* ---------------- Experience timeline ---------------- */
  $("#tl-content").innerHTML = D.timeline.map((g) => `<div class="tl-group"><h3>${esc(g.group)}</h3>${g.items.map((it) => `
    <div class="tl-item${it.featured ? " featured" : ""}">
      <h4>${esc(it.title)}</h4>${it.when ? `<span class="tl-when">${esc(it.when)}</span>` : ""}
      <p>${esc(it.body)}</p>
      ${it.bullets ? `<ul>${it.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      ${it.link ? `<button type="button" class="tl-open" data-open="${it.link}">See the project</button>` : ""}
    </div>`).join("")}</div>`).join("");
  const tlIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); tlIO.unobserve(e.target); } }), { rootMargin: "0px 0px -25% 0px" });
  $$(".tl-item").forEach((el) => tlIO.observe(el));
  const tl = $("#timeline");
  function fillTimeline() {
    const r = tl.getBoundingClientRect();
    tl.style.setProperty("--tl", clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1).toFixed(3));
  }

  /* ---------------- Contact ---------------- */
  const copyBtn = $("#copy-btn");
  copyBtn.addEventListener("click", async () => {
    const txt = D.person.email;
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {
      try { const r = document.createRange(); r.selectNodeContents($("#email-text")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    }
    copyBtn.textContent = ok ? "Copied" : "Select and copy above";
    setTimeout(() => (copyBtn.textContent = "Copy address"), 2200);
  });

  window.BG && window.BG.anchor && window.BG.anchor("contact", $(".portal"));

  /* ---------------- Init ---------------- */
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { layoutConstellation(); placeOrbit(); drawOpt(); onScroll(); }, 150); });
  onScroll(); fromHash();
})();
