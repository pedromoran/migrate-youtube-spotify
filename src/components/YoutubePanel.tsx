"use client";
import { useEffect, useState } from "react";
import { YoutubeTrack } from "./YoutubeTrack";
import Image from "next/image";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeGoogleCookies } from "src/utils/removeGoogleCookies";

import { LoadingSkeletonTracks } from "./LoadingSkeletonTracks";
import { useUserProfile } from "src/app/user-profile-provider";
import {
  getPlaylistItems,
  YoutubePlaylistItem,
} from "src/services/youtube/getTracks";
import { NumberInput } from "./NumberInput";
import {
  getYoutubeTracksIndex,
  updateYoutubeTracksPosition,
} from "src/app/youtube/tracks-index";

interface YoutubeTracksProps {
  onCurrentTrackMetadata: (metadata: string) => void;
  playlistId: string;
}

export const YoutubePanel = ({
  onCurrentTrackMetadata,
  playlistId,
}: YoutubeTracksProps) => {
  const [position, setPosition] = useState<number | null>(null);
  const { googleUserProfile } = useUserProfile();
  const [tracks, setTracks] = useState<YoutubePlaylistItem[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function fetchTracks(position: number, playlistId: string) {
    setIsLoading(true);
    setTracks(null);
    const response = await getPlaylistItems({
      position,
      playlistId,
    });
    const t = response?.[0];
    if (t)
      onCurrentTrackMetadata(`${t.title} ${t.artist} ${t.album}`);
    setIsLoading(false);
    setTracks(response);
  }

  useEffect(() => {
    if (!position) return;
    if (!tracks) {
      fetchTracks(position, playlistId);
      return;
    }
    const last = tracks.at(-1);
    const first = tracks.at(0);
    if (
      (last && position > last.position) ||
      (first && position < first.position)
    )
      fetchTracks(position, playlistId);
  }, [position]);

  useEffect(() => {
    (async () => {
      const i = await getYoutubeTracksIndex();
      if (i) setPosition(i);
    })();
  }, []);

  console.log(tracks);

  return (
    <section className="flex flex-col items-center space-y-5">
      <Image
        className="mx-auto"
        src="/youtube_music.svg"
        alt="youtube music logo"
        width={120}
        height={120}
      />
      {googleUserProfile && (
        <ProfileInfo
          image={googleUserProfile.thumbnail}
          title={googleUserProfile.title}
          onClickSignOut={() => removeGoogleCookies()}
        />
      )}
      {/* {tracks} */}
      {position && (
        <div className="w-full grid row-end-[auto,_auto] grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          <p className="col-span-full">Current song</p>
          <NumberInput
            onValueChange={async v => {
              setPosition(v);
              await updateYoutubeTracksPosition(v);
            }}
            min={1}
            max={1000}
            defaultValue={position}
            // key={position}
          />
        </div>
      )}
      {position && (
        <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px_]">
          {isLoading && <LoadingSkeletonTracks />}
          {tracks
            ?.filter(t => t.position === position)
            ?.map(track => (
              <YoutubeTrack
                key={track.id}
                title={track.title}
                artist={track.artist}
                album={track.album}
                q={"track.q"}
                description={track.description}
                thumbnail={track.thumbnail}
                onNextTrack={() => setPosition(track.position + 1)}
                index={track.position}
              />
            ))}
          {tracks
            ?.filter(t => t.position > position)
            ?.map(track => (
              <YoutubeTrack
                key={track.id}
                title={track.title}
                artist={track.artist}
                album={track.album}
                q={"track.q"}
                description={track.description}
                thumbnail={track.thumbnail}
                onMoveToTrack={() => {}}
                index={track.position}
              />
            ))}
        </ul>
      )}
    </section>
  );
};
