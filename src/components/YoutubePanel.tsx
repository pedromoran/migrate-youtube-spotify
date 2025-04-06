"use client";
import { useEffect, useState } from "react";
import { YoutubeTrack } from "./YoutubeTrack";
import Image from "next/image";
import { YoutubeUserProfile } from "src/services/youtube/getYoutubeUserProfile";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeGoogleCookies } from "src/utils/removeGoogleCookies";
import {
  getPlaylistItems,
  YoutubePlaylistItem,
} from "src/services/youtube/getTracks";
import { LoadingSkeletonTracks } from "./LoadingSkeletonTracks";

interface YoutubeTracksProps {
  onCurrentTrackMetadata: (metadata: string) => void;
  channel: YoutubeUserProfile | null;
  playlistId: string;
}

export const YoutubePanel = ({
  onCurrentTrackMetadata,
  channel,
  playlistId,
}: YoutubeTracksProps) => {
  const [tracks, setTracks] = useState<YoutubePlaylistItem[] | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await getPlaylistItems(playlistId);
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
      {channel && (
        <ProfileInfo
          image={channel.thumbnail}
          title={channel.title}
          onClickSignOut={() => removeGoogleCookies()}
        />
      )}
      {/* {tracks} */}
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
            // viewOnly
          />
        ))}
        {tracks?.slice(index + 1).map(track => (
          <YoutubeTrack
            key={track.id}
            title={track.title}
            artist={track.artist}
            album={track.album}
            q={"track.q"}
            description={""}
            thumbnail={track.thumbnail}
            onMoveToTrack={() => {}}
          />
        ))}
      </ul>
    </section>
  );
};
