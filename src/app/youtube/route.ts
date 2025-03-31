import { NextRequest } from "next/server";
import yt_tracks from "./yt-tracks.json";
import fs from "fs";

const DIR_NAME = process.cwd() + "/src/app/yt-tracks/";

export interface Track {
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  q: string;
}

export interface GetTracksResponse {
  prev: Track[];
  current: Track;
  next: Track[];
}

function getPosition(): number {
  const jsonPath =
    import.meta.url.replace(/(route.ts|file:\/\/)/g, "") +
    "yt-tracks-position.json";
  let p = 0;
  try {
    p = Number(fs.readFileSync(jsonPath, "utf-8"));
  } catch (e) {
    //TODO: implement a better error throwing for the client
    console.error("Error reading yt-tracks-position.json\n", e);
  }
  return p;
}

export async function GET() {
  const p = getPosition();
  const tracks = {
    prev: yt_tracks.slice(p - 1, p),
    current: yt_tracks[p],
    next: yt_tracks.slice(p + 1, p + 6),
  };
  return Response.json(tracks);
}

export async function PUT(request: NextRequest) {
  const p = getPosition();
  const go = new URL(request.url).searchParams.get("go");
  const newCount = p + (go === "next" ? 1 : -1);
  await fs.writeFileSync(
    DIR_NAME + "yt-tracks-position.json",
    JSON.stringify(newCount)
  );
  return Response.json({ message: "ok" });
}
