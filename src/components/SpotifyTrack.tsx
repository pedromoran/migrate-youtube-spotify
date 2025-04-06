import classNames from "classnames";

export interface SpotifyTrack {
  artist: string;
  title: string;
  album: string;
  explicit: boolean;
  thumbnail: string;
  link: string;
  id: string;
}

interface TrackProps {
  track: SpotifyTrack;
  onClickAddToPlaylist: (track: SpotifyTrack) => void;
  isAddingTrackToPlaylist: boolean;
}

export const SpotifyTrack = ({
  track,
  onClickAddToPlaylist,
  isAddingTrackToPlaylist,
}: TrackProps) => {
  const { artist, title, album, explicit, thumbnail, link } = track;
  return (
    <div
      className={classNames(
        "grid grid-cols-[100px_auto] gap-8 rounded-md shadow p-5 bg-[#232127] space-x-5",
        { "opacity-50": isAddingTrackToPlaylist },
      )}
    >
      <img
        className="rounded"
        src={thumbnail}
        alt="track thumbnail"
      />
      {/* <Image src={thumbnail} alt="track thumbnail" width={120} height={120} /> */}
      <div>
        <header className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold hover:underline">
            <a href={link} target="_blank">
              {title}
            </a>
          </h3>
          {explicit && (
            <div className="bg-gray-300 text-black font-extrabold rounded-xs mr-1 inline-block px-1.5 leading-5">
              E
            </div>
          )}
        </header>
        <p>
          <strong>{artist}</strong> &deg;{album}
        </p>
        <button
          disabled={isAddingTrackToPlaylist}
          onClick={() => onClickAddToPlaylist(track)}
          className={classNames(
            "mt-2 cursor-pointer text-black outline-sky-600 ml-auto block bg-[#1ed760] rounded w-max px-3 py-1.5",
            {
              "active:outline-4 hover:brightness-115":
                !isAddingTrackToPlaylist,
            },
          )}
        >
          Add to playlist
        </button>
      </div>
    </div>
  );
};
