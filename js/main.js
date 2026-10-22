/* =========================================================
   Portfólio — Eduardo Carvalho
   Interações
   ========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Navegação ---------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

/* ---------- Idioma (PT / EN) ---------- */
const translatable = document.querySelectorAll("[data-en]");
translatable.forEach((el) => (el.dataset.pt = el.innerHTML));

const meta = {
  pt: {
    lang: "pt-BR",
    title: "Eduardo Carvalho | Portfólio",
    description: "Portfólio pessoal de Eduardo Carvalho, estudante de Sistemas de Informação na ESAMC.",
  },
  en: {
    lang: "en",
    title: "Eduardo Carvalho | Portfolio",
    description: "Personal portfolio of Eduardo Carvalho, Information Systems student at ESAMC.",
  },
};

function setLanguage(lang) {
  translatable.forEach((el) => (el.innerHTML = el.dataset[lang]));
  document.documentElement.lang = meta[lang].lang;
  document.title = meta[lang].title;
  document.querySelector('meta[name="description"]').content = meta[lang].description;
  document.querySelectorAll(".lang button").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === lang)
  );
  try {
    localStorage.setItem("lang", lang);
  } catch (e) {}
}

document.querySelectorAll(".lang button").forEach((b) =>
  b.addEventListener("click", () => setLanguage(b.dataset.lang))
);

let savedLang = null;
try {
  savedLang = localStorage.getItem("lang");
} catch (e) {}
if (savedLang === "en") setLanguage("en");

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
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
