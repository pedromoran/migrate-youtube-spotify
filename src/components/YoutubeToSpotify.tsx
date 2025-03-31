"use client";
import { useEffect, useState } from "react";
import { GetTracksResponse } from "src/app/youtube/route";
import { SpotifyTracks } from "src/components/SpotifyTracks";
import { SpotifyTrack } from "src/components/SpotifyTrack";
import { YoutubeTracks } from "src/components/YoutubeTracks";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { ArrowLongRightIcon } from "./common/Icons";
import { removeSpotifyCookies } from "src/utils/removeSpotifyCookies";

interface YoutubeToSpotifyProps {
  spotify: {
    userProfile: SpotifyUserProfile | null;
    auth: {
      accessToken: string;
      tokenType: string;
      refreshToken: string;
    } | null;
  };
  youtube: {
    userProfile: null;
    auth: {
      accessToken: string;
      tokenType: string;
      refreshToken: string;
    } | null;
  };
}

export function YoutubeToSpotify({
  spotify,
  youtube,
}: YoutubeToSpotifyProps) {
  const [tracks, setTracks] = useState<GetTracksResponse | null>(
    null,
  );
  const [spotifySearch, setSpotifySearch] = useState<string | null>(
    null,
  );

  const notifyMismatch = () => {
    // if (Notification.permission === "granted") {
    //   new Notification("There is a mismatch! 🙂");
    //   new Audio("notification.wav").play();
    //   return;
    // }
  };

  const handleSpotifyTracks = (sfyTracks: SpotifyTrack[]) => {
    const hasMismatch =
      sfyTracks.length > 0 &&
      sfyTracks[0].title !== tracks?.current.title;

    if (hasMismatch) notifyMismatch();
  };

  // useEffect(() => {
  //   if (!("Notification" in window)) {
  //     alert("This browser does not support desktop notification");
  //     return;
  //   }

  //   if (Notification.permission === "default") {
  //     alert("Let us notify you when there is a mismatch!");
  //     Notification.requestPermission();
  //     return;
  //   }
  // }, []);

  return (
    <>
      <button className="btn" onClick={() => removeSpotifyCookies()}>
        Delete cookies
      </button>
      <section className="grid gap-x-8 grid-cols-[600px_auto_600px]">
        <YoutubeTracks
          onCurrentTrack={t => setSpotifySearch(t.q)}
          auth={youtube.auth}
          userProfile={youtube.userProfile}
        />
        <div className="grid place-content-center text-white">
          <ArrowLongRightIcon width={100} height={100} />
        </div>
        <SpotifyTracks
          search={spotifySearch}
          onFetchedTracks={handleSpotifyTracks}
          userProfile={spotify.userProfile}
          auth={spotify.auth}
        />
      </section>
    </>
  );
}
