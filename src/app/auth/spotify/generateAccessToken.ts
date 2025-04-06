"use server";
interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  refresh_token_expires_in: number;
}

export async function generateAccessToken({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}) {
  const myHeaders = new Headers();
  myHeaders.append(
    "Content-Type",
    "application/x-www-form-urlencoded",
  );

  const urlencoded = new URLSearchParams();
  urlencoded.append(
    "client_id",
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  );
  urlencoded.append(
    "client_secret",
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "",
  );
  urlencoded.append("grant_type", "authorization_code");
  urlencoded.append("redirect_uri", redirectUri);
  urlencoded.append("code", code);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  try {
    const data = await fetch(
      "https://oauth2.googleapis.com/token",
      //@ts-expect-error: fetch is not typed
      requestOptions,
    ).then(response => {
      if (!response.ok) {
        console.log("error", response);
        throw new Error("Network response was not ok");
      }
      return response.json();
    });

    return data as AccessTokenResponse;
  } catch (error) {
    console.log(error);
    return null;
  }
}
