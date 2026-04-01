import React from "react";

export function useFavicon(href?: string) {
  React.useEffect(() => {
    if (!href) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    // force reload
    link.href = `${href}?v=${Date.now()}`;
  }, [href]);
}
