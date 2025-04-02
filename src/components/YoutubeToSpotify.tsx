"use client";
import { useState } from "react";
import { GetTracksResponse } from "src/app/youtube/route";
import { SpotifyPanel } from "src/components/SpotifyPanel";
import { SpotifyTrack } from "src/components/SpotifyTrack";
import { YoutubePanel } from "src/components/YoutubePanel";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { ArrowLongRightIcon } from "./common/Icons";
import { removeSpotifyCookies } from "src/utils/removeSpotifyCookies";
import { YoutubeChannel } from "src/services/youtube/getSelfChannel";
import Image from "node_modules/next/image";
import { YoutubePlaylist } from "src/services/youtube/getPlaylists";
import Link from "node_modules/next/link";

interface YoutubeToSpotifyProps {
  spotify: {
    userProfile: SpotifyUserProfile | null;
  };
  youtube: {
    channel: YoutubeChannel | null;
  };
}

export enum MigrationModeEnum {
  spotify_to_youtube = "spotify_to_youtube",
  youtube_to_spotify = "youtube_to_spotify",
}

export function YoutubeToSpotify({
  spotify,
  youtube,
}: YoutubeToSpotifyProps) {
  const [migrationMode, setMigrationMode] =
    useState<MigrationModeEnum | null>(null);
  const [tracks, setTracks] = useState<GetTracksResponse | null>(
    null,
  );
  const [youtubePlaylist, setYoutubePlaylist] =
    useState<YoutubePlaylist | null>(null);
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

  if (migrationMode === null) {
    return (
      <>
        <h1 className="text-lg border-b">Select a migration mode</h1>
        <section className="space-y-10">
          <Link
            // onClick={() =>
            //   setMigrationMode(MigrationModeEnum.youtube_to_spotify)
            // }
            href={"/youtube-to-spotify"}
            type="button"
            className="btn flex items-center space-x-12 rounded-md shadow p-5 "
          >
            <div>
              <Image
                className="mx-auto"
                src="/youtube_music.svg"
                alt="youtube music logo"
                width={80}
                height={80}
              />
            </div>
            <div className="text-white mt-1">
              <ArrowLongRightIcon width={75} height={75} />
            </div>
            <div>
              <Image
                className="mx-auto"
                src="/spotify.svg"
                alt="spotify logo"
                width={80}
                height={80}
              />
            </div>
          </Link>
          <Link
            href={"/spotify-to-youtube"}
            type="button"
            className="btn flex items-center space-x-12 rounded-md shadow p-5 "
          >
            <div>
              <Image
                className="mx-auto"
                src="/spotify.svg"
                alt="spotify logo"
                width={80}
                height={80}
              />
            </div>
            <div className="text-white mt-1">
              <ArrowLongRightIcon width={75} height={75} />
            </div>
            <div>
              <Image
                className="mx-auto"
                src="/youtube_music.svg"
                alt="youtube music logo"
                width={80}
                height={80}
              />
            </div>
          </Link>
        </section>
      </>
    );
  }

  if (
    migrationMode === MigrationModeEnum.youtube_to_spotify &&
    !youtubePlaylist
  ) {
    return (
      <>
        <h1 className="text-lg border-b">
          Select a youtube playlist to migrate to spotify
        </h1>
      </>
    );
  }

  return (
    <>
      {/* <h1 className="text-lg border-b">
        Migrate youtube playlist to spotify
      </h1> */}

      <h1 className="text-lg border-b">
        Select a youtube playlist to migrate to spotify
      </h1>
      {/* <section className="grid gap-x-8 grid-cols-[600px_auto_600px]"> */}
      <section className="grid gap-x-8 grid-cols-[1200px]">
        <YoutubePanel
          onCurrentTrack={t => setSpotifySearch(t.q)}
          channel={youtube.channel}
        />
        {/* <div className="text-white mt-1">
          <ArrowLongRightIcon width={100} height={100} />
        </div>
        <SpotifyPanel
          search={spotifySearch}
          onFetchedTracks={handleSpotifyTracks}
          userProfile={spotify.userProfile}
        /> */}
      </section>
    </>
  );
}
