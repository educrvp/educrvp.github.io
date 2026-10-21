/* =========================================================
   Portfólio — Eduardo Carvalho
   Animações e interações
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Digitação genérica ---------- */
function typeText(el, text, speed = 70) {
  return new Promise((resolve) => {
    if (reduceMotion) {
      el.textContent = text;
      return resolve();
    }
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, speed + Math.random() * 40);
      else resolve();
    };
    tick();
  });
}

/* ---------- Loader ---------- */
const loader = document.getElementById("loader");

async function runLoader() {
  const minTime = new Promise((r) => setTimeout(r, reduceMotion ? 0 : 1700));
  const pageLoaded = new Promise((r) =>
    document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })
  );
  // Nunca trava a tela por mais de 4s, mesmo se algo demorar a carregar
  const failsafe = new Promise((r) => setTimeout(r, 4000));

  typeText(document.getElementById("loader-text"), "iniciando portfolio...", 45);
  await Promise.race([Promise.all([minTime, pageLoaded]), failsafe]);

  loader.classList.add("hidden");
  startHero();
}

/* ---------- Hero ---------- */
async function startHero() {
  await new Promise((r) => setTimeout(r, 300));
  await typeText(document.getElementById("typed"), "whoami", 110);
}

runLoader();

/* ---------- Navegação ---------- */
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

window.addEventListener(
  "scroll",
  () => nav.classList.toggle("scrolled", window.scrollY > 40),
  { passive: true }
);

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
  })
);

// Destaca no menu a seção que está na tela
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.querySelectorAll("a").forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Elementos aparecendo ao rolar ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      // Itens irmãos entram em sequência (efeito cascata)
      const siblings = [...entry.target.parentElement.querySelectorAll(":scope > .reveal")];
      entry.target.style.transitionDelay = `${siblings.indexOf(entry.target) * 110}ms`;
      entry.target.classList.add("visible");
      // Remove o atraso depois que entrou, para não atrasar o efeito 3D
      entry.target.addEventListener(
        "transitionend",
        () => (entry.target.style.transitionDelay = ""),
        { once: true }
      );
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Inclinação 3D nos cards ---------- */
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform 0.1s, border-color 0.3s, box-shadow 0.3s";
      el.style.transform = `perspective(700px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 0.5s, border-color 0.3s, box-shadow 0.3s";
      el.style.transform = "";
    });
  });
}

/* ---------- Posição do mouse (usada pelas partículas) ---------- */
const mouse = { x: -9999, y: -9999 };

if (finePointer) {
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener("mouseleave", () => {
    mouse.x = mouse.y = -9999;
  });
}

/* ---------- Partículas conectadas no fundo ---------- */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];
let width, height;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(70, Math.floor((width * height) / 18000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.6 + 0.6,
  }));
}

// As linhas são agrupadas em faixas de transparência para serem
// desenhadas de uma vez só por faixa, em vez de uma a uma
const LINK_DIST = 130;
const LINK_LEVELS = 5;
const linkPaths = Array.from({ length: LINK_LEVELS }, () => []);

function drawParticles() {
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    // Partículas fogem levemente do mouse
    const mdx = p.x - mouse.x;
    const mdy = p.y - mouse.y;
    const md = Math.hypot(mdx, mdy);
    if (md < 120) {
      p.x += (mdx / md) * 1.2;
      p.y += (mdy / md) * 1.2;
    }
  }

  // Linhas entre partículas próximas
  const maxSq = LINK_DIST * LINK_DIST;
  linkPaths.forEach((list) => (list.length = 0));
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < maxSq) {
        const level = Math.floor((Math.sqrt(dSq) / LINK_DIST) * LINK_LEVELS);
        linkPaths[level].push(p, q);
      }
    }
  }

  ctx.lineWidth = 1;
  linkPaths.forEach((list, level) => {
    if (!list.length) return;
    ctx.beginPath();
    for (let k = 0; k < list.length; k += 2) {
      ctx.moveTo(list[k].x, list[k].y);
      ctx.lineTo(list[k + 1].x, list[k + 1].y);
    }
    ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 * (1 - (level + 0.5) / LINK_LEVELS)})`;
    ctx.stroke();
  });

  // Pontos, todos num único desenho
  ctx.beginPath();
  for (const p of particles) {
    ctx.moveTo(p.x + p.r, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  }
  ctx.fillStyle = "rgba(96, 165, 250, 0.8)";
  ctx.fill();

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 150);
});

if (!reduceMotion) drawParticles();
