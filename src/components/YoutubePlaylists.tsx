"use client";
import { useEffect, useState } from "react";
import {
  getPlaylists,
  YoutubePlaylist,
} from "src/services/youtube/getPlaylists";
import { YoutubeUserProfile } from "src/services/youtube/getYoutubeUserProfile";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeGoogleCookies } from "src/utils/removeGoogleCookies";

interface YoutubeTracksProps {
  channel: YoutubeUserProfile | null;
  onSelectPlaylist: (playlistId: string) => void;
}

export const YoutubePlaylists = ({
  channel,
  onSelectPlaylist,
}: YoutubeTracksProps) => {
  const [playlists, setPlaylists] = useState<
    YoutubePlaylist[] | null
  >(null);

  useEffect(() => {
    (async () => {
      const response = await getPlaylists();
      setPlaylists(response);
    })();
  }, []);

  // useEffect(() => {
  //   if (tracks) onCurrentTrack(tracks.current);
  // }, [tracks?.current]);

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=PLzXxG3O_lu6A7Ad8Iz9A7pa0_zhT0WXmy&part=contentDetails,id,snippet
  // https://www.googleapis.com/youtube/v3/videos?id=fyrmM_SYC0Q&part=contentDetails,fileDetails,id,liveStreamingDetails,player,processingDetails,recordingDetails,snippet,statistics,topicDetails

  return (
    <section className="w-full">
      {channel && (
        <ProfileInfo
          image={channel.thumbnail}
          title={channel.title}
          onClickSignOut={() => removeGoogleCookies()}
        />
      )}
      {playlists && (
        <section className="grid grid-cols-[repeat(auto-fill,_250px)] place-content-center mx-auto gap-8 w-[95%] max-w-[2200px]">
          {playlists.map(p => (
            <article
              key={p.id}
              className="group w-full cursor-pointer shadow bg-[#232127] hover:bg-[#2b2a2e] rounded overflow-hidden"
              onClick={() => {
                onSelectPlaylist(p.id);
              }}
            >
              <div className="relative w-full">
                <img
                  className="group-hover:rounded-0"
                  src={p.thumbnail}
                  alt={"playlist " + p.title}
                />
                {/* <p className="absolute right-2 bottom-2">
                  {p.itemCount} songs
                </p> */}
              </div>
              <section className="py-1.5 px-3">
                <p className="">{p.title}</p>
              </section>
            </article>
          ))}
        </section>
      )}
    </section>
  );
};
