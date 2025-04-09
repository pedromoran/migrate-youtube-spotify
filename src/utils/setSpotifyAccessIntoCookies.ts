"use server";
import { cookies } from "node_modules/next/headers";
import { GoogleCookieEnum } from "../app/auth/google/cookies";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";

export async function setSpotifyAccessIntoCookies({
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
  cookieStore.set(SpotifyCookieEnum.token_type, token_type);
  cookieStore.set(SpotifyCookieEnum.access_token, access_token);
  cookieStore.set(GoogleCookieEnum.token_type, token_type, {
    maxAge: expires_in,
  });
  if (refresh_token)
    cookieStore.set(SpotifyCookieEnum.refresh_token, refresh_token);
}
