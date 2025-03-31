export enum SpotifyCookieEnum {
  token_type = "spotify_token_type",
  access_token = "spotify_access_token",
  refresh_token = "spotify_refresh_token",
}

export interface SpotifyCookies {
  [SpotifyCookieEnum.access_token]: string;
  [SpotifyCookieEnum.token_type]: string;
  [SpotifyCookieEnum.refresh_token]: string;
  // google_token_type?: string;
  // google_access_token?: string;
}
