import classNames from "classnames";

export interface SpotifyTrack {
  artist: string;
  title: string;
  album: string;
  explicit: boolean;
  thumbnail: string | null;
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
      {thumbnail ? (
        <img
          className="rounded"
          src={thumbnail}
          alt="track thumbnail"
        />
      ) : (
        <div className="w-[100px] h-[100px] grid place-content-center bg-[#2f2d34]">
          <svg
            data-encore-id="icon"
            role="img"
            aria-hidden="true"
            className="e-9800-icon e-9800-baseline"
            data-testid="album"
            viewBox="0 0 24 24"
            width={50}
            height={50}
            fill="#59575e"
          >
            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"></path>
            <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"></path>
          </svg>
        </div>
      )}
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
