"use client"
import Image from "next/image";

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const Hero = () => {
  return (
    <div className="mt-10 relative max-w-5xl mx-auto">
      <img
        src="./tempShot.png"
        className="rounded-xl"
        alt="Image Description"
      />
      </div>
  );
};