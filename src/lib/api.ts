export const apiOrigin =
  import.meta.env.VITE_API_ORIGIN || window.location.origin;

export type TAppBranding = {
  name: string;
  description?: string;
  logo?: string;
  homepageURL?: string;
  theme?: Record<string, string>;
};

export const getAppBranding = async (): Promise<TAppBranding> => {
  const url = new URL(`/auth/branding/`, apiOrigin);

  const res = await fetch(url, {
    method: "get",
  });

  if (!res.ok) {
    throw new Error(
      (await res.text()) || `Request failed with status ${res.status}`,
    );
  }

  const data = await res.json();

  return data as TAppBranding;
};

export const getAuthCapabilities = async (): Promise<string[]> => {
  const url = new URL(`/auth/api/capabilities`, apiOrigin);

  const res = await fetch(url, {
    method: "get",
  });

  if (!res.ok) {
    throw new Error(
      (await res.text()) || `Request failed with status ${res.status}`,
    );
  }

  const data = await res.json();

  return (data as { capabilities: string[] }).capabilities;
};
