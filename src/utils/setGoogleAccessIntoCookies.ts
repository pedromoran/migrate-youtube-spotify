"use server";
import { cookies } from "node_modules/next/headers";
import { GoogleCookieEnum } from "../app/auth/google/cookies";

export async function setGoogleAccessIntoCookies({
  expires_in,
  access_token,
  refresh_token,
  token_type,
}: {
  expires_in: number;
  access_token: string;
  refresh_token?: string;
  token_type: string;
}) {
  const cookieStore = await cookies();
  cookieStore.set(GoogleCookieEnum.access_token, access_token, {
    maxAge: expires_in,
  });
  if (refresh_token)
    cookieStore.set(GoogleCookieEnum.refresh_token, refresh_token);
  cookieStore.set(GoogleCookieEnum.token_type, token_type, {
    maxAge: expires_in,
  });
}
