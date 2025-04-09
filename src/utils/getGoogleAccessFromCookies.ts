"use server";
import { cookies } from "next/headers";
import { GoogleCookieEnum } from "../app/auth/google/cookies";

export async function getGoogleAccessFromCookies() {
  const cookieStore = await cookies();
  const access_token =
    cookieStore.get(GoogleCookieEnum.access_token)?.value || null;
  const refresh_token =
    cookieStore.get(GoogleCookieEnum.refresh_token)?.value || null;
  const token_type =
    cookieStore.get(GoogleCookieEnum.token_type)?.value || null;
  return {
    access_token,
    refresh_token,
    token_type,
    authorization:
      !token_type || !access_token
        ? `${token_type} ${access_token}`
        : null,
  };
}
