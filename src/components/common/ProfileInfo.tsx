interface ProfileInfoProps {
  image: string | undefined;
  title: string;
  onClickSignOut?: () => void;
}

export const ProfileInfo = ({
  image,
  title,
  onClickSignOut,
}: ProfileInfoProps) => {
  return (
    <section className="flex w-full space-x-5">
      <div className="w-[80px] h-[80px]">
        {image ? (
          <img
            src={image}
            className="rounded-full w-full h-full object-cover"
            alt="spotify user profile image"
          />
        ) : (
          <span className="grid place-content-center w-full h-full rounded-full text-4xl font-extrabold bg-sky-700 text-white">
            {title[0]}
          </span>
        )}
      </div>
      <div className="flex-grow flex justify-between items-start">
        <div>
          <p>Profile</p>
          <h2 className="text-2xl font-extrabold">{title}</h2>
        </div>
        <button className="btn" onClick={onClickSignOut}>
          Sign out
        </button>
      </div>
    </section>
  );
};
