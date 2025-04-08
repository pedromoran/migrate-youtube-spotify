"use client";
import { useEffect, useRef } from "react";

interface LoadingLineProps {
  onFinished: () => void;
  duration?: number;
}

export const LoadingLine = ({
  onFinished,
  duration = 2000,
}: LoadingLineProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = ref.current;
    if (!line) return;

    line.animate([{ width: "100%" }, { width: "0%" }], {
      duration,
      easing: "linear",
    });

    const timeout = setTimeout(() => {
      onFinished();
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute w-full h-3 -top-5 rounded-xs border border-purple-800">
        <div ref={ref} className="bg-[#403655] h-full w-0"></div>
      </div>
    </div>
  );
};
