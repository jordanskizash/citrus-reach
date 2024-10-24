"use client";

import { FC, useEffect, useRef } from "react";

export const Hero: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Function to handle video loading and playback
    const initVideo = async () => {
      if (videoRef.current) {
        try {
          // Set video properties
          videoRef.current.playsInline = true;
          videoRef.current.muted = true;
          
          // Explicitly load and play the video
          await videoRef.current.load();
          await videoRef.current.play();
        } catch (err) {
          console.error("Video autoplay failed:", err);
        }
      }
    };

    initVideo();
  }, []);

  return (
    <div className="mt-10 mb-10 relative max-w-8xl md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative w-full h-auto">
        <video
          ref={videoRef}
          className="w-full h-auto shadow-2xl"
          playsInline
          muted
          loop
          preload="auto"
        >
          <source src="/videoinitial.webm" type="video/webm" />
          <source src="/videoinitial.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};