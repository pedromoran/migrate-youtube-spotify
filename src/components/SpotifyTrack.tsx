export interface SpotifyTrack {
  artist: string;
  title: string;
  album: string;
  explicit: boolean;
  thumbnail: string;
  link: string;
}

interface TrackProps {
  track: SpotifyTrack;
}

export const SpotifyTrack = ({
  track: { thumbnail, album, artist, title, explicit, link },
}: TrackProps) => {
  return (
    <div className="grid grid-cols-[100px_auto] gap-8 rounded-md shadow p-5 bg-[#181818] space-x-5">
      <img src={thumbnail} alt="track thumbnail" />
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
          // onClick={() => {}}
          className="mt-2 cursor-pointer text-black active:outline-4 outline-sky-600 ml-auto block bg-[#1ed760] hover:brightness-115 rounded w-max px-3 py-1.5"
        >
          Add to playlist
        </button>
      </div>
    </div>
  );
};
