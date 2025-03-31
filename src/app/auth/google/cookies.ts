export enum GoogleCookieEnum {
  token_type = "google_token_type",
  access_token = "google_access_token",
  refresh_token = "google_refresh_token",
}

export interface GoogleCookies {
  [GoogleCookieEnum.access_token]: string;
  [GoogleCookieEnum.token_type]: string;
  [GoogleCookieEnum.refresh_token]: string;
}
