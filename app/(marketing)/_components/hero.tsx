"use client";

import { FC } from "react";

export const Hero: FC = () => {
  return (
    <div className="mt-10 mb-10 relative max-w-8xl md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="relative w-full h-auto">
        <video
          src="/videoinitial.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto shadow-2xl"
        ></video>
      </div>
    </div>
  );
};
