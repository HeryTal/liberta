import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/translations";

export const localeCookieName = "liberta_locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  return isLocale(value) ? value : "fr";
}
