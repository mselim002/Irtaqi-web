/**
 * Irtaqi i18n — minimal runtime language switcher.
 *
 * Each translatable element has a `data-i18n="dot.path.to.key"` attribute.
 * Attributes (placeholder, aria-label, title) use `data-i18n-attr="placeholder:key,title:key"`.
 * The document title is replaced via `data-i18n-title="meta.pageKey"` on <html>.
 *
 * Language choice is persisted in localStorage under `irtaqi-lang`.
 * On load, we pick (in order): localStorage → <html lang> → 'ar'.
 */

const STORAGE_KEY = "irtaqi-lang";
const SUPPORTED = ["ar", "en"];

const cache = {};

async function loadDict(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch(`assets/translations/${lang}.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`failed to load ${lang}.json`);
  const json = await res.json();
  cache[lang] = json;
  return json;
}

function resolvePath(obj, path) {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function applyDict(dict) {
  // text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const path = el.getAttribute("data-i18n");
    const value = resolvePath(dict, path);
    if (typeof value === "string") {
      el.innerHTML = value;
    }
  });

  // attribute translations, e.g. data-i18n-attr="placeholder:form.email,aria-label:nav.home"
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr");
    spec.split(",").forEach((pair) => {
      const [attr, path] = pair.split(":").map((s) => s.trim());
      if (!attr || !path) return;
      const value = resolvePath(dict, path);
      if (typeof value === "string") {
        el.setAttribute(attr, value);
      }
    });
  });

  // document title
  const htmlEl = document.documentElement;
  const titleKey = htmlEl.getAttribute("data-i18n-title");
  if (titleKey) {
    const value = resolvePath(dict, titleKey);
    if (typeof value === "string") {
      document.title = value;
    }
  }
}

export async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = "ar";

  const dict = await loadDict(lang);
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  applyDict(dict);

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }

  // swap the toggle label so it reads as the *other* language
  const toggle = document.querySelector("[data-lang-toggle]");
  if (toggle) {
    toggle.setAttribute("data-target-lang", lang === "ar" ? "en" : "ar");
  }
}

export function getCurrentLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch { /* empty */ }

  const htmlLang = document.documentElement.getAttribute("lang");
  if (htmlLang && SUPPORTED.includes(htmlLang)) return htmlLang;

  return "ar";
}

export async function initI18n() {
  const lang = getCurrentLang();
  await setLang(lang);

  const toggle = document.querySelector("[data-lang-toggle]");
  if (toggle) {
    toggle.addEventListener("click", async () => {
      const target = toggle.getAttribute("data-target-lang") || "en";
      await setLang(target);
    });
  }
}
