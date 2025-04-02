"use client";
import { useState } from "react";
import { GetTracksResponse } from "src/app/youtube/route";
import { SpotifyPanel } from "src/components/SpotifyPanel";
import { SpotifyTrack } from "src/components/SpotifyTrack";
import { YoutubePanel } from "src/components/YoutubePanel";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { YoutubeChannel } from "src/services/youtube/getSelfChannel";

interface SpotifyToYoutubeProps {
  spotify: {
    userProfile: SpotifyUserProfile | null;
  };
  youtube: {
    channel: YoutubeChannel | null;
  };
}

export function SpotifyToYoutube({
  spotify,
  youtube,
}: SpotifyToYoutubeProps) {
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
    <section className="grid gap-x-8 grid-cols-[600px_600px]">
      <SpotifyPanel
        search={spotifySearch}
        onFetchedTracks={handleSpotifyTracks}
        userProfile={spotify.userProfile}
        // auth={spotify.auth}
      />
      <YoutubePanel
        onCurrentTrack={t => setSpotifySearch(t.q)}
        channel={youtube.channel}
      />
    </section>
  );
}
