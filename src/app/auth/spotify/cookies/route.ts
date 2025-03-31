import { SpotifyCookieEnum } from "./interfaces";
import { NextRequest } from "node_modules/next/server";

export async function DELETE(req: NextRequest) {
  req.cookies.delete(SpotifyCookieEnum.token_type);
  req.cookies.delete(SpotifyCookieEnum.access_token);
  req.cookies.delete(SpotifyCookieEnum.refresh_token);
  return Response.redirect(new URL(req.url).origin);
}
