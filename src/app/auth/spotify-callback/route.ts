import { cookies } from "next/headers";
import axios, { AxiosRequestConfig } from "node_modules/axios";
import { NextRequest } from "node_modules/next/server";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error === "access_denied") {
    return Response.redirect(req.nextUrl.origin);
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID || "";
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";

  //Content-Type application/x-www-form-urlencoded
  if (code) {
    try {
      const auth = await getAccessToken({
        client_id,
        client_secret,
        code,
        redirect_uri: req.nextUrl.origin + req.nextUrl.pathname,
      });
      if (!auth) return Response.redirect(req.nextUrl.origin);
      cookieStore.set(SpotifyCookieEnum.token_type, auth.token_type);
      cookieStore.set(
        SpotifyCookieEnum.access_token,
        auth.access_token,
      );
      cookieStore.set(
        SpotifyCookieEnum.refresh_token,
        auth.refresh_token,
      );
      return Response.redirect(req.nextUrl.origin);
    } catch (error) {
      req.nextUrl.searchParams.append("error", "access_denied");
      return Response.redirect(req.nextUrl.origin);
    }
  }

  return Response.redirect(req.nextUrl.origin);
}

async function getAccessToken({
  client_id,
  client_secret,
  code,
  redirect_uri,
}: {
  redirect_uri: string;
  code: string;
  client_id: string;
  client_secret: string;
}) {
  const body = new URLSearchParams();
  body.append("code", code);
  body.append("redirect_uri", redirect_uri);
  body.append("grant_type", "authorization_code");

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString(
          "base64",
        ),
    },
  };

  try {
    const { data } = await axios.post<AccessTokenResponse>(
      process.env.SPOTIFY_ENDPOINT_TOKEN || "",
      body,
      config,
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function refreshAccessToken() {
  // var refresh_token = req.query.refresh_token;
  // var authOptions = {
  //   url: "https://accounts.spotify.com/api/token",
  //   headers: {
  //     "content-type": "application/x-www-form-urlencoded",
  //     Authorization:
  //       "Basic " +
  //       new Buffer.from(client_id + ":" + client_secret).toString(
  //         "base64",
  //       ),
  //   },
  //   form: {
  //     grant_type: "refresh_token",
  //     refresh_token: refresh_token,
  //   },
  //   json: true,
  // };
  // request.post(authOptions, function (error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     var access_token = body.access_token,
  //       refresh_token = body.refresh_token || refresh_token;
  //     res.send({
  //       access_token: access_token,
  //       refresh_token: refresh_token,
  //     });
  //   }
  // });
}

// Authentication Error Object:
// {
//   "error": "invalid_client",
//   "error_description": "Invalid client secret"
// }
//          REQUIRED.  A single ASCII [USASCII] error code from the
//          following:

//          invalid_request
//                The request is missing a required parameter, includes an
//                unsupported parameter value (other than grant type),
//                repeats a parameter, includes multiple credentials,
//                utilizes more than one mechanism for authenticating the
//                client, or is otherwise malformed.

//          invalid_client
//                Client authentication failed (e.g., unknown client, no
//                client authentication included, or unsupported
//                authentication method).  The authorization server MAY
//                return an HTTP 401 (Unauthorized) status code to indicate
//                which HTTP authentication schemes are supported.  If the
//                client attempted to authenticate via the "Authorization"
//                request header field, the authorization server MUST
//                respond with an HTTP 401 (Unauthorized) status code and
//                include the "WWW-Authenticate" response header field
//                matching the authentication scheme used by the client.

//          invalid_grant
//                The provided authorization grant (e.g., authorization
//                code, resource owner credentials) or refresh token is
//                invalid, expired, revoked, does not match the redirection
//                URI used in the authorization request, or was issued to
//                another client.

//          unauthorized_client
//                The authenticated client is not authorized to use this
//                authorization grant type.

//          unsupported_grant_type
//                The authorization grant type is not supported by the
//                authorization server.

// Regular Error Object:
// HTTP/1.1 400 Bad Request
// {
//     "error": {
//         "status": 400,
//         "message": "invalid id"
//     }
// }
