import React from "react";

export type TScheme = "dark" | "light" | "system";

export function useColorScheme(scheme: TScheme = "system") {
  const Scheme = React.useMemo(() => {
    const currentScheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (scheme)
      root.classList.add(scheme === "system" ? currentScheme : scheme);
    else root.classList.add(currentScheme);

    return scheme
      ? scheme === "system"
        ? currentScheme
        : scheme
      : currentScheme;
  }, [scheme]);

  return { scheme: Scheme };
}
