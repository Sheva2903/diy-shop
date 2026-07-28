import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./en";
import { vi } from "./vi";

const languageStorageKey = "diy-shop-language";
const supportedLanguages = ["vi", "en"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

function isSupported(language: string | null): language is SupportedLanguage {
  return !!language && supportedLanguages.includes(language as SupportedLanguage);
}

const stored = localStorage.getItem(languageStorageKey);
const browser = navigator.language.split("-")[0];

// Storefront defaults to Vietnamese — CONTEXT.md
const initialLanguage = isSupported(stored) ? stored : isSupported(browser) ? browser : "vi";

i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: "vi",
  interpolation: { escapeValue: false }
});

document.documentElement.lang = initialLanguage;

i18n.on("languageChanged", (language) => {
  localStorage.setItem(languageStorageKey, language);
  document.documentElement.lang = language;
});

export default i18n;
