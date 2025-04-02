"use server";
import { cookies } from "node_modules/next/headers";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";

export async function removeSpotifyCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SpotifyCookieEnum.access_token);
  cookieStore.delete(SpotifyCookieEnum.token_type);
  cookieStore.delete(SpotifyCookieEnum.refresh_token);
}
