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
      className="w-full"
      {...rest}
    />
  );
}
