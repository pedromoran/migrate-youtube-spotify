"use client";
import { useEffect, useState } from "react";
import { YoutubeTrack } from "./YoutubeTrack";
import Image from "next/image";
import { YoutubeUserProfile } from "src/services/youtube/getGoogleUserProfile";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeGoogleCookies } from "src/utils/removeGoogleCookies";
import {
  getPlaylistItems,
  YoutubePlaylistItem,
} from "src/services/youtube/getPlaylistItems";
import { LoadingSkeletonTracks } from "./LoadingSkeletonTracks";
import { useUserProfile } from "src/app/user-profile-provider";

interface YoutubeTracksProps {
  onCurrentTrackMetadata: (metadata: string) => void;
  channel: YoutubeUserProfile | null;
  playlistId: string;
  index: number;
  maxIndex: number;
}

export const YoutubePanel = ({
  onCurrentTrackMetadata,
  channel,
  playlistId,
  index,
  maxIndex,
}: YoutubeTracksProps) => {
  const { googleUserProfile } = useUserProfile();
  const [tracks, setTracks] = useState<YoutubePlaylistItem[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await getPlaylistItems({
        currentIndex: index,
        playlistId,
      });
      setTracks(response);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const t = tracks?.[index];
    if (!t) return;
    onCurrentTrackMetadata(`${t.title} ${t.artist} ${t.album}`);
  }, [index, tracks]);

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
      <div className="w-full grid row-end-[auto,_auto] grid-cols-[1fr_auto] gap-x-2 gap-y-1">
        <p className="col-span-full">Current song</p>
        <input
          type="number"
          value={index + 1}
          className="w-full"
          onChange={() => {}}
          min={0}
          max={maxIndex}
        />
        {/* <button className="btn block">Set</button> */}
      </div>
      <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px_]">
        {isLoading && <LoadingSkeletonTracks />}
        {/* {tracks?.prev.map((track: Track) => (
            <YoutubeTrack
              key={track.q}
              title={track.title}
              artist={track.artist}
              album={track.album}
              q={track.q}
              thumbnail={track.thumbnail}
              onMoveToTrack={goPrevYTSong}
              isPrev
            />
          ))}
          {tracks?.current && (
            <YoutubeTrack
              title={tracks.current.title}
              artist={tracks.current.artist}
              album={tracks.current.album}
              q={tracks.current.q}
              thumbnail={tracks.current.thumbnail}
              onNextTrack={() => {
                fetch(window.origin + "/yt-tracks")
                  .then(res => res.json())
                  .then(data => setTracks(data));
              }}
            />
          )} */}
        {tracks?.slice(index, index + 1).map(track => (
          <YoutubeTrack
            key={track.id}
            title={track.title}
            artist={track.artist}
            album={track.album}
            q={"track.q"}
            description={""}
            thumbnail={track.thumbnail}
            onNextTrack={() => {}}
            index={track.index}
            // viewOnly
          />
        ))}
        {tracks?.slice(index + 1).map((track, i) => (
          <YoutubeTrack
            key={track.id}
            title={track.title}
            artist={track.artist}
            album={track.album}
            q={"track.q"}
            description={track.description}
            thumbnail={track.thumbnail}
            onMoveToTrack={() => {}}
            index={track.index}
          />
        ))}
      </ul>
    </section>
  );
};
