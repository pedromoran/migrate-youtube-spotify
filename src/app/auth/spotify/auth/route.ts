import { NextRequest } from "node_modules/next/server";

export async function GET(req: NextRequest) {
  // try {
  //   authUrl = new URL(process.env.NEXT_PUBLIC_ENDPOINT_SPOTIFY_AUTHORIZE || ""); //prettier-ignore
  // } catch (error) {
  //   console.log(error, "spotify auth endpoint:", process.env.NEXT_PUBLIC_ENDPOINT_SPOTIFY_AUTHORIZE); //prettier-ignore
  //   alert("An error occurred while trying to authorize with Spotify.",); //prettier-ignore
  //   return;
  // }

  const redirect_uri =
    req.nextUrl.origin + process.env.SELF_ENDPOINT_SPOTIFY_CODE!;

  const params = {
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri,
    response_type: "code",
    scope: process.env.SPOTIFY_CONSENT_SCOPES!,
  };

  const authUrl = new URL(process.env.SPOTIFY_ENDPOINT_AUTHORIZE!);

  for (const k in params) {
    const key = k as keyof typeof params;
    authUrl.searchParams.append(key, params[key]);
  }

  return Response.redirect(authUrl.href);
}
