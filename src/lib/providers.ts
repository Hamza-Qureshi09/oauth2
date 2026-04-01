import Apple from "@/assets/providers/apple.svg";
import Discord from "@/assets/providers/discord.svg";
import Facebook from "@/assets/providers/facebook.svg";
import Github from "@/assets/providers/github.svg";
import Google from "@/assets/providers/google.svg";

export const authProviders: Record<
  string,
  { icon: string; label: string; invert?: boolean }
> = {
  google: {
    icon: Google,
    label: "Google",
  },
  apple: {
    icon: Apple,
    label: "Apple",
    invert: true,
  },
  facebook: {
    icon: Facebook,
    label: "Facebook",
  },
  discord: {
    icon: Discord,
    label: "Discord",
  },
  github: {
    icon: Github,
    label: "Github",
    invert: true,
  },
} as const;
