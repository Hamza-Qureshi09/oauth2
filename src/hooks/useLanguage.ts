import i18n from "i18next";
import React from "react";

export function useLanguage(value?: string | null) {
  const language = value ?? "en";
  const HTMLElement = document.querySelector("html");

  const { lng, dir } = React.useMemo<{
    lng: string;
    dir: "rtl" | "ltr";
  }>(() => {
    const direction = ["en", "fr", "de", "es", "it", "pl"].includes(language)
      ? "ltr"
      : "rtl";

    HTMLElement?.setAttribute("dir", direction);

    if (language === i18n.language) return { lng: language, dir: direction };

    void i18n.changeLanguage(language).catch(console.error);

    return { lng: language, dir: direction };
  }, [language, HTMLElement]);

  return { language: lng, direction: dir };
}
