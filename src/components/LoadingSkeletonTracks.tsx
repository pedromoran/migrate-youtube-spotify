export function LoadingSkeletonTracks() {
  return (
    <ul className="space-y-5">
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className="skeleton h-[140px] grid grid-cols-[100px_auto] gap-8 rounded shadow p-5  space-x-5"
        >
          <div className="skeleton w-[100px] h-[100px]"></div>
          <div>
            <h3 className="text-2xl text-transparent skeleton font-extrabold">
              _
            </h3>
            <p className="w-32 text-transparent skeleton mt-2">_</p>
            <button
              // onClick={() => {}}
              className="mt-2 text-transparent skeleton ml-auto block font-bold rounded w-max px-3 py-1.5"
            >
              ____________
            </button>
          </div>
        </div>
      ))}
    </ul>
  );
}
