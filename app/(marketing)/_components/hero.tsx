"use client";

import Image from "next/image";
import { FC } from "react";

export const Hero: FC = () => {
  return (
    <div className="mt-10 mb-10 relative max-w-8xl md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="relative w-full h-auto">
        <Image
          src="/herotemp.png" // Replace with your actual image path
          alt="Product Image"
          width={1200} // Set your desired width
          height={1000} // Set your desired height
          className="w-full h-auto shadow-2xl"
        />
      </div>
    </div>
  );
};
