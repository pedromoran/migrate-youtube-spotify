"use client";

import classNames from "classnames";

// import fs from "fs";
// import songsPosition from "@/app/api/data/yt-tracks-position.json";

interface TrackProps {
  title: string;
  artist: string;
  album: string;
  q: string;
  thumbnail: string;
  viewOnly?: boolean;
  isPrev?: boolean;
  onNextTrack?: () => void;
  onMoveToTrack?: () => void;
}

export const YoutubeTrack = ({
  thumbnail,
  album,
  artist,
  q,
  title,
  viewOnly,
  isPrev,
  onNextTrack,
  onMoveToTrack,
}: TrackProps) => {
  async function goNextYTSong() {
    try {
      await fetch("/yt-tracks?go=next", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      onNextTrack?.();
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <div
      className={classNames(
        "group grid grid-cols-[100px_auto] gap-8 rounded-md shadow p-5 bg-[#181818] space-x-5",
        { "is-previous-track bg-[#18181870]": isPrev }
      )}
    >
      <img src={thumbnail} alt="track thumbnail" />
      {/* <Image src={thumbnail} alt="track thumbnail" width={120} height={120} /> */}
      <div>
        <h3 className="text-xl font-extrabold group-[.is-previous-track]:opacity-50">
          {title}
        </h3>
        <p>
          <strong>{artist}</strong> &deg;{album}
        </p>
        <div>
          {!viewOnly && (
            <>
              {onNextTrack && (
                <button
                  onClick={() => {
                    goNextYTSong();
                  }}
                  className="mt-2 cursor-pointer active:outline-4 outline-sky-600 ml-auto block bg-[#d71e1e] hover:brightness-115  rounded w-max px-3 py-1.5"
                >
                  Discard song
                </button>
              )}

              {onMoveToTrack && (
                <button
                  onClick={onMoveToTrack}
                  className={classNames(
                    "mt-2 cursor-pointer active:outline-4 outline-sky-600 ml-auto block bg-[#d7811e] hover:brightness-115  rounded w-max px-3 py-1.5"
                    // {"brightness-150 opacity-100": isPrev}
                  )}
                >
                  Move to
                </button>
              )}
            </>
          )}
        </div>
        <p className="hidden">{q}</p>
      </div>
    </div>
  );
};
