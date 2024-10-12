import React from "react";

interface ReadOnlyVideoProps {
  videoUrl?: string;
}

export default function ReadOnlyVideo({ videoUrl }: ReadOnlyVideoProps) {
  if (!videoUrl) {
    // Return null or a placeholder component
    return (
      <div className="w-full h-[512px] bg-gray-200 rounded-lg flex items-center justify-center">
        {/* Placeholder content when video is not available */}
        <p>No video available.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <video
        className="w-full h-[512px] rounded-lg object-cover"
        controls
        src={videoUrl}
      />
    </div>
  );
}
