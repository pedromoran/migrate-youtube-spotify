import { HTMLAttributes, useEffect, useState } from "react";

interface SearchInputProps extends HTMLAttributes<HTMLInputElement> {
  defaultValue: string;
  onValueChange: (v: string) => void;
}

export function SearchInput({
  defaultValue,
  onValueChange,
  ...rest
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onValueChange(value);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      placeholder="Search for a song"
      onChange={e => setValue(e.target.value)}
      className="w-full py-2 rounded border border-neutral-700 bg-neutral-800 px-3 ring-0"
      {...rest}
    />
  );
  // return (
  //   <form
  //     onSubmit={(e) => {
  //       e.preventDefault();
  //     }}
  //     className="border h-[40px] border-neutral-700 flex rounded overflow-hidden"
  //   >
  //     <input
  //       type="text"
  //       defaultValue={defaultSearchQuery}
  //       key={defaultSearchQuery}
  //       className="h-full flex-1 bg-neutral-800 px-3 ring-1 ring-neutral-700"
  //     />
  //     <button
  //       type="submit"
  //       className="cursor-pointer active:outline-4 outline-neutral-600 bg-neutral-800 hover:brightness-115 w-max px-3 ring-1 ring-neutral-700"
  //     >
  //       Send
  //     </button>
  //   </form>
  // );
}
