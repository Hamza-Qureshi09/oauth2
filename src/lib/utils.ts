import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ThemeVars = Record<`--${string}`, string>;

export function applyThemeVars(vars: ThemeVars) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getInitials(name?: string) {
  const [first, ...last] = name || "unamed";
  return !last
    ? first.substring(0, 2).toUpperCase()
    : `${first[0].toUpperCase()}${last[0].toUpperCase()}`;
}

export function generateSecret(length: number = 32): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += charset[values[i] % charset.length];
  }

  return secret;
}
