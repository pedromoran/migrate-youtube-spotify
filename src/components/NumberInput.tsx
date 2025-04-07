import { HTMLAttributes, useEffect, useState } from "react";

interface NumberInputProps extends HTMLAttributes<HTMLInputElement> {
  defaultValue: number;
  onValueChange: (v: number) => void;
  min: number;
  max: number;
}

export function NumberInput({
  defaultValue,
  onValueChange,
  ...rest
}: NumberInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rendered) onValueChange(value);
    }, 500);
    setRendered(true);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      type="number"
      className="w-full"
      value={value}
      onChange={e => setValue(e.target.valueAsNumber)}
      {...rest}
    />
  );
}
