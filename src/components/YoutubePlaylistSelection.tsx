"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { SpotifyTrack } from "./SpotifyTrack";
import { GetTracksResponse, Track } from "src/app/youtube/route";
import { GoogleOAuthButton } from "./GoogleOAuthButton";
import { getYoutubeTracksIndex } from "src/app/youtube/tracks-index";
import axios from "node_modules/axios";
import {
  getPlaylists,
  YoutubePlaylist,
} from "src/services/youtube/getPlaylists";
import { YoutubeUserProfile } from "src/services/youtube/getGoogleUserProfile";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeGoogleCookies } from "src/utils/removeGoogleCookies";

interface YoutubePlaylistSelectionProps {
  onCurrentTrack: (track: Track) => void;
  channel: YoutubeUserProfile | null;
}

export const YoutubePlaylistSelection = ({
  onCurrentTrack,
  channel,
}: YoutubePlaylistSelectionProps) => {
  const [playlists, setPlaylists] = useState<
    YoutubePlaylist[] | null
  >(null);
  const [index, setIndex] = useState<number | null>(null);

  console.log(playlists);

  async function goPrevYTSong() {
    try {
      setIndex(await getYoutubeTracksIndex());
      setPlaylists(await getPlaylists());
    } catch (e) {
      console.log(e);
    }
  }

  const notifyMismatch = () => {
    return;
    // if (Notification.permission === "granted") {
    //   new Notification("There is a mismatch! 🙂");
    //   new Audio("notification.wav").play();
    //   return;
    // }
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
    <section className="flex flex-col items-center space-y-5">
      <Image
        className="mx-auto"
        src="/youtube_music.svg"
        alt="youtube music logo"
        width={120}
        height={120}
      />
      {!channel && <GoogleOAuthButton />}
      {channel && (
        // <section className="flex mx-auto space-x-5">
        //   <div className="w-[80px] h-[80px]">
        //     {channel.thumbnails ? (
        //       <img
        //         src={channel.thumbnails}
        //         className="rounded-full w-full h-full object-cover"
        //         alt="spotify user profile image"
        //       />
        //     ) : (
        //       <span className="grid place-content-center w-full h-full rounded-full text-4xl font-extrabold bg-sky-700 text-white">
        //         {channel.title[0]}
        //       </span>
        //     )}
        //   </div>
        //   <div className="flex-grow flex justify-between items-start">
        //     <div>
        //       <p>Profile</p>
        //       <h2 className="text-2xl font-extrabold">
        //         {channel.title}
        //       </h2>
        //     </div>
        //     {/* <SpotifySignOutButton /> */}
        //   </div>
        // </section>
        <ProfileInfo
          image={channel.thumbnail}
          title={channel.title}
          onClickSignOut={() => removeGoogleCookies()}
        />
      )}
      {playlists && (
        <section className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px]">
          {playlists.map(p => (
            <article key={p.id} className="w-[250px]">
              <div className="relative w-full">
                <img
                  className="rounded"
                  src={p.thumbnail}
                  alt={"playlist " + p.title}
                />
                <p className="absolute right-2 bottom-2">
                  {p.itemCount} songs
                </p>
              </div>
              <h3 className="text-lg">{p.title}</h3>
            </article>
          ))}
        </section>
      )}

      {/* {tracks} */}
      <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px]">
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
        {/* {tracks?.map((track) => (
            <YoutubeTrack
              key={track.q}
              title={track.title}
              artist={track.artist}
              album={track.album}
              q={track.q}
              thumbnail={track.thumbnail}
              viewOnly
            />
          ))} */}
      </ul>
    </section>
  );
};
