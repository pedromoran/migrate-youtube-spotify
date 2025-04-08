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
import { updateYoutubeTracksPosition } from "src/app/youtube/tracks-index";

interface YoutubeTracksProps {
  onCurrentTrackMetadata: (metadata: string) => void;
  playlistId: string;
  position: number;
  onPositionChange: (position: number) => void;
}

export const YoutubePanel = ({
  onCurrentTrackMetadata,
  playlistId,
  onPositionChange,
  position,
}: YoutubeTracksProps) => {
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
    if (!response) {
      setIsLoading(false);
      return;
    }
    const currTrack = response.find(t => t.position === position);
    if (currTrack)
      onCurrentTrackMetadata(
        `${currTrack.title} ${currTrack.artist} ${currTrack.album}`,
      );
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
    ) {
      fetchTracks(position, playlistId);
    } else {
      const t = tracks.find(t => t.position === position);
      if (t)
        onCurrentTrackMetadata(`${t.title} ${t.artist} ${t.album}`);
    }
  }, [position]);

  return (
    <section className="space-y-7">
      <header className="flex flex-col items-center space-y-5">
        <Image
          className="mx-auto"
          src="/youtube.svg"
          alt="youtube logo"
          quality={100}
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
          <div className="w-full grid row-end-[auto,_auto] gap-x-2 gap-y-1">
            <p className="col-span-full">Current song</p>
            <NumberInput
              onValueChange={async v => {
                onPositionChange(v);
                await updateYoutubeTracksPosition(v);
              }}
              min={1}
              max={10000}
              defaultValue={position}
              key={position}
            />
          </div>
        )}
      </header>
      {position && (
        <ul className="self-stretch space-y-5">
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
                onNextTrack={() =>
                  onPositionChange(track.position + 1)
                }
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
