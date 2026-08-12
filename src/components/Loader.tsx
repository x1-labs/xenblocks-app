import React from "react";

export function Loader({
  isLoading,
  showText = false,
}: {
  isLoading: boolean;
  showText?: boolean;
}) {
  return (
    <div className={`absolute w-full ${!isLoading && "hidden"}`}>
      <progress className={`progress progress-accent bg-transparent brightness-50`} />
      {showText && (
        <span className={`m-2 text-sm w-full text-right flex justify-end`}>Loading...</span>
      )}
    </div>
  );
}
