import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
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

export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // convert buffer → hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export const checkStrength = (pass: string) => {
  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[0-9]/, text: "At least 1 number" },
    { regex: /[a-z]/, text: "At least 1 lowercase letter" },
    { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  ];

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }));
};

export const getStrengthColor = (score: number) => {
  if (score === 0) return "bg-border";
  if (score <= 1) return "bg-red-500";
  if (score <= 2) return "bg-orange-500";
  if (score === 3) return "bg-amber-500";
  return "bg-emerald-500";
};

export const getStrengthText = (score: number) => {
  if (score === 0) return "Enter a password";
  if (score <= 2) return "Weak password";
  if (score === 3) return "Medium password";
  return "Strong password";
};

export function formatDate(
  date?: Date | string | null,
  pattern: "timeAgo" | "default" | string = "default",
): string {
  if (date) {
    const validDate = typeof date === "string" ? new Date(date) : date;
    if (pattern !== "timeAgo") {
      return format(validDate, pattern === "default" ? "PP hh:mm a" : pattern);
    }
    return formatDistanceToNow(validDate, { addSuffix: true });
  } else return "N/A";
}

export function parseUserAgent(ua: string) {
  const userAgent = ua.toLowerCase();
  let os: "Windows" | "Mac OS" | "Linux" | "Android" | "iOS" | "Unknown" =
    "Unknown";
  let browser:
    | "Chrome"
    | "Firefox"
    | "Safari"
    | "Edge"
    | "Brave"
    | "Arc"
    | "Opera"
    | "Samsung Internet"
    | "Unknown" = "Unknown";

  const isMobile = /mobi|android/i.test(userAgent);

  const isTablet = /ipad/i.test(userAgent) ||
    /tablet/i.test(userAgent) ||
    (/android/i.test(userAgent) && !/mobile/i.test(userAgent));

  if (userAgent.includes("edg") || userAgent.includes("edge")) browser = "Edge";
  else if (userAgent.includes("opr") || userAgent.includes("opera")) {
    browser = "Opera";
  } else if (userAgent.includes("samsungbrowser")) browser = "Samsung Internet";
  else if (userAgent.includes("brave")) browser = "Brave";
  else if (userAgent.includes("arc")) browser = "Arc";
  else if (userAgent.includes("firefox")) browser = "Firefox";
  else if (userAgent.includes("chrome")) browser = "Chrome";
  else if (userAgent.includes("safari")) browser = "Safari";

  if (userAgent.includes("windows")) os = "Windows";
  else if (userAgent.includes("mac")) os = "Mac OS";
  else if (userAgent.includes("android")) os = "Android";
  else if (/iphone|ipad/i.test(userAgent)) os = "iOS";
  else if (userAgent.includes("linux")) os = "Linux";

  return {
    browser,
    os,
    isMobile,
    isTablet,
    deviceType: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
    raw: ua,
  };
}

export async function getDeviceInfo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((navigator as any).userAgentData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (navigator as any).userAgentData.getHighEntropyValues([
      "model", // e.g., "Pixel 7"
      "platform", // e.g., "Android"
      "platformVersion",
    ]);
  } else return undefined;
}
