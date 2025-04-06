"use client";
import Script from "next/script";
import { useRef } from "react";
import { setGoogleAccessIntoCookies } from "src/app/auth/google/setGoogleAccessIntoCookies";
import { generateAccessToken } from "src/app/auth/spotify/generateAccessToken";

// https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeClientConfig
interface CodeClientConfig {
  client_id: string;
  scope: string;
  include_granted_scopes?: boolean;
  redirect_uri?: string;
  callback?: (response: {
    code: string;
    scope: string;
    state: string;
    error: string;
    error_description: string;
    error_uri: string;
  }) => void;
  state?: string;
  login_hint?: string;
  hd?: string;
  ux_mode?: "popup" | "redirect";
  select_account?: boolean;
  error_callback?: (error: {
    type: string;
    details: unknown;
  }) => void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeResponse
export interface CodeResponse {
  code: string;
  scope: string;
  state: string;
  error: string;
  error_description: string;
  error_uri: string;
}

interface CodeClient {
  requestCode(): void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#TokenClientConfig
export interface TokenClientConfig {
  client_id: string;
  callback: (response: unknown) => void;
  scope: string;
  include_granted_scopes?: boolean;
  prompt?: string;
  enable_granular_consent?: boolean;
  enable_serial_consent?: boolean;
  login_hint?: string;
  hd?: string;
  state?: string;
  error_callback?: (error: {
    type: string;
    details: unknown;
  }) => void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#TokenResponse
interface TokenResponse {
  access_token: string;
  expires_in: number;
  hd: string;
  prompt: string;
  token_type: string;
  scope: string;
  state: string;
  error: string;
  error_description: string;
  error_uri: string;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#OverridableTokenClientConfig
interface OverridableTokenClientConfig {
  scope?: string;
  include_granted_scopes?: boolean;
  prompt?: string;
  enable_granular_consent?: boolean;
  enable_serial_consent?: boolean;
  login_hint?: string;
  hd?: string;
  state?: string;
  error_callback?: (error: {
    type: string;
    details: unknown;
  }) => void;
}

interface TokenClient {
  requestAccessToken(
    overrideConfig?: OverridableTokenClientConfig,
  ): void;
}

// https://developers.google.com/identity/oauth2/web/reference/js-reference#RevocationResponse
interface RevocationResponse {
  successful: boolean;
  error: string;
  error_description: string;
}

export interface OAuth2 {
  initCodeClient: (config: CodeClientConfig) => CodeClient;
  initTokenClient: (config: TokenClientConfig) => TokenClient;
  hasGrantedAllScopes: (
    tokenResponse: TokenResponse,
    firstScope: string,
    ...restScopes: string[]
  ) => boolean;
  hasGrantedAnyScope: (
    tokenResponse: TokenResponse,
    firstScope: string,
    ...restScopes: string[]
  ) => boolean;
  revoke(accessToken: string, done: () => void): RevocationResponse;
}

export function GoogleOAuthButton() {
  const oauth2 = useRef<OAuth2>(null);
  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  function requestGoogleOAuth() {
    if (!oauth2.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("Missing client id or client secret");
      return;
    }

    const client = oauth2.current.initCodeClient({
      client_id: clientId || "",
      include_granted_scopes: true,
      scope:
        process.env.NEXT_PUBLIC_GOOGLE_YOUTUBE_DATA_API_SCOPES || "",
      ux_mode: "popup",
      error_callback: error => {
        if (error.type === "popup_closed") {
          return;
        }
        console.error("Error requesting auth code: " + error.details);
      },
      callback: async response => {
        const access = await generateAccessToken({
          code: response.code,
          redirectUri: window.origin,
        });
        if (access) {
          await setGoogleAccessIntoCookies({
            access_token: access.access_token,
            refresh_token: access.refresh_token,
            token_type: access.token_type,
          });
          window.location.reload();
        } else {
          console.log("Error getting access token");
          return;
        }
      },
    });

    client.requestCode();
  }

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_GOOGLE_GSI_LIBRARY_CDN}
        strategy="lazyOnload"
        onLoad={() => {
          //@ts-expect-error: google object injected by gsi
          if (google) oauth2.current = google.accounts.oauth2;
        }}
        aria-label="Button Sign in with Google"
      />
      <button className="btn" onClick={requestGoogleOAuth}>
        <span>
          <img src="google.svg" alt="google icon" />
        </span>
        <span>Sign in</span>
      </button>
    </>
  );
}
