import { NextResponse } from "next/server";
import { localeCookieName } from "@/lib/locale";
import { isLocale } from "@/lib/translations";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedLocale = url.searchParams.get("locale") ?? undefined;
  const returnTo = url.searchParams.get("returnTo") || "/";
  const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  const response = NextResponse.redirect(new URL(safeReturnTo, url.origin));

  if (isLocale(requestedLocale)) {
    response.cookies.set(localeCookieName, requestedLocale, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
