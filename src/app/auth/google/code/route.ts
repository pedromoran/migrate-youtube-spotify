import { NextRequest } from "node_modules/next/server";

export async function POST(req: NextRequest) {
  return Response.redirect(req.nextUrl.origin);
}
