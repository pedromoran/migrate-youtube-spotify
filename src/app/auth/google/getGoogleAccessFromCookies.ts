"use server";
import { cookies } from "node_modules/next/headers";
import { GoogleCookieEnum } from "./cookies";

export async function getGoogleAccessFromCookies() {
  const cookieStore = await cookies();
  return {
    access_token: cookieStore.get(GoogleCookieEnum.access_token)
      ?.value,
    refresh_token: cookieStore.get(GoogleCookieEnum.refresh_token)
      ?.value,
    token_type: cookieStore.get(GoogleCookieEnum.token_type)?.value,
  };
}
