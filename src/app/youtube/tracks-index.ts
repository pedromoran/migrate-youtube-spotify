"use server";
import fs from "fs";
const YOUTUBE_INDEX_PATH =
  import.meta.url.split("/").slice(-1) + "yt-tracks.json";

export async function getYoutubeTracksIndex() {
  let p = null;
  try {
    p = Number(fs.readFileSync(YOUTUBE_INDEX_PATH, "utf-8"));
  } catch (e) {
    //TODO: implement a better error throwing for the client
    console.error("Error reading yt-tracks-position.json\n", e);
  }

  return p;
}

export async function incrementYoutubeTracksIndex() {
  const i = await getYoutubeTracksIndex();
  if (i === null) return;
  const newIndex = i + 1;
  fs.writeFileSync(YOUTUBE_INDEX_PATH, newIndex.toString(), "utf-8");
  return newIndex;
}

export async function decrementYoutubeTracksIndex() {
  const i = await getYoutubeTracksIndex();
  if (i === null) return;
  if (i === 0) return i;
  const newIndex = i - 1;
  fs.writeFileSync(YOUTUBE_INDEX_PATH, newIndex.toString(), "utf-8");
  return newIndex;
}

export async function updateYoutubeTracksIndex(i: number) {
  if (i < 0) throw new Error("Index cannot be negative");
  fs.writeFileSync(YOUTUBE_INDEX_PATH, i.toString(), "utf-8");
  return i;
}
