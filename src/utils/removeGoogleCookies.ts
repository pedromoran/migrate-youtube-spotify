"use server";
import { cookies } from "node_modules/next/headers";
import { GoogleCookieEnum } from "src/app/auth/google/cookies";

export async function removeGoogleCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(GoogleCookieEnum.access_token);
  cookieStore.delete(GoogleCookieEnum.token_type);
  cookieStore.delete(GoogleCookieEnum.refresh_token);
}
